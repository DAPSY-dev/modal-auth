type LoginConfig = { url: string; serviceRoleKey: string; anonKey: string };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Inject fetch for tests. Never log request bodies, resolved emails, or authentication responses.
export function createUsernameLoginHandler(
  config: LoginConfig,
  fetcher: typeof fetch = fetch,
) {
  const reply = (body: unknown, status = 200) =>
    Response.json(body, {
      status,
      headers: { ...corsHeaders, 'Cache-Control': 'no-store' },
    });

  return async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method !== 'POST')
      return reply({ code: 'method_not_allowed' }, 405);
    if (!config.url || !config.serviceRoleKey || !config.anonKey)
      return reply({ code: 'service_unavailable' }, 503);

    try {
      // Bound streamed input as well as Content-Length to avoid accepting oversized credentials.
      const reader = request.body?.getReader();
      if (!reader) return reply({ code: 'invalid_credentials' }, 400);
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 8192) {
          await reader.cancel();
          return reply({ code: 'invalid_request' }, 413);
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      let body;
      try {
        body = JSON.parse(new TextDecoder().decode(bytes));
      } catch {
        return reply({ code: 'invalid_request' }, 400);
      }
      if (
        !body ||
        typeof body.username !== 'string' ||
        typeof body.password !== 'string'
      ) {
        return reply({ code: 'invalid_credentials' }, 400);
      }
      const username = body.username.trim().toLowerCase();
      if (
        !/^[a-z0-9_]{3,30}$/.test(username) ||
        !body.password ||
        body.password.length > 4096
      ) {
        return reply({ code: 'invalid_credentials' }, 400);
      }

      const lookup = await fetcher(
        `${config.url}/rest/v1/rpc/resolve_username_login`,
        {
          method: 'POST',
          headers: {
            apikey: config.serviceRoleKey,
            Authorization: `Bearer ${config.serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requested_username: username }),
        },
      );
      if (!lookup.ok) return reply({ code: 'service_unavailable' }, 503);
      const resolved = await lookup.json();
      if (!resolved.allowed)
        return reply({ code: 'over_request_rate_limit' }, 429);

      // Unknown names take the same Auth path and return the same error as a wrong password.
      const result = await fetcher(
        `${config.url}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            apikey: config.anonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: resolved.email ?? 'unknown-username@example.invalid',
            password: body.password,
          }),
        },
      );
      const auth = await result.json();
      if (!result.ok) {
        if (result.status === 429)
          return reply({ code: 'over_request_rate_limit' }, 429);
        if (result.status >= 500)
          return reply({ code: 'service_unavailable' }, 503);
        if (
          resolved.email &&
          (auth.error_code ?? auth.code) === 'email_not_confirmed'
        )
          return reply({ code: 'email_not_confirmed' }, 400);
        return reply({ code: 'invalid_credentials' }, 400);
      }
      if (
        !resolved.email ||
        !auth.user?.email_confirmed_at ||
        !auth.access_token ||
        !auth.refresh_token
      ) {
        return reply({ code: 'invalid_credentials' }, 400);
      }
      // Supabase's browser SDK will own persistence and refresh after setSession().
      return reply({
        access_token: auth.access_token,
        refresh_token: auth.refresh_token,
      });
    } catch {
      return reply({ code: 'service_unavailable' }, 503);
    }
  };
}

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Promise<Response>): void;
};

if (typeof Deno !== 'undefined') {
  Deno.serve(
    createUsernameLoginHandler({
      url: Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      anonKey: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    }),
  );
}
