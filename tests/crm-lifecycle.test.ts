import { describe, it, expect, afterAll } from "vitest";
import {
  adminClient,
  anonClient,
  testEmail,
  signInForCookie,
  APP_URL,
  TestRegistry,
} from "./helpers";

describe("CRM lifecycle", () => {
  const registry = new TestRegistry();
  afterAll(() => registry.cleanup());

  it("a self-service signup (no prior CRM contact) becomes visible to staff after first dashboard visit", async () => {
    const email = testEmail("selfheal");
    const password = "SelfHeal12345!";
    registry.emails.push(email);

    const client = anonClient();
    const { data: signUpData, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { first_name: "SelfHeal", last_name: "Customer" } },
    });
    expect(error).toBeNull();
    registry.userIds.push(signUpData.user!.id);

    // Before visiting the dashboard: no customers row should exist yet.
    const admin = adminClient();
    const { data: before } = await admin
      .from("customers")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    expect(before).toBeNull();

    // Visiting /dashboard runs the self-heal logic in (dashboard)/layout.tsx.
    const cookie = await signInForCookie({
      id: signUpData.user!.id,
      email,
      password,
    });
    const res = await fetch(`${APP_URL}/dashboard`, {
      headers: { Cookie: cookie },
      redirect: "manual",
    });
    expect([200, 307, 308]).toContain(res.status);

    const { data: after } = await admin
      .from("customers")
      .select("id, user_id")
      .eq("email", email)
      .maybeSingle();
    expect(
      after,
      "customers row was not created — self-heal INSERT fix regressed",
    ).not.toBeNull();
    expect(after?.user_id).toBe(signUpData.user!.id);
    registry.customerIds.push(after!.id);
  });
});
