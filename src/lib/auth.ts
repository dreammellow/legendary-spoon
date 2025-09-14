import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: any) {
  try {
    const url = "https://oauth2.googleapis.com/token"
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user is banned before allowing sign in
      if (user?.email) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/check-ban-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email }),
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.is_banned) {
              return false
            }
          }
        } catch (error) {
          // If ban check fails, allow sign in to avoid blocking legitimate users
        }
      }
      
      return true
    },
    async redirect({ url, baseUrl }) {
      // Handle error redirects first (like banned users)
      if (url.includes('error=AccessDenied')) {
        return `${baseUrl}/auth/error?error=AccessDenied`
      }
      
      // Handle any other error in the URL
      if (url.includes('error=')) {
        return `${baseUrl}/auth/error?error=AccessDenied`
      }
      
      // Handle specific airdrop error redirect
      if (url.includes('/airdrop?error=AccessDenied')) {
        return `${baseUrl}/auth/error?error=AccessDenied`
      }
      
      // Prevent infinite redirect loops by checking if we're already going to check-user-status
      if (url.includes('/check-user-status')) {
        return url
      }
      
      // For dashboard redirects, redirect to check-user-status first to determine if user is new
      if (url.includes('/dashboard') || url.includes('callbackUrl=/dashboard')) {
        return `${baseUrl}/check-user-status?oauth_success=true`
      }
      
      // For all other cases (including email/password logins), redirect to dashboard
      return `${baseUrl}/dashboard`
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.accessToken = token.accessToken
        session.error = token.error
      }
      
      return session
    },
    async jwt({ token, user, account, trigger }) {
      // On initial sign in, user and account are available
      if (user && account) {
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
          refreshToken: account.refresh_token,
          user: user
        }
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Only refresh token if it's actually expired and we have a refresh token
      if (token.refreshToken && token.accessTokenExpires && Date.now() >= (token.accessTokenExpires as number)) {
        return await refreshAccessToken(token)
      }
      
      // If no refresh token or other issues, return the token as is
      return token
    }
  },
  pages: {
    signIn: '/airdrop?mode=login',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Sign in event handler
    },
    async session({ session, token }) {
      // Session event handler
    },
    async createUser({ user }) {
      // Create user event handler
    }
  },
  logger: {
    error(code, metadata) {
      // Suppress CLIENT_FETCH_ERROR as it's expected in our mixed auth setup
      if (code === 'CLIENT_FETCH_ERROR') {
        return
      }
    },
    warn(code) {
      // Suppress warnings
    },
    debug(code, metadata) {
      // Suppress debug logs
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: false
}
