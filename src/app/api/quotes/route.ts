import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity";
import { softDelete } from "@/lib/softDelete";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { supabase, user, profile };
}

export async function GET(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user)
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");
  const customerId = req.nextUrl.searchParams.get("customer_id");
  const isStaff = ["owner", "admin", "employee"].includes(profile?.role ?? "");

  let query = supabase
    .from("quotes")
    .select(
      `
      id, title, status, amount, valid_until, notes, created_at, company_id,
      customers(id, first_name, last_name, email, user_id),
      companies(id, name)
    `,
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (!isStaff) {
    // Customers see their own quotes via the RLS customer_own_quotes policy
    // We additionally filter by user's customer record
    const { data: customerRecord } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!customerRecord) return NextResponse.json({ quotes: [] });
    query = query.eq("customer_id", customerRecord.id);
  }

  if (status) query = query.eq("status", status);
  if (customerId && isStaff) query = query.eq("customer_id", customerId);

  const { data, error } = await query.limit(100);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ quotes: data });
}

export async function POST(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user || !["owner", "admin", "employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.title)
    return NextResponse.json({ error: "Otsikko vaaditaan" }, { status: 400 });

  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({ ...body, status: body.status ?? "draft" })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(supabase, user.id, "quote_created", {
    quote_id: quote.id,
    title: quote.title,
  });

  // If status is 'sent', notify the customer. Uses the admin client because the
  // caller (staff) is not the notification's recipient — RLS's own_notifications
  // policy would otherwise silently block this cross-user insert.
  if (quote.status === "sent" && quote.customer_id) {
    const adminDb = createAdminClient();
    const { data: customer } = await adminDb
      .from("customers")
      .select("user_id, first_name")
      .eq("id", quote.customer_id)
      .single();
    if (customer?.user_id) {
      const { error: notifyError } = await adminDb
        .from("notifications")
        .insert({
          user_id: customer.user_id,
          type: "quote",
          title: "Uusi tarjous saapunut",
          body: `Olet saanut uuden tarjouksen: "${quote.title}"`,
          href: `/portaali/tarjoukset/${quote.id}`,
        });
      if (notifyError)
        console.error("Failed to notify customer of new quote:", notifyError);
    }
  }

  return NextResponse.json({ quote }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user)
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id vaaditaan" }, { status: 400 });

  const isStaff = ["owner", "admin", "employee"].includes(profile?.role ?? "");

  if (!isStaff) {
    const keys = Object.keys(updates);
    if (!keys.every((k) => k === "status")) {
      return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
    }
    if (!["accepted", "rejected"].includes(updates.status)) {
      return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
    }
  }

  const { data: quote, error } = await supabase
    .from("quotes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  if (updates.status) {
    const eventMap: Record<string, string> = {
      sent: "quote_sent",
      accepted: "quote_accepted",
      rejected: "quote_rejected",
    };
    const eventType = eventMap[updates.status];
    if (eventType)
      await logActivity(supabase, user.id, eventType, {
        quote_id: quote.id,
        title: quote.title,
      });
  }

  // When quote is sent → notify customer (admin client: cross-user insert, see POST above)
  if (updates.status === "sent" && quote.customer_id) {
    const notifyAdminDb = createAdminClient();
    const { data: customer } = await notifyAdminDb
      .from("customers")
      .select("user_id")
      .eq("id", quote.customer_id)
      .single();
    if (customer?.user_id) {
      const { error: notifyError } = await notifyAdminDb
        .from("notifications")
        .insert({
          user_id: customer.user_id,
          type: "quote",
          title: "Tarjous lähetetty",
          body: `Tarjous "${quote.title}" on nyt saatavilla`,
          href: `/portaali/tarjoukset/${quote.id}`,
        });
      if (notifyError)
        console.error("Failed to notify customer of sent quote:", notifyError);
    }
  }

  // When quote is accepted → auto-create project. Uses the admin client because this
  // must succeed regardless of whether staff or the customer themselves triggered the
  // acceptance, and customers only have SELECT (not INSERT) RLS access on projects/notifications.
  if (updates.status === "accepted" && quote.customer_id) {
    const adminDb = createAdminClient();
    const { data: existingProject } = await adminDb
      .from("projects")
      .select("id")
      .eq("quote_id", id)
      .single();

    if (!existingProject) {
      const { data: newProject, error: projectError } = await adminDb
        .from("projects")
        .insert({
          customer_id: quote.customer_id,
          quote_id: id,
          name: quote.title,
          status: "planning",
          budget: quote.amount,
          progress_pct: 0,
        })
        .select()
        .single();

      if (projectError || !newProject) {
        console.error(
          "Failed to auto-create project for accepted quote",
          id,
          projectError,
        );
        return NextResponse.json({ quote, project: null });
      }

      // Notify owner/admin that a project was created
      const { data: owners } = await adminDb
        .from("profiles")
        .select("id")
        .in("role", ["owner", "admin"]);

      if (owners) {
        await adminDb.from("notifications").insert(
          owners.map((o) => ({
            user_id: o.id,
            type: "project",
            title: "Uusi projekti luotu",
            body: `Tarjous "${quote.title}" hyväksyttiin — projekti luotu automaattisesti`,
            href: `/portaali/projektit/${newProject.id}`,
          })),
        );
      }

      // Notify customer that their project started
      const { data: customer } = await adminDb
        .from("customers")
        .select("user_id")
        .eq("id", quote.customer_id)
        .single();
      if (customer?.user_id) {
        await adminDb.from("notifications").insert({
          user_id: customer.user_id,
          type: "project",
          title: "Projektisi on aloitettu",
          body: `Projekti "${newProject.name}" on nyt suunnitteluvaiheessa`,
          href: `/portaali/projektit/${newProject.id}`,
        });
      }

      return NextResponse.json({ quote, project: newProject });
    }
  }

  return NextResponse.json({ quote });
}

export async function DELETE(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user || !["owner", "admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id vaaditaan" }, { status: 400 });

  const { data: quote } = await supabase
    .from("quotes")
    .select("title")
    .eq("id", id)
    .single();

  const { error } = await softDelete(supabase, "quotes", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity(supabase, user.id, "quote_deleted", {
    quote_id: id,
    title: quote?.title,
  });
  return NextResponse.json({ success: true });
}
