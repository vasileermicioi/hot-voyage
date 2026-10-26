/** Stable JSON error shapes + logging hook (kept for 04 observability). */

export interface ApiErrorBody {
  error: string;
  fields?: Record<string, string>;
}

export function errorJson(status: number, body: ApiErrorBody): Response {
  return Response.json(body, { status });
}

/** Single log hook for API errors; 04 will attach structured observability here. */
export function logApi(route: string, status: number, message: string): void {
  console.log(JSON.stringify({ scope: "api", route, status, message }));
}
