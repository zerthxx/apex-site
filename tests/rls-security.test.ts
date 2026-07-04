import { describe, it, expect, afterAll, beforeAll } from "vitest";
import {
  adminClient,
  anonClient,
  createTestUser,
  signInAs,
  TestRegistry,
  type TestUser,
} from "./helpers";

describe("RLS security", () => {
  const registry = new TestRegistry();
  afterAll(() => registry.cleanup());

  describe("privilege escalation (migration 010)", () => {
    it("a customer cannot grant themselves owner/admin role via a direct table update", async () => {
      const user = await createTestUser(registry, "privesc");
      const client = await signInAs(user);

      const { error } = await client
        .from("profiles")
        .update({ role: "owner" })
        .eq("id", user.id);

      // Must be rejected either by the migration-010 trigger (error) or, if the
      // migration hasn't been applied yet, this test documents the gap explicitly.
      const admin = adminClient();
      const { data: after } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      expect(
        after?.role,
        error
          ? "update was correctly rejected"
          : "CRITICAL: role changed without error — migration 010 is not applied. Run supabase/migrations/010_prevent_rls_column_tampering.sql in the Supabase SQL Editor.",
      ).toBe("customer");
    });

    it("a customer cannot suspend/unsuspend themselves", async () => {
      const user = await createTestUser(registry, "privesc2");
      const client = await signInAs(user);
      await client
        .from("profiles")
        .update({ is_suspended: true })
        .eq("id", user.id);

      const admin = adminClient();
      const { data: after } = await admin
        .from("profiles")
        .select("is_suspended")
        .eq("id", user.id)
        .single();
      expect(
        after?.is_suspended,
        "migration 010 not applied — is_suspended is tamperable",
      ).toBe(false);
    });

    it("a customer cannot bypass the role guard via delete+insert", async () => {
      const user = await createTestUser(registry, "privesc3");
      const client = await signInAs(user);

      // The BEFORE UPDATE trigger only guards UPDATE. If "own_profile" is still
      // FOR ALL with no WITH CHECK, a customer can DELETE their own row (nothing
      // else FK-references profiles.id) and INSERT a fresh one with role='owner',
      // which never touches the trigger at all.
      const { error: deleteError } = await client
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (!deleteError) {
        const { error: insertError } = await client
          .from("profiles")
          .insert({ id: user.id, role: "owner" });
        expect(
          insertError,
          "CRITICAL: customer deleted then re-inserted their own profile with role='owner' — own_profile must be scoped to SELECT/UPDATE only (migration 010, section 4).",
        ).not.toBeNull();
      }

      const admin = adminClient();
      const { data: after } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      expect(after?.role ?? "customer").not.toBe("owner");
    });
  });

  describe("cross-customer data isolation", () => {
    let customerA: TestUser;
    let customerB: TestUser;
    let projectAId: string;

    beforeAll(async () => {
      customerA = await createTestUser(registry, "isoA");
      customerB = await createTestUser(registry, "isoB");

      const admin = adminClient();
      const { data: project } = await admin
        .from("projects")
        .insert({
          customer_id: customerA.customerId,
          name: "Isolation test project",
          status: "planning",
          progress_pct: 0,
        })
        .select()
        .single();
      projectAId = project!.id;
      registry.projectIds.push(projectAId);

      await admin.from("project_comments").insert({
        project_id: projectAId,
        user_id: customerA.id,
        body: "private to A",
      });
    });

    it("customer B cannot read customer A's project via direct table query (RLS)", async () => {
      const clientB = await signInAs(customerB);
      const { data, error } = await clientB
        .from("projects")
        .select("*")
        .eq("id", projectAId);
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it("customer B cannot read customer A's project comments via the API route (IDOR fix)", async () => {
      const cookie = await import("./helpers").then((m) =>
        m.signInForCookie(customerB),
      );
      const appUrl = process.env.TEST_APP_URL ?? "http://localhost:3000";
      const res = await fetch(`${appUrl}/api/projects/${projectAId}/comments`, {
        headers: { Cookie: cookie },
      });
      expect(res.status).toBe(403);
    });

    it("customer A CAN read their own project comments via the API route", async () => {
      const cookie = await import("./helpers").then((m) =>
        m.signInForCookie(customerA),
      );
      const appUrl = process.env.TEST_APP_URL ?? "http://localhost:3000";
      const res = await fetch(`${appUrl}/api/projects/${projectAId}/comments`, {
        headers: { Cookie: cookie },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.comments.length).toBeGreaterThan(0);
    });

    it("customer B cannot read customer A's invoices/quotes via direct table query", async () => {
      const admin = adminClient();
      const { data: quote } = await admin
        .from("quotes")
        .insert({
          customer_id: customerA.customerId,
          title: "A private quote",
          status: "sent",
          amount: 1000,
        })
        .select()
        .single();
      registry.quoteIds.push(quote!.id);

      const clientB = await signInAs(customerB);
      const { data } = await clientB
        .from("quotes")
        .select("*")
        .eq("id", quote!.id);
      expect(data).toEqual([]);
    });
  });

  describe("quote tampering (migration 010)", () => {
    it("a customer cannot change their own quote's amount via a direct table update", async () => {
      const user = await createTestUser(registry, "quotetamper");
      const admin = adminClient();
      const { data: quote } = await admin
        .from("quotes")
        .insert({
          customer_id: user.customerId,
          title: "Tamper test",
          status: "sent",
          amount: 5000,
        })
        .select()
        .single();
      registry.quoteIds.push(quote!.id);

      const client = await signInAs(user);
      await client.from("quotes").update({ amount: 1 }).eq("id", quote!.id);

      const { data: after } = await admin
        .from("quotes")
        .select("amount")
        .eq("id", quote!.id)
        .single();
      expect(
        Number(after?.amount),
        "migration 010 not applied — quote amount is tamperable by the customer",
      ).toBe(5000);
    });

    it("a customer CAN still accept/reject their own quote (status only)", async () => {
      const user = await createTestUser(registry, "quoteaccept");
      const admin = adminClient();
      const { data: quote } = await admin
        .from("quotes")
        .insert({
          customer_id: user.customerId,
          title: "Accept test",
          status: "sent",
          amount: 500,
        })
        .select()
        .single();
      registry.quoteIds.push(quote!.id);

      const client = await signInAs(user);
      const { error } = await client
        .from("quotes")
        .update({ status: "accepted" })
        .eq("id", quote!.id);
      expect(error).toBeNull();

      const { data: after } = await admin
        .from("quotes")
        .select("status")
        .eq("id", quote!.id)
        .single();
      expect(after?.status).toBe("accepted");
    });
  });

  describe("staff access", () => {
    it("staff can read any customer's projects and quotes", async () => {
      const customer = await createTestUser(registry, "staffviewtarget");
      const staff = await createTestUser(registry, "staffviewer", {
        role: "owner",
        withCustomerRecord: false,
      });

      const admin = adminClient();
      const { data: project } = await admin
        .from("projects")
        .insert({
          customer_id: customer.customerId,
          name: "Staff-visible project",
          status: "planning",
          progress_pct: 0,
        })
        .select()
        .single();
      registry.projectIds.push(project!.id);

      const staffClient = await signInAs(staff);
      const { data, error } = await staffClient
        .from("projects")
        .select("*")
        .eq("id", project!.id);
      expect(error).toBeNull();
      expect(data?.length).toBe(1);
    });

    it("a customer (non-staff) cannot read the CRM customers list beyond their own row", async () => {
      const customerA = await createTestUser(registry, "crmisoA");
      const customerB = await createTestUser(registry, "crmisoB");

      const clientB = await signInAs(customerB);
      const { data } = await clientB
        .from("customers")
        .select("*")
        .eq("id", customerA.customerId);
      expect(data).toEqual([]);
    });
  });
});
