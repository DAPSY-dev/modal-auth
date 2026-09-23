import { describe, expect, it, vi } from 'vitest';
import { createUsernameLoginHandler } from '../../supabase/functions/username-login/index';

const config = { url: 'https://example.supabase.co', anonKey: 'test-anon', serviceRoleKey: 'test-service' };
const request = (username = 'John_Doe', password = 'password') => new Request('https://example.test', {
  method: 'POST', body: JSON.stringify({ username, password }),
});

describe('username login endpoint', () => {
  it('authenticates through Supabase and returns only SDK session tokens', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ allowed: true, email: 'private@example.com' }))
      .mockResolvedValueOnce(Response.json({ access_token: 'access', refresh_token: 'refresh', user: { email: 'private@example.com', email_confirmed_at: '2026-01-01' } }));
    const response = await createUsernameLoginHandler(config, fetcher)(request());
    expect(await response.json()).toEqual({ access_token: 'access', refresh_token: 'refresh' });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(JSON.parse(fetcher.mock.calls[0][1]?.body as string)).toEqual({ requested_username: 'john_doe' });
    expect(JSON.parse(fetcher.mock.calls[1][1]?.body as string)).toEqual({ email: 'private@example.com', password: 'password' });
    expect(fetcher.mock.calls[1][1]?.headers).toEqual({ apikey: 'test-anon', 'Content-Type': 'application/json' });
  });

  it.each([null, 'private@example.com'])('does not reveal an email for failed authentication (%s)', async (email) => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ allowed: true, email }))
      .mockResolvedValueOnce(Response.json({ error_code: 'invalid_credentials', msg: 'internal details' }, { status: 400 }));
    const response = await createUsernameLoginHandler(config, fetcher)(request());
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ code: 'invalid_credentials' });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('preserves email verification and rate limits', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ allowed: true, email: 'private@example.com' }))
      .mockResolvedValueOnce(Response.json({ error_code: 'email_not_confirmed' }, { status: 400 }));
    const handler = createUsernameLoginHandler(config, fetcher);
    expect(await (await handler(request())).json()).toEqual({ code: 'email_not_confirmed' });
    fetcher.mockResolvedValueOnce(Response.json({ allowed: false }));
    const limited = await handler(request());
    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ code: 'over_request_rate_limit' });
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('rejects malformed and oversized requests without database access', async () => {
    const fetcher = vi.fn<typeof fetch>();
    const handler = createUsernameLoginHandler(config, fetcher);
    expect((await handler(request('bad name'))).status).toBe(400);
    expect((await handler(request('john', 'x'.repeat(9000)))).status).toBe(413);
    expect((await handler(new Request('https://example.test', { method: 'POST', body: 'not json' }))).status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('fails closed on backend errors', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error('network'));
    const response = await createUsernameLoginHandler(config, fetcher)(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ code: 'service_unavailable' });
  });
});
