import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TRASH_ENTITIES, type TrashRow } from "@/lib/trashEntities";
import { sanitizeIlikeTerm } from "@/lib/utils";

interface TrashItem {
  id: string;
  entity_type: string;
  entity_label: string;
  label: string;
  deleted_at: string;
  deleted_by: string | null;
  deleted_by_name: string | null;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  // Owner-only, matches RLS: only the owner's session can actually see rows
  // where deleted_at is not null (see migration 014) — this check is
  // defense-in-depth, not the only enforcement.
  if (profile?.role !== "owner") {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
  }

  const type = req.nextUrl.searchParams.get("type");
  const q = req.nextUrl.searchParams.get("q")?.trim();

  const entityKeys =
    type && TRASH_ENTITIES[type] ? [type] : Object.keys(TRASH_ENTITIES);

  const sanitizedQ = q ? sanitizeIlikeTerm(q) : undefined;

  const results = await Promise.all(
    entityKeys.map(async (key) => {
      const cfg = TRASH_ENTITIES[key];
      let query = supabase
        .from(cfg.table)
        .select(cfg.selectColumns)
        .not("deleted_at", "is", null);

      if (sanitizedQ) {
        const orFilter = cfg.searchColumns
          .map((col) => `${col}.ilike.%${sanitizedQ}%`)
          .join(",");
        query = query.or(orFilter);
      }

      const { data, error } = await query
        .order("deleted_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error(`[admin/trash] ${key} query failed:`, error.message);
        return [] as TrashItem[];
      }

      return ((data ?? []) as unknown as TrashRow[]).map(
        (row): TrashItem => ({
          id: row.id as string,
          entity_type: key,
          entity_label: cfg.getEntityLabel?.(row) ?? cfg.label,
          label: cfg.getLabel(row),
          deleted_at: row.deleted_at as string,
          deleted_by: (row.deleted_by as string | null) ?? null,
          deleted_by_name: null,
        }),
      );
    }),
  );

  const items = results.flat();

  const deleterIds = [
    ...new Set(
      items.map((i) => i.deleted_by).filter((id): id is string => !!id),
    ),
  ];
  const nameMap: Record<string, string> = {};
  if (deleterIds.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", deleterIds);
    for (const p of profiles ?? []) {
      nameMap[p.id] =
        [p.first_name, p.last_name].filter(Boolean).join(" ") || "Tuntematon";
    }
  }

  const withNames = items.map((i) => ({
    ...i,
    deleted_by_name: i.deleted_by
      ? (nameMap[i.deleted_by] ?? "Tuntematon")
      : null,
  }));

  withNames.sort(
    (a, b) =>
      new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime(),
  );

  return NextResponse.json({ items: withNames });
}
