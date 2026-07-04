import { describe, it, expect, afterAll } from "vitest";
import { adminClient, anonClient, testEmail, TestRegistry } from "./helpers";

describe("authentication", () => {
  const registry = new TestRegistry();
  afterAll(() => registry.cleanup());

  it("signup creates an auth user and a profile row (role=customer by default)", async () => {
    const email = testEmail("signup");
    registry.emails.push(email);
    const client = anonClient();

    const { data, error } = await client.auth.signUp({
      email,
      password: "SignupTest12345!",
      options: { data: { first_name: "Signup", last_name: "Test" } },
    });
    expect(error).toBeNull();
    expect(data.user).toBeTruthy();
    registry.userIds.push(data.user!.id);

    const admin = adminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", data.user!.id)
      .single();
    expect(profile?.role).toBe("customer");
  });

  it("OTP flow: send writes a code to otp_codes, verify consumes it and rejects reuse", async () => {
    const email = testEmail("otp");
    registry.emails.push(email);

    const res = await fetch(
      `${process.env.TEST_APP_URL ?? "http://localhost:3000"}/api/otp/send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );
    expect(res.status).toBe(200);

    const admin = adminClient();
    const { data: otp } = await admin
      .from("otp_codes")
      .select("code")
      .eq("email", email)
      .single();
    expect(otp?.code).toMatch(/^\d{6}$/);

    const verifyRes = await fetch(
      `${process.env.TEST_APP_URL ?? "http://localhost:3000"}/api/otp/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp!.code }),
      },
    );
    expect(verifyRes.status).toBe(200);

    // Reusing the same (now-consumed) code must fail
    const reuseRes = await fetch(
      `${process.env.TEST_APP_URL ?? "http://localhost:3000"}/api/otp/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp!.code }),
      },
    );
    expect(reuseRes.status).toBe(400);
  });

  it("rejects login with a wrong password", async () => {
    const email = testEmail("wrongpw");
    registry.emails.push(email);
    const admin = adminClient();
    const { data } = await admin.auth.admin.createUser({
      email,
      password: "RealPass12345!",
      email_confirm: true,
    });
    registry.userIds.push(data.user!.id);

    const client = anonClient();
    const { error } = await client.auth.signInWithPassword({
      email,
      password: "WrongPassword!",
    });
    expect(error).not.toBeNull();
  });
});
