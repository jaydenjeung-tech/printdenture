import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isDesignPartnerRole, partnerCanAccessOrder } from "@/lib/partner-auth";

export type PartnerApiAuth =
  | { ok: true; userId: string; userEmail: string | null; service: SupabaseClient; isAdmin: boolean }
  | { ok: false; status: number; error: string };

export async function requirePartnerServiceClient(): Promise<PartnerApiAuth> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    return { ok: false, status: 500, error: "Server configuration error" };
  }

  const cookieStore = await cookies();
  const authClient = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
    },
  });

  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return { ok: false, status: 401, error: "Unauthorized" };

  const { data: profile } = await authClient
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin" || !!profile?.is_admin;
  if (!isDesignPartnerRole(profile?.role) && !isAdmin) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return {
    ok: true,
    userId: user.id,
    userEmail: user.email ?? null,
    service: createClient(url, serviceKey),
    isAdmin,
  };
}

export async function requirePartnerOrderAccess(
  orderId: string
): Promise<
  | (PartnerApiAuth & {
      ok: true;
      order: {
        id: string;
        user_id: string;
        product_name: string;
        quantity: number;
        shade: string | null;
        tooth_number: string | null;
        tooth_numbers: number[] | null;
        notes: string | null;
        due_date: string | null;
        case_number: number | null;
        case_files: unknown;
        stl_file_path: string | null;
        design_outsource_status: string | null;
        design_outsource_email: string | null;
        design_outsource_partner_id: string | null;
        design_outsource_notes: string | null;
        design_deliverables: unknown;
        created_at: string;
      };
    })
  | { ok: false; status: number; error: string }
> {
  const auth = await requirePartnerServiceClient();
  if (!auth.ok) return auth;

  const { data: order, error } = await auth.service
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    return { ok: false, status: 500, error: error.message };
  }
  if (!order) {
    return { ok: false, status: 404, error: "Case not found" };
  }

  if (!auth.isAdmin && !partnerCanAccessOrder(order, auth.userId, auth.userEmail)) {
    return { ok: false, status: 403, error: "You do not have access to this case" };
  }

  return { ...auth, order };
}

/** Resolve design_partner user id from email when admin sends a case. */
export async function findDesignPartnerIdByEmail(
  service: SupabaseClient,
  email: string
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const { data: listData } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const authUser = listData?.users?.find((u) => u.email?.toLowerCase() === normalized);
  if (!authUser) return null;

  const { data: profile } = await service
    .from("profiles")
    .select("role")
    .eq("id", authUser.id)
    .single();

  if (!isDesignPartnerRole(profile?.role)) return null;
  return authUser.id;
}
