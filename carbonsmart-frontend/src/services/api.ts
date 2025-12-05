import axios, { AxiosInstance } from 'axios'
import { toast } from 'react-hot-toast'

export interface ActivityLog {
  id?: number
  user: string
  activity_type: string
  activity: string
  user_wallet?: string
  predicted_emission?: number
  timestamp?: string
  transaction_hash?: string
  token_id?: number
  is_offset?: boolean
}

export interface ActivityResponse {
  id: number
  user: string
  activity_type: string
  data: {
    user: string
    activity_type: string
    activity: string
    user_wallet?: string
  }
  predicted_emission: number
  timestamp: string
  transaction_hash: string
  token_id: number | null
  user_wallet: string | null
}

export interface BlockchainCredit {
  token_id: number
  co2_amount_grams: number
  co2_amount_kg: number
  timestamp: number
  activity_type: string
}

export interface BlockchainCreditsResponse {
  wallet: string
  credits: BlockchainCredit[]
  total_credits: number
}

export interface BlockchainStatus {
  connected: boolean
  chain_id: number | null
  contract_address: string
  latest_block: number | null
}

class ApiService {
  private api: AxiosInstance
  private aiApi: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.aiApi = axios.create({
      baseURL: process.env.NEXT_PUBLIC_AI_API_URL || 'http://127.0.0.1:8002',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || 'An error occurred'
        toast.error(message)
        return Promise.reject(error)
      }
    )
  }

  // Log activity endpoint
  async logActivity(data: ActivityLog): Promise<ActivityResponse> {
    try {
      const response = await this.api.post<ActivityResponse>('/api/log/', data)
      toast.success('Activity logged successfully!')
      return response.data
    } catch (error) {
      console.error('Error logging activity:', error)
      throw error
    }
  }

  // Get user activities
  async getUserActivities(username: string): Promise<ActivityResponse[]> {
    try {
      const response = await this.api.get<ActivityResponse[]>(`/api/activities/${username}`)
      return response.data
    } catch (error) {
      console.error('Error fetching activities:', error)
      return []
    }
  }

  // Direct AI prediction (for testing)
  async predictEmission(activity: string): Promise<number> {
    try {
      const response = await this.aiApi.post<{ predicted_emission: number }>('/predict', {
        activity,
      })
      return response.data.predicted_emission
    } catch (error) {
      console.error('Error predicting emission:', error)
      throw error
    }
  }

  // Get blockchain credits for a wallet
  async getBlockchainCredits(walletAddress: string): Promise<BlockchainCreditsResponse> {
    try {
      const response = await this.api.get<BlockchainCreditsResponse>(`/api/credits/${walletAddress}/`)
      return response.data
    } catch (error) {
      console.error('Error fetching blockchain credits:', error)
      return { wallet: walletAddress, credits: [], total_credits: 0 }
    }
  }

  // Check blockchain connection status
  async getBlockchainStatus(): Promise<BlockchainStatus> {
    try {
      const response = await this.api.get<BlockchainStatus>('/api/blockchain/status/')
      return response.data
    } catch (error) {
      console.error('Error checking blockchain status:', error)
      return { connected: false, chain_id: null, contract_address: '', latest_block: null }
    }
  }

  // Get dashboard statistics
  async getDashboardStats(username: string) {
    try {
      const [activities] = await Promise.all([
        this.getUserActivities(username),
      ])

      const totalEmissions = activities.reduce(
        (sum, activity) => sum + (activity.predicted_emission || 0),
        0
      )

      const creditsEarned = activities.filter(
        (activity) => activity.transaction_hash
      ).length

      const monthlyData = this.processMonthlyData(activities)
      const activityTypeData = this.processActivityTypeData(activities)

      return {
        totalEmissions,
        creditsEarned,
        totalActivities: activities.length,
        monthlyData,
        activityTypeData,
        recentActivities: activities.slice(0, 5),
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  private processMonthlyData(activities: ActivityResponse[]) {
    const monthlyMap = new Map<string, number>()
    
    activities.forEach((activity) => {
      const date = new Date(activity.timestamp)
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
      const current = monthlyMap.get(monthKey) || 0
      monthlyMap.set(monthKey, current + activity.predicted_emission)
    })

    return Array.from(monthlyMap.entries())
      .map(([month, emissions]) => ({
        month,
        emissions: parseFloat(emissions.toFixed(2)),
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  private processActivityTypeData(activities: ActivityResponse[]) {
    const typeMap = new Map<string, number>()
    
    activities.forEach((activity) => {
      const current = typeMap.get(activity.activity_type) || 0
      typeMap.set(activity.activity_type, current + activity.predicted_emission)
    })

    return Array.from(typeMap.entries()).map(([type, emissions]) => ({
      type,
      emissions: parseFloat(emissions.toFixed(2)),
    }))
  }
}

export const apiService = new ApiService()
