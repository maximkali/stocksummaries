/**
 * Environment variable validation and access
 *
 * This module provides type-safe access to environment variables
 * with validation at startup to fail fast if configuration is missing.
 */

// Server-only environment variables (never exposed to client)
const serverEnvSchema = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GROK_API_KEY: process.env.GROK_API_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
} as const

// Public environment variables (safe for client)
const publicEnvSchema = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
} as const

type ServerEnv = typeof serverEnvSchema
type PublicEnv = typeof publicEnvSchema

/**
 * Validates that all required environment variables are set.
 * Call this at application startup to fail fast.
 */
export function validateEnv(): void {
  const missing: string[] = []

  // Check server-side variables (only on server)
  if (typeof window === 'undefined') {
    for (const [key, value] of Object.entries(serverEnvSchema)) {
      if (!value) {
        missing.push(key)
      }
    }
  }

  // Check public variables
  for (const [key, value] of Object.entries(publicEnvSchema)) {
    if (!value) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\n` +
      'Please check your .env.local file. See .env.example for required variables.'
    )
  }
}

/**
 * Get a server-only environment variable.
 * Throws if called from client-side or if variable is not set.
 */
export function getServerEnv<K extends keyof ServerEnv>(key: K): NonNullable<ServerEnv[K]> {
  if (typeof window !== 'undefined') {
    throw new Error(`Cannot access server environment variable "${key}" from client-side code`)
  }

  const value = serverEnvSchema[key]
  if (!value) {
    throw new Error(`Missing required server environment variable: ${key}`)
  }

  return value as NonNullable<ServerEnv[K]>
}

/**
 * Get a public environment variable.
 * Safe to call from client or server.
 */
export function getPublicEnv<K extends keyof PublicEnv>(key: K): NonNullable<PublicEnv[K]> {
  const value = publicEnvSchema[key]
  if (!value) {
    throw new Error(`Missing required public environment variable: ${key}`)
  }

  return value as NonNullable<PublicEnv[K]>
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if we're in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}
