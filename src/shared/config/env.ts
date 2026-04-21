type RequiredEnvKey = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function getEnvOrThrow(key: RequiredEnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  supabaseUrl: getEnvOrThrow("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: getEnvOrThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
};
