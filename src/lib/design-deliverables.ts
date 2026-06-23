export type DesignDeliverable = {
  path: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
};

export function parseDesignDeliverables(value: unknown): DesignDeliverable[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const r = row as Record<string, unknown>;
    if (
      typeof r.path !== "string" ||
      typeof r.fileName !== "string" ||
      typeof r.uploadedAt !== "string" ||
      typeof r.uploadedBy !== "string"
    ) {
      return [];
    }
    return [
      {
        path: r.path,
        fileName: r.fileName,
        uploadedAt: r.uploadedAt,
        uploadedBy: r.uploadedBy,
      },
    ];
  });
}

export const DESIGN_DELIVERABLE_ACCEPT = ".stl,.ply,.obj,.zip,.7z,.rar";

export async function downloadDesignDeliverable(filePath: string) {
  const { createAppClient } = await import("@/lib/supabase");
  const supabase = createAppClient();
  const { data } = await supabase.storage.from("stl-files").createSignedUrl(filePath, 60);
  if (data?.signedUrl) window.open(data.signedUrl, "_blank");
}
