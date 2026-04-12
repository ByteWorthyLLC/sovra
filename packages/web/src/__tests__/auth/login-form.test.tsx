import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoginForm } from '@/components/auth/login-form'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/auth/client', () => ({
  createSupabaseBrowserClient: () => ({}),
}))

vi.mock('@/lib/auth/supabase-adapter', () => ({
  SupabaseAuthAdapter: vi.fn().mockImplementation(() => ({
    signIn: vi.fn().mockResolvedValue({ error: null }),
    signInWithMagicLink: vi.fn().mockResolvedValue({ error: null }),
  })),
}))

describe('LoginForm', () => {
  it('renders email input, password input, and submit button', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeDefined()
    expect(document.getElementById('password')).not.toBeNull()
    expect(screen.getByRole('button', { name: /sign in$/i })).toBeDefined()
  })

  it('renders "Sign in" button text', () => {
    render(<LoginForm />)
    const button = screen.getByRole('button', { name: /sign in$/i })
    expect(button.textContent).toBe('Sign in')
  })

  it('renders "Forgot password?" link', () => {
    render(<LoginForm />)
    expect(screen.getByText(/forgot password/i)).toBeDefined()
  })

  it('renders footer with "Sign up" link', () => {
    render(<LoginForm />)
    expect(screen.getByText(/sign up/i)).toBeDefined()
  })
})
