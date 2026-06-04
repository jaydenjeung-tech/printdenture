import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type DesignRequest = {
  productCategory: string;
  productName: string;
  shade: string;
  toothNumbers: number[];
  marginType: string;
  occlusion: string;
};

function parseToothNumbers(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((tooth): tooth is number => typeof tooth === "number");
  } catch {
    return [];
  }
}

function buildSummary(payload: DesignRequest) {
  const teeth = payload.toothNumbers.length
    ? payload.toothNumbers.sort((a, b) => a - b).map((tooth) => `#${tooth}`).join(", ")
    : "selected teeth";
  const shade = payload.shade ? ` · Shade ${payload.shade}` : "";
  const margin = payload.marginType ? ` · ${payload.marginType} margin` : "";
  const occlusion = payload.occlusion ? ` · ${payload.occlusion} occlusion` : "";
  return `Dentbird crown proposal for ${teeth} on ${payload.productName}${shade}${margin}${occlusion}.`;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("stl");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "STL file is required." }, { status: 400 });
    }

    const payload: DesignRequest = {
      productCategory: String(formData.get("productCategory") || ""),
      productName: String(formData.get("productName") || "Crown"),
      shade: String(formData.get("shade") || ""),
      toothNumbers: parseToothNumbers(formData.get("toothNumbers")),
      marginType: String(formData.get("marginType") || ""),
      occlusion: String(formData.get("occlusion") || ""),
    };

    if (!payload.productCategory) {
      return NextResponse.json({ error: "Product category is required." }, { status: 400 });
    }

  if (!process.env.DENTBIRD_API_KEY) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const designedFileName = file.name.toLowerCase().endsWith(".stl")
        ? file.name.replace(/\.stl$/i, "-crown.stl")
        : `${file.name}-crown.stl`;

      return NextResponse.json({
        status: "ready",
        provider: "preview",
        summary: buildSummary(payload),
        designedFileName,
        message: "Preview mode is active until Dentbird API credentials are configured.",
      });
    }

    return NextResponse.json(
      { error: "Dentbird API integration is not configured yet." },
      { status: 501 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Design request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
