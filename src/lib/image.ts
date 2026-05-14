/**
 * Backend stores photo paths as bare strings (PhotoEntity.photo).
 * They might be:
 *   - Absolute URLs (http://..., https://...) — use as-is
 *   - Relative paths served by /api/v1/fileView/{filename}
 *   - null/empty — show placeholder
 *
 * This helper normalizes them all to a usable <img src>.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

const PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23ede9fe'/><text x='100' y='105' text-anchor='middle' fill='%237c3aed' font-family='sans-serif' font-size='14'>No image</text></svg>";

export function resolvePhotoUrl(raw?: string | null): string {
  if (!raw) return PLACEHOLDER;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("data:")) return raw;
  // Treat as relative file id served by the file controller.
  return `${API_BASE}/fileView/${encodeURIComponent(raw)}`;
}
