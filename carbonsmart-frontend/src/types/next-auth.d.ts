import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      walletAddress?: string
      accountType?: string
      gstin?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    username: string
    walletAddress?: string
    accountType?: string
    gstin?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    walletAddress?: string
    accountType?: string
    gstin?: string
  }
}
