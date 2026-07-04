import { describe, it, expect, afterAll } from "vitest";
import {
  adminClient,
  createTestUser,
  signInAs,
  signInForCookie,
  TestRegistry,
  APP_URL,
} from "./helpers";

describe("Soft-delete + Trash", () => {
  const registry = new TestRegistry();
  afterAll(() => registry.cleanup());

  describe("soft-delete basics", () => {
    it("soft-deleting a customer sets deleted_at/deleted_by and hides it from the normal staff list", async () => {
      const owner = await createTestUser(registry, "trash-owner1", {
        role: "owner",
        withCustomerRecord: false,
      });
      const target = await createTestUser(registry, "trash-target1");

      const ownerClient = await signInAs(owner);
      const { error: updateError } = await ownerClient
        .from("customers")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", target.customerId);
      expect(
        updateError,
        "owner must be able to soft-delete a live row",
      ).toBeNull();

      const admin = adminClient();
      const { data: row } = await admin
        .from("customers")
        .select("deleted_at, deleted_by")
        .eq("id", target.customerId)
        .single();
      expect(row?.deleted_at).not.toBeNull();
      expect(
        row?.deleted_by,
        "deleted_by must be server-set from the caller, not left null/forged",
      ).toBe(owner.id);

      // A normal staff list query (with the app's own deleted_at filter) must
      // not include it.
      const { data: normalList } = await ownerClient
        .from("customers")
        .select("id")
        .is("deleted_at", null)
        .eq("id", target.customerId);
      expect(normalList).toEqual([]);
    });

    it("restoring clears deleted_at and deleted_by, and the row reappears", async () => {
      const owner = await createTestUser(registry, "trash-owner2", {
        role: "owner",
        withCustomerRecord: false,
      });
      const target = await createTestUser(registry, "trash-target2");
      const admin = adminClient();
      await admin
        .from("customers")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", target.customerId);

      const ownerClient = await signInAs(owner);
      const { error: restoreError } = await ownerClient
        .from("customers")
        .update({ deleted_at: null })
        .eq("id", target.customerId);
      expect(restoreError).toBeNull();

      const { data: row } = await admin
        .from("customers")
        .select("deleted_at, deleted_by")
        .eq("id", target.customerId)
        .single();
      expect(row?.deleted_at).toBeNull();
      expect(row?.deleted_by, "restore must clear deleted_by too").toBeNull();
    });
  });

  describe("Trash is owner-only — RLS, not just UI", () => {
    it("a non-owner staff member cannot restore an already-trashed row", async () => {
      const admin_ = await createTestUser(registry, "trash-admin1", {
        role: "admin",
        withCustomerRecord: false,
      });
      const target = await createTestUser(registry, "trash-target3");
      const admin = adminClient();
      await admin
        .from("customers")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", target.customerId);

      const adminClientSession = await signInAs(admin_);
      const { data, error } = await adminClientSession
        .from("customers")
        .update({ deleted_at: null })
        .eq("id", target.customerId)
        .select();
      // RLS silently returns zero affected rows rather than a hard error —
      // either is acceptable, but the row must NOT actually be restored.
      expect(error ? true : (data ?? []).length === 0).toBe(true);

      const { data: row } = await admin
        .from("customers")
        .select("deleted_at")
        .eq("id", target.customerId)
        .single();
      expect(
        row?.deleted_at,
        "a non-owner staff member must never be able to restore a trashed row",
      ).not.toBeNull();
    });

    it("a non-owner staff member cannot hard-delete a LIVE row directly (the exact bypass this migration closes)", async () => {
      const admin_ = await createTestUser(registry, "trash-admin2", {
        role: "admin",
        withCustomerRecord: false,
      });
      const target = await createTestUser(registry, "trash-target4");

      const adminClientSession = await signInAs(admin_);
      const { error } = await adminClientSession
        .from("customers")
        .delete()
        .eq("id", target.customerId);

      // A blocked RLS DELETE matches zero rows silently (no error) — that's
      // normal Postgres behavior, not a bug. The only thing that actually
      // matters is that the row is still there.
      void error;
      const admin = adminClient();
      const { data: stillExists } = await admin
        .from("customers")
        .select("id")
        .eq("id", target.customerId)
        .maybeSingle();
      expect(
        stillExists,
        "if this ever regresses to a single FOR ALL policy, a live row becomes hard-deletable by any staff member",
      ).not.toBeNull();
    });

    it("even the owner cannot hard-delete a row that isn't already trashed", async () => {
      const owner = await createTestUser(registry, "trash-owner3", {
        role: "owner",
        withCustomerRecord: false,
      });
      const target = await createTestUser(registry, "trash-target5");

      const ownerClient = await signInAs(owner);
      await ownerClient.from("customers").delete().eq("id", target.customerId);

      const admin = adminClient();
      const { data: stillExists } = await admin
        .from("customers")
        .select("id")
        .eq("id", target.customerId)
        .maybeSingle();
      expect(
        stillExists,
        "permanent delete must require the row to already be in the trash, even for the owner",
      ).not.toBeNull();
    });

    it("the owner CAN hard-delete an already-trashed row", async () => {
      const owner = await createTestUser(registry, "trash-owner4", {
        role: "owner",
        withCustomerRecord: false,
      });
      const target = await createTestUser(registry, "trash-target6");
      const admin = adminClient();
      await admin
        .from("customers")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", target.customerId);

      const ownerClient = await signInAs(owner);
      const { error } = await ownerClient
        .from("customers")
        .delete()
        .eq("id", target.customerId);
      expect(error).toBeNull();

      const { data: stillExists } = await admin
        .from("customers")
        .select("id")
        .eq("id", target.customerId)
        .maybeSingle();
      expect(stillExists).toBeNull();
      // Already gone — don't let afterAll cleanup try to delete it again.
      registry.customerIds = registry.customerIds.filter(
        (id) => id !== target.customerId,
      );
    });
  });

  describe("customers never see their own trashed data", () => {
    it("a customer cannot see their own quote once it's trashed", async () => {
      const user = await createTestUser(registry, "trash-cust1");
      const admin = adminClient();
      const { data: quote } = await admin
        .from("quotes")
        .insert({
          customer_id: user.customerId,
          title: "Trash visibility test",
          status: "sent",
          amount: 100,
        })
        .select()
        .single();
      registry.quoteIds.push(quote!.id);

      const client = await signInAs(user);
      const { data: before } = await client
        .from("quotes")
        .select("id")
        .eq("id", quote!.id);
      expect(before?.length).toBe(1);

      await admin
        .from("quotes")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", quote!.id);

      const { data: after } = await client
        .from("quotes")
        .select("id")
        .eq("id", quote!.id);
      expect(after).toEqual([]);
    });
  });

  describe("guard_soft_delete trigger", () => {
    it("a customer cannot soft-delete their own row via their self-service update policy", async () => {
      const user = await createTestUser(registry, "trash-selfdelete");
      const client = await signInAs(user);

      const { error } = await client
        .from("customers")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", user.customerId);
      expect(
        error,
        "only staff may transition deleted_at — a customer's own update policy must not be usable to self-trash",
      ).not.toBeNull();

      const admin = adminClient();
      const { data: row } = await admin
        .from("customers")
        .select("deleted_at")
        .eq("id", user.customerId)
        .single();
      expect(row?.deleted_at).toBeNull();
    });
  });

  describe("cascade on delete (customer -> project -> tasks)", () => {
    it("soft-deleting a customer via the real DELETE route cascades to their project's tasks", async () => {
      const staff = await createTestUser(registry, "trash-cascade-staff", {
        role: "owner",
        withCustomerRecord: false,
      });
      const customer = await createTestUser(registry, "trash-cascade-cust");
      const admin = adminClient();

      const { data: project } = await admin
        .from("projects")
        .insert({
          customer_id: customer.customerId,
          name: "Cascade test project",
          status: "planning",
          progress_pct: 0,
        })
        .select()
        .single();
      registry.projectIds.push(project!.id);

      const { data: task } = await admin
        .from("tasks")
        .insert({ title: "Cascade test task", project_id: project!.id })
        .select()
        .single();

      const cookie = await signInForCookie(staff);
      const res = await fetch(
        `${APP_URL}/api/crm/customers/${customer.customerId}`,
        { method: "DELETE", headers: { Cookie: cookie } },
      );
      expect(res.status).toBe(200);

      const { data: customerRow } = await admin
        .from("customers")
        .select("deleted_at")
        .eq("id", customer.customerId)
        .single();
      expect(customerRow?.deleted_at).not.toBeNull();

      const { data: projectRow } = await admin
        .from("projects")
        .select("deleted_at")
        .eq("id", project!.id)
        .single();
      expect(
        projectRow?.deleted_at,
        "trashing a customer must cascade to their projects",
      ).not.toBeNull();

      const { data: taskRow } = await admin
        .from("tasks")
        .select("deleted_at")
        .eq("id", task!.id)
        .single();
      expect(
        taskRow?.deleted_at,
        "the cascade must be transitive: customer -> project -> the project's own tasks",
      ).not.toBeNull();

      await admin.from("tasks").delete().eq("id", task!.id);
    });
  });

  describe("Trash API is owner-only", () => {
    it("a non-owner staff member gets denied by the Trash list/restore/permanent-delete routes", async () => {
      const admin_ = await createTestUser(registry, "trash-api-admin", {
        role: "admin",
        withCustomerRecord: false,
      });
      const cookie = await signInForCookie(admin_);

      const listRes = await fetch(`${APP_URL}/api/admin/trash`, {
        headers: { Cookie: cookie },
      });
      expect(listRes.status).toBe(403);

      const restoreRes = await fetch(`${APP_URL}/api/admin/trash/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({
          entity_type: "customers",
          id: "00000000-0000-0000-0000-000000000000",
        }),
      });
      expect(restoreRes.status).toBe(403);

      const permDeleteRes = await fetch(
        `${APP_URL}/api/admin/trash/permanent-delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({
            entity_type: "customers",
            id: "00000000-0000-0000-0000-000000000000",
          }),
        },
      );
      expect(permDeleteRes.status).toBe(403);
    });

    it("the owner can list, restore, and permanently delete via the Trash API", async () => {
      const owner = await createTestUser(registry, "trash-api-owner", {
        role: "owner",
        withCustomerRecord: false,
      });
      const target = await createTestUser(registry, "trash-api-target");
      const admin = adminClient();
      await admin
        .from("customers")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", target.customerId);

      const cookie = await signInForCookie(owner);

      const listRes = await fetch(`${APP_URL}/api/admin/trash?type=customers`, {
        headers: { Cookie: cookie },
      });
      expect(listRes.status).toBe(200);
      const listBody = await listRes.json();
      expect(
        (listBody.items ?? []).some(
          (i: { id: string }) => i.id === target.customerId,
        ),
      ).toBe(true);

      const restoreRes = await fetch(`${APP_URL}/api/admin/trash/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({
          entity_type: "customers",
          id: target.customerId,
        }),
      });
      expect(restoreRes.status).toBe(200);

      const { data: restored } = await admin
        .from("customers")
        .select("deleted_at")
        .eq("id", target.customerId)
        .single();
      expect(restored?.deleted_at).toBeNull();

      // Trash it again, then permanently delete via the API.
      await admin
        .from("customers")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", target.customerId);

      const permDeleteRes = await fetch(
        `${APP_URL}/api/admin/trash/permanent-delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({
            entity_type: "customers",
            id: target.customerId,
          }),
        },
      );
      expect(permDeleteRes.status).toBe(200);

      const { data: gone } = await admin
        .from("customers")
        .select("id")
        .eq("id", target.customerId)
        .maybeSingle();
      expect(gone).toBeNull();
      registry.customerIds = registry.customerIds.filter(
        (id) => id !== target.customerId,
      );
    });
  });

  describe("permanent delete handles the bidirectional quotes<->projects link", () => {
    it("permanently deleting a project with an accepted (linked) quote succeeds", async () => {
      const owner = await createTestUser(registry, "trash-pd-owner", {
        role: "owner",
        withCustomerRecord: false,
      });
      const customer = await createTestUser(registry, "trash-pd-cust");
      const admin = adminClient();

      const { data: quote } = await admin
        .from("quotes")
        .insert({
          customer_id: customer.customerId,
          title: "Permanent-delete FK test",
          status: "accepted",
          amount: 500,
        })
        .select()
        .single();

      const { data: project } = await admin
        .from("projects")
        .insert({
          customer_id: customer.customerId,
          quote_id: quote!.id,
          name: "Permanent-delete FK test project",
          status: "planning",
          progress_pct: 0,
        })
        .select()
        .single();

      // Mirror the real accepted-quote flow: the quote also points back at
      // its project (bidirectional link).
      await admin
        .from("quotes")
        .update({ project_id: project!.id })
        .eq("id", quote!.id);

      // Trash both, then permanently delete the project via the real API.
      await admin
        .from("projects")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", project!.id);
      await admin
        .from("quotes")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", quote!.id);

      const cookie = await signInForCookie(owner);
      const res = await fetch(`${APP_URL}/api/admin/trash/permanent-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ entity_type: "projects", id: project!.id }),
      });
      const body = await res.json().catch(() => ({}));
      expect(res.status, JSON.stringify(body)).toBe(200);

      const { data: projectGone } = await admin
        .from("projects")
        .select("id")
        .eq("id", project!.id)
        .maybeSingle();
      expect(projectGone).toBeNull();

      const { data: quoteGone } = await admin
        .from("quotes")
        .select("id")
        .eq("id", quote!.id)
        .maybeSingle();
      expect(
        quoteGone,
        "the linked quote must be purged too, not left orphaned",
      ).toBeNull();
    });
  });
});
