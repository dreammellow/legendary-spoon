/**
 * Authentication Context Manager
 * Handles separate authentication for admin and user panels
 */

export type AuthContext = 'user' | 'admin'

export class AuthContextManager {
  private static instance: AuthContextManager
  private currentContext: AuthContext | null = null

  private constructor() {}

  static getInstance(): AuthContextManager {
    if (!AuthContextManager.instance) {
      AuthContextManager.instance = new AuthContextManager()
    }
    return AuthContextManager.instance
  }

  /**
   * Set the current authentication context
   */
  setContext(context: AuthContext): void {
    this.currentContext = context
    localStorage.setItem('auth_context', context)
  }

  /**
   * Get the current authentication context
   */
  getContext(): AuthContext | null {
    if (!this.currentContext) {
      this.currentContext = localStorage.getItem('auth_context') as AuthContext
    }
    return this.currentContext
  }

  /**
   * Clear the current context
   */
  clearContext(): void {
    this.currentContext = null
    localStorage.removeItem('auth_context')
  }

  /**
   * Get token for the current context
   */
  getToken(): string | null {
    const context = this.getContext()
    if (!context) return null

    return localStorage.getItem(`${context}_token`)
  }

  /**
   * Set token for the current context
   */
  setToken(token: string): void {
    const context = this.getContext()
    if (!context) return

    localStorage.setItem(`${context}_token`, token)
  }

  /**
   * Clear token for the current context
   */
  clearToken(): void {
    const context = this.getContext()
    if (!context) return

    localStorage.removeItem(`${context}_token`)
  }

  /**
   * Clear all authentication data
   */
  clearAll(): void {
    localStorage.removeItem('user_token')
    localStorage.removeItem('admin_token')
    localStorage.removeItem('token') // Legacy token
    this.clearContext()
  }

  /**
   * Check if user is authenticated in current context
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null
  }

  /**
   * Get user data for current context
   */
  async getUserData(): Promise<any> {
    const token = this.getToken()
    if (!token) return null

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      