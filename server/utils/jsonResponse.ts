export function jsonResponse(payload: unknown, status:number = 200): Response {
  return new Response(
    JSON.stringify(payload, (_key, value) => 
      typeof value === 'bigint' ? Number(value) : value
    ), 
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
);
}