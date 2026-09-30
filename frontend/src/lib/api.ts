import type { InvestigateResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const MAX_EML_BYTES = 10 * 1024 * 1024;

export class ApiError extends Error {}

// POST /api/investigate — multipart upload, field name "file".
export async function investigate(file: File, signal?: AbortSignal): Promise<InvestigateResponse> {
  const body = new FormData();
  body.append("file", file);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/investigate`, { method: "POST", body, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(`Can't reach the analysis server at ${API_URL}. Is the backend running?`);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = json && typeof json.detail === "string" ? json.detail : null;
    throw new ApiError(detail ?? `The server couldn't analyse this email (HTTP ${res.status}).`);
  }
  if (!json || json.status !== "success" || !json.investigation) {
    throw new ApiError("The server returned an unexpected response.");
  }
  return json as InvestigateResponse;
}
