const PLACEHOLDER_TOKENS = ['[', ']', 'your_', 'YOUR_', 'example', 'supabase.co:5432/postgres'];

function hasRealValue(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !PLACEHOLDER_TOKENS.some((token) => trimmed.includes(token));
}

export function getProductionConfigStatus() {
  const hasDatabase = hasRealValue(process.env.DATABASE_URL) && hasRealValue(process.env.DIRECT_URL);
  const hasSupabase =
    hasRealValue(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    hasRealValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasPaystack =
    hasRealValue(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) &&
    hasRealValue(process.env.PAYSTACK_SECRET_KEY);
  const hasEmail =
    hasRealValue(process.env.EMAILJS_SERVICE_ID) &&
    hasRealValue(process.env.EMAILJS_TEMPLATE_ID) &&
    hasRealValue(process.env.EMAILJS_PUBLIC_KEY);

  return {
    hasDatabase,
    hasSupabase,
    hasPaystack,
    hasEmail,
    ready: hasDatabase && hasSupabase && hasPaystack,
    missing: [
      !hasDatabase ? 'Supabase Postgres DATABASE_URL and DIRECT_URL' : null,
      !hasSupabase ? 'Supabase project URL and anon key' : null,
      !hasPaystack ? 'Paystack public and secret keys' : null,
    ].filter(Boolean),
  };
}

export function requireProductionConfig() {
  const status = getProductionConfigStatus();
  if (!status.ready) {
    return {
      ok: false as const,
      response: Response.json(
        {
          error: 'Production configuration required',
          message: 'Connect Supabase and Paystack before using live storefront data.',
          missing: status.missing,
        },
        { status: 503 }
      ),
    };
  }
  return { ok: true as const, status };
}
