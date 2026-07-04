import { describe, it, expect, afterAll } from "vitest";
import {
  adminClient,
  createTestUser,
  testEmail,
  TestRegistry,
  APP_URL,
} from "./helpers";

async function submitQuoteRequest(
  email: string,
  overrides: Record<string, unknown> = {},
) {
  return fetch(`${APP_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nimi: "Testi Henkilo",
      sahkoposti: email,
      palvelu: "verkkosivut",
      viesti: "Testaan tarjouspyyntolomaketta liidien bugin regressiotestissa.",
      honeypot: "",
      ...overrides,
    }),
  });
}

describe("Leads (Liidit) flow — quote request always logged", () => {
  const registry = new TestRegistry();
  afterAll(() => registry.cleanup());

  it("a brand-new quote request creates a lead customer AND a lead_requests row", async () => {
    const email = testEmail("newlead");
    registry.emails.push(email);

    const res = await submitQuoteRequest(email);
    expect(res.status).toBe(200);

    const admin = adminClient();
    const { data: customer } = await admin
      .from("customers")
      .select("id, status")
      .eq("email", email)
      .single();
    expect(customer?.status).toBe("lead");
    if (customer) registry.customerIds.push(customer.id);

    const { data: requests } = await admin
      .from("lead_requests")
      .select("id, customer_id, email")
      .eq("email", email);
    expect(
      requests?.length,
      "migration 012 not applied, or lead_requests insert failed — run supabase/migrations/012_lead_requests.sql",
    ).toBe(1);
    expect(requests?.[0].customer_id).toBe(customer?.id);
  });

  it("an existing ACTIVE (paying) customer's new request is logged without changing their status", async () => {
    const user = await createTestUser(registry, "activerequest");
    // createTestUser creates the customer row with status "active" by default.

    const res = await submitQuoteRequest(user.email, {
      viesti: "Haluaisin tarjouksen toisesta projektista, olen jo asiakkaanne.",
    });
    expect(res.status).toBe(200);

    const admin = adminClient();
    const { data: customer } = await admin
      .from("customers")
      .select("status")
      .eq("id", user.customerId)
      .single();
    expect(
      customer?.status,
      "an active customer's status must never be changed by a new quote request",
    ).toBe("active");

    const { data: requests } = await admin
      .from("lead_requests")
      .select("id, customer_id")
      .eq("customer_id", user.customerId);
    expect(
      requests?.length,
      "an active customer's quote request must still be logged to lead_requests so it shows on CRM -> Liidit",
    ).toBe(1);
  });
});
