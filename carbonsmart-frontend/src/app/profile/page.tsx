'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { apiService, ActivityResponse } from '@/services/api'
import {
  UserCircleIcon,
  WalletIcon,
  PencilIcon,
  CheckIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'

const OFFSET_TYPES = ['tree_planting', 'renewable_energy', 'recycling', 'carbon_offset']

export default function ProfilePage() {
  const { data: session } = useSession()
  const { address } = useAccount()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [activities, setActivities] = useState<ActivityResponse[]>([])
  const [stats, setStats] = useState({
    totalEmissions: 0,
    creditsEarned: 0,
    activitiesCount: 0,
  })
  const [profile, setProfile] = useState({
    displayName: '',
    bio: '',
    email: '',
    username: '',
    walletAddress: '',
    accountType: 'user',
  })

  useEffect(() => {
    if (session?.user) {
      loadProfile()
      loadStats()
      loadActivities()
    } else if (!session) {
      router.push('/auth/signin')
    }
  }, [session, router, address])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setProfile({
        displayName: session?.user?.username || '',
        bio: '',
        email: session?.user?.email || '',
        username: session?.user?.username || '',
        walletAddress: address || session?.user?.walletAddress || '',
        accountType: session?.user?.accountType || 'user',
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      if (session?.user?.username) {
        const dashboardStats = await apiService.getDashboardStats(session.user.username)
        setStats({
          totalEmissions: dashboardStats.totalEmissions,
          creditsEarned: dashboardStats.creditsEarned,
          activitiesCount: dashboardStats.totalActivities,
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadActivities = async () => {
    try {
      if (session?.user?.username) {
        const userActivities = await apiService.getUserActivities(session.user.username)
        setActivities(userActivities)
      }
    } catch (error) {
      console.error('Error loading activities:', error)
    }
  }

  const handleSave = async () => {
    try {
      toast.success('Profile updated!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="spinner-lg"></div>
      </div>
    )
  }

  const isCompany = profile.accountType === 'company'
  const displayedActivities = showAllActivities ? activities : activities.slice(0, 5)

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header Card */}
          <div className="card p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  isCompany ? 'bg-amber-600' : 'bg-primary-600'
                }`}>
                  {isCompany ? (
                    <BuildingOfficeIcon className="h-14 w-14 text-white" />
                  ) : (
                    <UserCircleIcon className="h-16 w-16 text-white" />
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-grow text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      className="text-2xl font-bold input-field max-w-xs py-1"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-neutral-900">
                      {profile.displayName}
                    </h1>
                  )}
                  <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    {isEditing ? (
                      <CheckIcon className="h-5 w-5 text-primary-600" />
                    ) : (
                      <PencilIcon className="h-5 w-5 text-neutral-400" />
                    )}
                  </button>
                </div>

                <p className="text-neutral-500 text-sm">@{profile.username}</p>

                {/* Account Type Badge */}
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    isCompany
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-primary-100 text-primary-700'
                  }`}>
                    {isCompany ? (
                      <>
                        <BuildingOfficeIcon className="h-3.5 w-3.5" />
                        Company Account
                      </>
                    ) : (
                      <>
                        <UserCircleIcon className="h-3.5 w-3.5" />
                        User Account
                      </>
                    )}
                  </span>
                </div>

                {isEditing && (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="mt-3 input-field w-full max-w-md text-sm"
                    rows={2}
                    placeholder="Add a short bio..."
                  />
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex gap-8 md:flex-col md:gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{stats.creditsEarned}</div>
                  <div className="text-sm text-neutral-500">Credits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neutral-900">{stats.totalEmissions.toFixed(1)}</div>
                  <div className="text-sm text-neutral-500">kg CO2e</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neutral-700">{stats.activitiesCount}</div>
                  <div className="text-sm text-neutral-500">Activities</div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Wallet Info */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <WalletIcon className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-900">Wallet</h2>
              </div>
              {address ? (
                <div>
                  <p className="text-sm text-neutral-500 mb-2">Connected Wallet</p>
                  <p className="font-mono text-sm bg-neutral-50 p-3 rounded-lg break-all text-neutral-700 border border-neutral-200">
                    {address}
                  </p>
                  <a
                    href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 mt-3 inline-block font-medium"
                  >
                    View on Etherscan
                  </a>
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">
                  No wallet connected. Connect your wallet to earn NFT credits.
                </p>
              )}
            </div>

            {/* Account Details */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserCircleIcon className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-900">Account</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-500">Email</p>
                  <p className="text-neutral-900">{profile.email || 'Not set'}</p>
                </div>
                {session?.user?.gstin && (
                  <div>
                    <p className="text-sm text-neutral-500">GSTIN</p>
                    <p className="text-neutral-900 font-mono">{session.user.gstin}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-neutral-500">Account Type</p>
                  <p className="text-neutral-900 capitalize">{profile.accountType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Summary Card */}
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ChartBarIcon className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Activity Summary</h2>
            </div>
            {stats.activitiesCount > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                  <p className="text-3xl font-bold text-neutral-900">{stats.activitiesCount}</p>
                  <p className="text-sm text-neutral-500 mt-1">Total Activities Logged</p>
                </div>
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
                  <p className="text-3xl font-bold text-red-600">{stats.totalEmissions.toFixed(1)}</p>
                  <p className="text-sm text-neutral-500 mt-1">kg CO2 Emissions</p>
                </div>
                <div className="p-4 rounded-xl bg-primary-50 border border-primary-200 text-center">
                  <p className="text-3xl font-bold text-primary-600">{stats.creditsEarned}</p>
                  <p className="text-sm text-neutral-500 mt-1">NFT Credits Earned</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">No activities logged yet.</p>
                <button
                  onClick={() => router.push('/activities')}
                  className="mt-4 btn-primary"
                >
                  Log Your First Activity
                </button>
              </div>
            )}
          </div>

          {/* Full Activity History */}
          {activities.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-neutral-900">Activity History</h2>
                </div>
                <span className="text-sm text-neutral-500">{activities.length} total</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Description</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">CO2</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedActivities.map((activity, index) => {
                      const isOffset = OFFSET_TYPES.includes(activity.activity_type)
                      const hasCredit = activity.transaction_hash &&
                        !activity.transaction_hash.startsWith('Error') &&
                        !activity.transaction_hash.includes('no NFT') &&
                        !activity.transaction_hash.includes('Emission logged')

                      return (
                        <tr
                          key={activity.id || index}
                          className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-neutral-600">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              isOffset
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {activity.activity_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-700 max-w-xs truncate">
                            {activity.data?.activity || activity.activity_type}
                          </td>
                          <td className="py-3 px-4 text-sm text-neutral-700 font-medium">
                            {activity.predicted_emission.toFixed(2)} kg
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {isOffset && hasCredit ? (
                              <a
                                href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${activity.transaction_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 font-medium"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-neutral-400">NA</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {activities.length > 5 && (
                <button
                  onClick={() => setShowAllActivities(!showAllActivities)}
                  className="mt-4 w-full py-2 text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1"
                >
                  {showAllActivities ? (
                    <>
                      Show Less <ChevronUpIcon className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show All {activities.length} Activities <ChevronDownIcon className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
