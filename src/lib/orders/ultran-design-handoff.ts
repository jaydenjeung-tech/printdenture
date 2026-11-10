import type { SupabaseClient } from "@supabase/supabase-js";
import { parseStoredCaseFiles } from "@/lib/products/case-files";
import {
  dentureDesignJaw,
  dentureDesignShade,
  formatDentureDesignWorkOrder,
  isDentureDesignProduct,
} from "@/lib/products/denture-design";
import { isMissingClinicalColumn } from "@/lib/orders/clinical-notes";

const SIGNED_URL_SECONDS = 60 * 60;

function ultranConfig() {
  const baseUrl = (process.env.ULTRAN_OS_URL ?? "").trim().replace(/\/$/, "");
  const apiKey = (process.env.ULTRAN_OS_INGEST_KEY ?? "").trim();
  return { baseUrl, apiKey };
}

async function saveHandoff(
  supabase: SupabaseClient,
  orderId: string,
  patch: Record<string, string | null>
) {
  const first = await supabase.from("orders").update(patch).eq("id", orderId);
  if (!first.error) return;
  if (!isMissingClinicalColumn(first.error) && !/ultran_/i.test(first.error.message ?? "")) return;
  const note = patch.ultran_os_number
    ? `Ultran OS: ${patch.ultran_os_number}`
    : patch.ultran_handoff_error
      ? `Ultran handoff: ${patch.ultran_handoff_error}`
      : "";
  if (!note) return;
  const { data: row } = await supabase.from("orders").select("notes").eq("id", orderId).maybeSingle();
  const notes = [row?.notes, note].filter(Boolean).join("\n");
  await supabase.from("orders").update({ notes }).eq("id", orderId);
}

/** Paid design-only case → Ultran OS queue. Ultran assigns JBJD. */
export async function handoffDentureDesignOrder(supabase: SupabaseClient, orderId: string) {
  const withHandoff = await supabase
    .from("orders")
    .select("id, case_number, product_name, product_id, user_id, notes, shade, case_files, stl_file_path, ultran_os_number")
    .eq("id", orderId)
    .maybeSingle();
  const fallback = withHandoff.error
    ? await supabase
        .from("orders")
        .select("id, case_number, product_name, product_id, user_id, notes, shade, case_files, stl_file_path")
        .eq("id", orderId)
        .maybeSingle()
    : withHandoff;
  const order = fallback.data as {
    id: string;
    case_number: number | null;
    product_name: string;
    product_id: string | null;
    user_id: string;
    notes: string | null;
    shade: string | null;
    case_files: unknown;
    stl_file_path: string | null;
    ultran_os_number?: string | null;
  } | null;
  if (fallback.error || !order) return;
  if (order.ultran_os_number) return;

  let category: string | null = null;
  if (order.product_id) {
    const { data: product } = await supabase
      .from("products")
      .select("category")
      .eq("id", order.product_id)
      .maybeSingle();
    category = product?.category ?? null;
  }
  if (!isDentureDesignProduct({ name: order.product_name, category })) return;

  const { baseUrl, apiKey } = ultranConfig();
  if (!baseUrl || !apiKey) {
    await saveHandoff(supabase, orderId, {
      ultran_handoff_error: "Ultran OS ingest is not configured.",
    });
    return;
  }

  const { data: rx } = await supabase
    .from("rx")
    .select("arch, shade, occlusion, notes, dentist_name")
    .eq("order_id", orderId)
    .maybeSingle();
  const { data: profile } = await supabase
    .from("profiles")
    .select("practice_name")
    .eq("id", order.user_id)
    .maybeSingle();

  const arch = String(rx?.arch ?? "");
  const jaw = dentureDesignJaw(arch);
  const shade = String(rx?.shade || order.shade || "");
  const occlusion = String(rx?.occlusion ?? "");
  const letter = shade.startsWith("Bleach") ? "Bleach" : shade.slice(0, 1);
  const number = shade.startsWith("Bleach") ? shade.slice("Bleach".length).trim() : shade.slice(1);
  if (!jaw || !dentureDesignShade(letter, number) || !occlusion) {
    await saveHandoff(supabase, orderId, {
      ultran_handoff_error: "Design order is missing arch, shade, or occlusion.",
    });
    return;
  }

  const files = parseStoredCaseFiles(order.case_files);
  if (files.length === 0 && order.stl_file_path) {
    files.push({
      kind: "scan",
      path: order.stl_file_path,
      fileName: order.stl_file_path.split("/").pop() ?? "scan.stl",
    });
  }
  const signed: { file_name: string; file_type: string | null; url: string; kind: string }[] = [];
  for (const file of files) {
    const { data, error: signError } = await supabase.storage
      .from("stl-files")
      .createSignedUrl(file.path, SIGNED_URL_SECONDS);
    if (signError || !data?.signedUrl) {
      await saveHandoff(supabase, orderId, {
        ultran_handoff_error: `Could not sign ${file.fileName}.`,
      });
      return;
    }
    signed.push({
      file_name: file.fileName,
      file_type: null,
      url: data.signedUrl,
      kind: file.kind === "document" ? "worksheet" : "scan",
    });
  }
  if (signed.length === 0) {
    await saveHandoff(supabase, orderId, {
      ultran_handoff_error: "No scan file to send.",
    });
    return;
  }

  const directions = String(rx?.notes || order.notes || "")
    .split("\n")
    .filter((line) => !/^(Patient:|Chart:|Next visit:|Shade note:|Ultran )/i.test(line))
    .join("\n")
    .trim();

  const workOrder = formatDentureDesignWorkOrder({
    arch,
    shadeLetter: letter,
    shadeNumber: number,
    occlusion,
    directions,
  });

  const res = await fetch(`${baseUrl}/api/os/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      source: "printdenture",
      source_case_id: order.id,
      case_number: order.case_number ? String(order.case_number) : order.id.slice(0, 8),
      lab_name: "PrintDenture",
      customer_name: profile?.practice_name ?? null,
      doctor_name: rx?.dentist_name ?? null,
      work_order: workOrder,
      staff_note: "PrintDenture design-only order. Assign to JBJD. Print and milling is No.",
      products: [
        {
          product_name: "Complete Denture",
          tooth_numbers: jaw,
          qty: jaw === "Both jaws" ? 2 : 1,
          shade,
        },
      ],
      files: signed,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    case_id?: string;
    os_number?: string;
  };
  if (!res.ok || !body.case_id || !body.os_number) {
    await saveHandoff(supabase, orderId, {
      ultran_handoff_error: body.error || `Ultran ingest failed (${res.status}).`,
    });
    return;
  }

  await saveHandoff(supabase, orderId, {
    ultran_case_id: body.case_id,
    ultran_os_number: body.os_number,
    ultran_handoff_error: null,
  });
}
