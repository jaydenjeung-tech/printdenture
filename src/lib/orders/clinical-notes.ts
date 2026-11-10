/** Patient and shade lines the lab reads with the case, even before dedicated columns exist. */

export function buildClinicalNotes(input: {
  patientName: string;
  patientChart: string;
  nextVisit: string;
  shadeNote: string;
  notes: string;
}): string {
  const lines = [
    input.patientName.trim() ? `Patient: ${input.patientName.trim()}` : "",
    input.patientChart.trim() ? `Chart: ${input.patientChart.trim()}` : "",
    input.nextVisit ? `Next visit: ${input.nextVisit}` : "",
    input.shadeNote.trim() ? `Shade note: ${input.shadeNote.trim()}` : "",
  ].filter(Boolean);
  const body = input.notes.trim();
  if (lines.length === 0) return body;
  if (!body) return lines.join("\n");
  return `${lines.join("\n")}\n\n${body}`;
}

export function isMissingClinicalColumn(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    ["patient_name", "patient_chart", "requested_delivery", "shade_note"].some((column) =>
      message.includes(column)
    )
  );
}
