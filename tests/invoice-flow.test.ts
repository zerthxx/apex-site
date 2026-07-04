import { describe, it, expect, afterAll } from "vitest";
import {
  adminClient,
  createTestUser,
  signInForCookie,
  APP_URL,
  TestRegistry,
} from "./helpers";

// The checkout/refund routes import src/lib/stripe.ts, which now throws at module
// load if STRIPE_SECRET_KEY is unset — meaning the *entire route* 500s for every
// request, including ones that should be rejected by an auth check that never gets
// to run. Skip those specific tests (with a clear message) rather than fail on an
// environment-configuration gap; the invoice-visibility test below needs no Stripe key.
const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;

describe("invoice flow", () => {
  const registry = new TestRegistry();
  afterAll(() => registry.cleanup());

  it("a customer can view their own invoice but not another customer's", async () => {
    const customerA = await createTestUser(registry, "invA");
    const customerB = await createTestUser(registry, "invB");
    const admin = adminClient();

    const { data: invoice } = await admin
      .from("invoices")
      .insert({
        customer_id: customerA.customerId,
        invoice_number: "TEST-001",
        amount: 300,
        status: "sent",
      })
      .select()
      .single();
    registry.invoiceIds.push(invoice!.id);

    const cookieA = await signInForCookie(customerA);
    const resA = await fetch(`${APP_URL}/api/invoices`, {
      headers: { Cookie: cookieA },
    });
    const bodyA = await resA.json();
    expect(
      bodyA.invoices.some((i: { id: string }) => i.id === invoice!.id),
    ).toBe(true);

    const cookieB = await signInForCookie(customerB);
    const resB = await fetch(`${APP_URL}/api/invoices`, {
      headers: { Cookie: cookieB },
    });
    const bodyB = await resB.json();
    expect(
      bodyB.invoices.some((i: { id: string }) => i.id === invoice!.id),
    ).toBe(false);
  });

  it.skipIf(!stripeConfigured)("checkout session creation rejects a customer paying someone else's invoice", async () => {
    const owner = await createTestUser(registry, "checkoutOwner");
    const intruder = await createTestUser(registry, "checkoutIntruder");
    const admin = adminClient();

    const { data: invoice } = await admin
      .from("invoices")
      .insert({
        customer_id: owner.customerId,
        invoice_number: "TEST-002",
        amount: 400,
        status: "sent",
      })
      .select()
      .single();
    registry.invoiceIds.push(invoice!.id);

    const cookie = await signInForCookie(intruder);
    const res = await fetch(`${APP_URL}/api/payments/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ invoice_id: invoice!.id }),
    });
    expect(res.status).toBe(403);
  });

  it.skipIf(!stripeConfigured)("checkout session creation succeeds for the invoice's own customer (creates a real Stripe Checkout session, no payment)", async () => {
    const customer = await createTestUser(registry, "checkoutSelf");
    const admin = adminClient();

    const { data: invoice } = await admin
      .from("invoices")
      .insert({
        customer_id: customer.customerId,
        invoice_number: "TEST-003",
        amount: 100,
        status: "sent",
      })
      .select()
      .single();
    registry.invoiceIds.push(invoice!.id);

    const cookie = await signInForCookie(customer);
    const res = await fetch(`${APP_URL}/api/payments/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ invoice_id: invoice!.id }),
    });
    const body = await res.json();
    expect(res.status, JSON.stringify(body)).toBe(200);
    expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com/);

    // Clean up the payment row this created (checkout route inserts a 'pending' payment).
    await admin.from("payments").delete().eq("invoice_id", invoice!.id);
  });

  it.skipIf(!stripeConfigured)("refund route rejects non-admin staff and customers", async () => {
    const customer = await createTestUser(registry, "refundCustomer");
    const cookie = await signInForCookie(customer);
    const res = await fetch(`${APP_URL}/api/payments/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        payment_id: "00000000-0000-0000-0000-000000000000",
      }),
    });
    expect(res.status).toBe(403);
  });
});
