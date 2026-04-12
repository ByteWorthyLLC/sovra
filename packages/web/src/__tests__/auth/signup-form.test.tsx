import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SignupForm } from '@/components/auth/signup-form'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/auth/client', () => ({
  createSupabaseBrowserClient: () => ({}),
}))

vi.mock('@/lib/auth/supabase-adapter', () => ({
  SupabaseAuthAdapter: vi.fn().mockImplementation(() => ({
    signUp: vi.fn().mockResolvedValue({ error: null }),
  })),
}))

describe('SignupForm', () => {
  it('renders fullName, email, and password inputs', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText(/full name/i)).toBeDefined()
    expect(screen.getByLabelText(/email/i)).toBeDefined()
    expect(document.getElementById('password')).not.toBeNull()
  })

  it('renders "Create account" button', () => {
    render(<SignupForm />)
    const button = screen.getByRole('button', { name: /create account/i })
    expect(button.textContent).toBe('Create account')
  })

  it('renders footer with "Sign in" link', () => {
    render(<SignupForm />)
    expect(screen.getByText(/sign in/i)).toBeDefined()
  })
})
