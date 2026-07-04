import { describe, it, expect, afterAll } from "vitest";
import {
  adminClient,
  createTestUser,
  signInForCookie,
  APP_URL,
  TestRegistry,
} from "./helpers";

describe("quote -> project flow", () => {
  const registry = new TestRegistry();
  afterAll(() => registry.cleanup());

  it("a customer accepting their own quote auto-creates a project (uses admin client under the hood)", async () => {
    const customer = await createTestUser(registry, "q2p");
    const admin = adminClient();

    const { data: quote } = await admin
      .from("quotes")
      .insert({
        customer_id: customer.customerId,
        title: "Q2P test quote",
        status: "sent",
        amount: 750,
      })
      .select()
      .single();
    registry.quoteIds.push(quote!.id);

    const cookie = await signInForCookie(customer);
    const res = await fetch(`${APP_URL}/api/quotes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ id: quote!.id, status: "accepted" }),
    });
    const body = await res.json();
    expect(res.status, JSON.stringify(body)).toBe(200);
    expect(
      body.project,
      "PATCH /api/quotes did not return a created project",
    ).toBeTruthy();
    registry.projectIds.push(body.project.id);

    const { data: project } = await admin
      .from("projects")
      .select("*")
      .eq("quote_id", quote!.id)
      .single();
    expect(project).not.toBeNull();
    expect(project?.status).toBe("planning");
    expect(Number(project?.budget)).toBe(750);

    // Both the customer and staff should have been notified.
    const { data: custNotif } = await admin
      .from("notifications")
      .select("*")
      .eq("user_id", customer.id)
      .eq("type", "project");
    expect(custNotif?.length).toBeGreaterThan(0);
  });

  it("a customer cannot accept someone else's quote", async () => {
    const owner = await createTestUser(registry, "q2p-owner");
    const intruder = await createTestUser(registry, "q2p-intruder");
    const admin = adminClient();

    const { data: quote } = await admin
      .from("quotes")
      .insert({
        customer_id: owner.customerId,
        title: "Not yours",
        status: "sent",
        amount: 200,
      })
      .select()
      .single();
    registry.quoteIds.push(quote!.id);

    const cookie = await signInForCookie(intruder);
    const res = await fetch(`${APP_URL}/api/quotes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ id: quote!.id, status: "accepted" }),
    });
    // RLS silently no-ops the update for a row not covered by any UPDATE policy match,
    // so status must remain unchanged regardless of the route's response code.
    const { data: after } = await admin
      .from("quotes")
      .select("status")
      .eq("id", quote!.id)
      .single();
    expect(after?.status).not.toBe("accepted");
  });
});
