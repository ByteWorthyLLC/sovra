import { vi } from 'vitest'

export function createMockSupabaseClient() {
  const auth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOtp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    getClaims: vi.fn(),
    getUser: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    exchangeCodeForSession: vi.fn(),
  }
  return { auth, from: vi.fn() }
}
