'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  FireIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { apiService } from '@/services/api'

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEmissions: 0,
    creditsEarned: 0,
    totalActivities: 0,
    monthlyData: [] as Array<{ month: string; emissions: number }>,
    activityTypeData: [] as Array<{ type: string; emissions: number }>,
    recentActivities: [] as any[],
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user) {
      loadDashboardData()
    }
  }, [session, status, router])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const username = session?.user?.username || session?.user?.email || 'anonymous'
      const data = await apiService.getDashboardStats(username)
      setStats(data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="spinner-lg"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Emissions',
      value: `${stats.totalEmissions.toFixed(1)} kg`,
      icon: FireIcon,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'Credits Earned',
      value: stats.creditsEarned.toString(),
      icon: TrophyIcon,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Activities Logged',
      value: stats.totalActivities.toString(),
      icon: ChartBarIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  ]

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">
              Welcome back, {session?.user?.username || 'Eco Warrior'}!
            </h1>
            <p className="text-neutral-500 mt-1">
              Here's your environmental impact overview
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-neutral-500 font-medium">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Emissions Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Monthly Emissions Trend
              </h2>
              {stats.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="month" stroke="#737373" fontSize={12} />
                    <YAxis stroke="#737373" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="emissions"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ fill: '#059669', r: 4 }}
                      activeDot={{ r: 6, fill: '#059669' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-neutral-500">
                  No data available yet. Start logging activities!
                </div>
              )}
            </motion.div>

            {/* Activity Type Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Emissions by Activity Type
              </h2>
              {stats.activityTypeData.length > 0 ? (
                <div className="flex flex-col lg:flex-row items-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats.activityTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="emissions"
                      >
                        {stats.activityTypeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toFixed(1)} kg`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 lg:mt-0 lg:ml-4 space-y-2">
                    {stats.activityTypeData.map((entry, index) => (
                      <div key={entry.type} className="flex items-center text-sm">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-neutral-600">{entry.type}:</span>
                        <span className="ml-1 font-medium text-neutral-900">{entry.emissions.toFixed(1)} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-neutral-500">
                  No data available yet. Start logging activities!
                </div>
              )}
            </motion.div>
          </div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Recent Activities
            </h2>
            {stats.recentActivities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                        CO2 Amount
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentActivities.map((activity, index) => {
                      const isOffset = ['tree_planting', 'renewable_energy', 'recycling', 'carbon_offset'].includes(activity.activity_type)
                      const hasCredit = activity.transaction_hash && !activity.transaction_hash.startsWith('Error') && !activity.transaction_hash.includes('no NFT')

                      return (
                        <tr
                          key={activity.id || index}
                          className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-neutral-600">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-2 text-neutral-400" />
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </div>
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
            ) : (
              <div className="text-center py-12 text-neutral-500">
                No activities logged yet.
                <a href="/activities" className="ml-2 text-primary-600 hover:text-primary-700 font-medium">
                  Log your first activity →
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
