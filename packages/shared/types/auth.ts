export type OAuthProvider = 'google' | 'github'

export interface AuthUser {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface AuthResult {
  user: AuthUser | null
  session: AuthSession | null
  error: string | null
}

export interface AuthAdapter {
  signUp(email: string, password: string): Promise<AuthResult>
  signIn(email: string, password: string): Promise<AuthResult>
  signInWithMagicLink(email: string, redirectTo: string): Promise<{ error: string | null }>
  signInWithOAuth(provider: OAuthProvider, redirectTo: string): Promise<{ error: string | null }>
  signOut(): Promise<{ error: string | null }>
  getSession(): Promise<AuthSession | null>
  getUser(): Promise<AuthUser | null>
  resetPassword(email: string, redirectTo: string): Promise<{ error: string | null }>
  updatePassword(newPassword: string): Promise<{ error: string | null }>
}
