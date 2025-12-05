'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

type LoginType = 'user' | 'company'

export default function SignInPage() {
  const router = useRouter()
  const [loginType, setLoginType] = useState<LoginType>('user')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // User form data
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
  })

  // Company form data
  const [companyFormData, setCompanyFormData] = useState({
    companyName: '',
    gstin: '',
  })

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('user-credentials', {
        username: userFormData.username,
        password: userFormData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Welcome back!')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('company-credentials', {
        companyName: companyFormData.companyName,
        gstin: companyFormData.gstin,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Welcome back!')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-neutral-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-neutral-900">CarbonSmart</span>
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-neutral-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Sign in to continue your sustainable journey
            </p>
          </div>

          {/* Login Type Tabs */}
          <div className="flex rounded-lg bg-neutral-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setLoginType('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                loginType === 'user'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              User
            </button>
            <button
              type="button"
              onClick={() => setLoginType('company')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                loginType === 'company'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <BuildingOfficeIcon className="h-4 w-4" />
              Company
            </button>
          </div>

          {/* User Login Form */}
          {loginType === 'user' && (
            <motion.form
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleUserSubmit}
              className="space-y-5"
            >
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  className="input-field"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="input-field pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Signing in...
                  </span>
                ) : (
                  'Sign In as User'
                )}
              </button>
            </motion.form>
          )}

          {/* Company Login Form */}
          {loginType === 'company' && (
            <motion.form
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleCompanySubmit}
              className="space-y-5"
            >
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={companyFormData.companyName}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, companyName: e.target.value })}
                  className="input-field"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label htmlFor="gstin" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  GSTIN Number
                </label>
                <input
                  id="gstin"
                  name="gstin"
                  type="text"
                  required
                  value={companyFormData.gstin}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, gstin: e.target.value.toUpperCase() })}
                  className="input-field"
                  placeholder="e.g., 22AAAAA0000A1Z5"
                  maxLength={15}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  15-character GST Identification Number
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Signing in...
                  </span>
                ) : (
                  'Sign In as Company'
                )}
              </button>
            </motion.form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">
                Don't have an account?
              </span>
            </div>
          </div>

          <Link
            href={loginType === 'user' ? '/auth/signup' : '/auth/company-signup'}
            className="w-full btn-secondary text-center block"
          >
            {loginType === 'user' ? 'Create User Account' : 'Register Company'}
          </Link>

          {/* Demo Credentials - only for user */}
          {loginType === 'user' && (
            <div className="mt-6 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
              <p className="text-sm text-neutral-600">
                <span className="font-medium">Demo Credentials:</span>
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Username: demo_user | Password: demo123
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
