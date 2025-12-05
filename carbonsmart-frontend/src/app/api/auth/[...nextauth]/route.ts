import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const handler = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    // User credentials provider
    CredentialsProvider({
      id: 'user-credentials',
      name: 'User Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username,
          },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          walletAddress: user.walletAddress || undefined,
          accountType: 'user',
        }
      },
    }),
    // Company credentials provider
    CredentialsProvider({
      id: 'company-credentials',
      name: 'Company Credentials',
      credentials: {
        companyName: { label: 'Company Name', type: 'text' },
        gstin: { label: 'GSTIN', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.companyName || !credentials?.gstin) {
          throw new Error('Missing company credentials')
        }

        // @ts-ignore - Company model will be available after prisma generate
        const company = await prisma.company?.findUnique({
          where: {
            companyName: credentials.companyName,
          },
        })

        if (!company) {
          throw new Error('Company not found')
        }

        // Verify GSTIN matches
        if (company.gstin !== credentials.gstin) {
          throw new Error('Invalid GSTIN')
        }

        return {
          id: company.id,
          username: company.companyName,
          email: company.email,
          walletAddress: company.walletAddress || undefined,
          accountType: 'company',
          gstin: company.gstin,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    newUser: '/dashboard',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.walletAddress = user.walletAddress
        token.accountType = (user as any).accountType
        token.gstin = (user as any).gstin
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.walletAddress = token.walletAddress as string | undefined
        session.user.accountType = token.accountType as string | undefined
        session.user.gstin = token.gstin as string | undefined
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }
