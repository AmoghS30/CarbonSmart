'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { apiService, ActivityLog } from '@/services/api'
import {
  TruckIcon,
  HomeIcon,
  FireIcon,
  BoltIcon,
  BeakerIcon,
  ShoppingCartIcon,
  PaperAirplaneIcon,
  TrashIcon,
  CheckCircleIcon,
  SparklesIcon,
  SunIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

// Carbon emitting activities
const emittingActivityTypes = [
  { value: 'driving', label: 'Driving', icon: TruckIcon },
  { value: 'flight', label: 'Flight', icon: PaperAirplaneIcon },
  { value: 'home_energy', label: 'Home Energy', icon: BoltIcon },
  { value: 'heating', label: 'Heating', icon: FireIcon },
  { value: 'cooking', label: 'Cooking', icon: HomeIcon },
  { value: 'shopping', label: 'Shopping', icon: ShoppingCartIcon },
  { value: 'waste', label: 'Waste', icon: TrashIcon },
  { value: 'other', label: 'Other', icon: BeakerIcon },
]

// Carbon offset/environmental friendly activities
const offsetActivityTypes = [
  { value: 'tree_planting', label: 'Tree Planting', icon: SparklesIcon },
  { value: 'renewable_energy', label: 'Renewable Energy', icon: SunIcon },
  { value: 'recycling', label: 'Recycling', icon: ArrowPathIcon },
  { value: 'carbon_offset', label: 'Carbon Offset Purchase', icon: CheckCircleIcon },
]

const activityExamples = {
  driving: ['Drive 10 km', 'Drive 50 miles in SUV', 'Drive 20 km in electric car'],
  flight: ['Flight 100 km', 'Fly from NYC to LA', 'International flight 5000 km'],
  home_energy: ['Used 50 kWh electricity', 'Monthly electricity 300 kWh', 'Solar panel generated 20 kWh'],
  heating: ['Heated home for 5 hours', 'Used 10 cubic meters of gas', 'Wood stove for 3 hours'],
  cooking: ['Cooked for 2 hours with gas', 'Electric oven for 1 hour', 'Microwave for 30 minutes'],
  shopping: ['Bought 5 kg of meat', 'Purchased 10 plastic bottles', 'Bought local vegetables 2 kg'],
  waste: ['Threw away 20 kg garbage', 'Disposed 10 kg electronics', 'Landfill waste 15 kg'],
  other: ['Factory emissions 100 kg', 'Construction work', 'Event hosting'],
  tree_planting: ['Planted 5 trees', 'Planted 10 saplings', 'Community tree drive 50 trees'],
  renewable_energy: ['Installed solar panels 5kW', 'Wind turbine installation', 'Solar water heater'],
  recycling: ['Recycled 10 kg paper', 'Composted 5 kg food waste', 'E-waste recycling 2 kg'],
  carbon_offset: ['Purchased 100 kg offset', 'Invested in wind farm', 'Carbon credit purchase 1 ton'],
}

export default function ActivitiesPage() {
  const { data: session } = useSession()
  const { address } = useAccount()
  const router = useRouter()

  const [isOffset, setIsOffset] = useState(false)
  const [selectedType, setSelectedType] = useState('driving')
  const [activity, setActivity] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [prediction, setPrediction] = useState<number | null>(null)
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [wasMinted, setWasMinted] = useState(false)

  const currentActivityTypes = isOffset ? offsetActivityTypes : emittingActivityTypes

  // Reset selected type when switching between offset and emitting
  const handleOffsetToggle = (offset: boolean) => {
    setIsOffset(offset)
    setSelectedType(offset ? 'tree_planting' : 'driving')
    setActivity('')
    setPrediction(null)
    setMintedTokenId(null)
    setTransactionHash(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      toast.error('Please sign in to log activities')
      router.push('/auth/signin')
      return
    }

    if (!activity.trim()) {
      toast.error('Please describe your activity')
      return
    }

    setIsSubmitting(true)
    setWasMinted(false)

    try {
      const activityData: ActivityLog = {
        user: session.user.username || session.user.email || 'anonymous',
        activity_type: selectedType,
        activity: activity,
        user_wallet: address || undefined,
        is_offset: isOffset, // Send offset flag to backend
      }

      const response = await apiService.logActivity(activityData)
      setPrediction(response.predicted_emission)
      setMintedTokenId(response.token_id)
      setTransactionHash(response.transaction_hash)

      // Only show minted message for offset activities
      if (isOffset && response.token_id) {
        setWasMinted(true)
        toast.success(`Carbon Credit NFT #${response.token_id} minted!`)
      } else if (isOffset && response.transaction_hash && !response.transaction_hash.startsWith('Error')) {
        setWasMinted(true)
        toast.success(`Carbon offset logged! TX: ${response.transaction_hash.slice(0, 10)}...`)
      } else {
        toast.success('Activity logged successfully!')
      }

      setTimeout(() => {
        setActivity('')
      }, 3000)
    } catch (error) {
      console.error('Error logging activity:', error)
      toast.error('Failed to log activity')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setActivity(example)
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">
              Log Your Carbon Activity
            </h1>
            <p className="text-neutral-500 mt-2">
              Track emissions or log offset activities to earn carbon credits
            </p>
          </div>

          {/* Main Form Card */}
          <div className="card p-8">
            {/* Activity Mode Toggle */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Activity Type
              </label>
              <div className="flex rounded-lg bg-neutral-100 p-1">
                <button
                  type="button"
                  onClick={() => handleOffsetToggle(false)}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                    !isOffset
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <FireIcon className="h-4 w-4" />
                    Carbon Emitting
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOffsetToggle(true)}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                    isOffset
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <SparklesIcon className="h-4 w-4" />
                    Carbon Offset
                  </span>
                </button>
              </div>
              <p className={`text-xs mt-2 ${isOffset ? 'text-primary-600' : 'text-neutral-500'}`}>
                {isOffset
                  ? 'Offset activities earn NFT carbon credits when wallet is connected'
                  : 'Emitting activities track your carbon footprint (no NFT minting)'
                }
              </p>
            </div>

            {/* Activity Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-neutral-700 mb-4">
                Select {isOffset ? 'Offset' : 'Emission'} Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {currentActivityTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      selectedType === type.value
                        ? isOffset
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className={`inline-flex p-2 rounded-lg mb-2 ${
                      selectedType === type.value
                        ? isOffset
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-red-100 text-red-600'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      <type.icon className="h-5 w-5" />
                    </div>
                    <div className={`text-sm font-medium ${
                      selectedType === type.value
                        ? isOffset ? 'text-primary-700' : 'text-red-700'
                        : 'text-neutral-700'
                    }`}>
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Description */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Describe Your Activity
                </label>
                <textarea
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder={isOffset ? "e.g., Planted 10 trees in the park" : "e.g., Drive 20 km to work"}
                  rows={4}
                  className="input-field resize-none"
                  required
                />
              </div>

              {/* Example Activities */}
              <div className="mb-6">
                <p className="text-sm text-neutral-500 mb-2">
                  Quick examples:
                </p>
                <div className="flex flex-wrap gap-2">
                  {activityExamples[selectedType as keyof typeof activityExamples]?.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      className="px-3 py-1.5 text-sm rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallet Connection Info - Only for offset activities */}
              {isOffset && address && (
                <div className="mb-6 p-4 rounded-lg bg-primary-50 border border-primary-200">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-primary-700">
                        Wallet connected: {address.slice(0, 6)}...{address.slice(-4)}
                      </p>
                      <p className="text-xs text-primary-600 mt-0.5">
                        Carbon credit NFT will be minted to this address
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isOffset && !address && (
                <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-700">
                    Connect your wallet to receive NFT carbon credits for offset activities
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 text-base rounded-lg font-medium transition-colors ${
                  isOffset
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-neutral-800 hover:bg-neutral-900 text-white'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Calculating...
                  </span>
                ) : isOffset ? (
                  'Log Offset & Earn Credit'
                ) : (
                  'Log Carbon Emission'
                )}
              </button>
            </form>

            {/* Prediction Result */}
            {prediction !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-6 p-6 rounded-xl border ${
                  isOffset
                    ? 'bg-gradient-to-br from-primary-50 to-white border-primary-200'
                    : 'bg-gradient-to-br from-red-50 to-white border-red-200'
                }`}
              >
                <div className="text-center">
                  <p className="text-sm text-neutral-600 mb-2">
                    {isOffset ? 'Carbon Offset Amount:' : 'Carbon Emission Calculated:'}
                  </p>
                  <p className={`text-4xl font-bold ${isOffset ? 'text-primary-600' : 'text-red-600'}`}>
                    {prediction.toFixed(2)} kg CO2e
                  </p>

                  {isOffset && wasMinted && mintedTokenId ? (
                    <div className="mt-4 space-y-2">
                      <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full">
                        <CheckCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
                        <span className="text-primary-700 font-semibold">
                          NFT #{mintedTokenId}
                        </span>
                      </div>
                      <p className="text-sm text-primary-600">
                        Carbon credit NFT minted successfully!
                      </p>
                      {transactionHash && !transactionHash.startsWith('Error') && (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 underline block"
                        >
                          View on Etherscan
                        </a>
                      )}
                    </div>
                  ) : isOffset ? (
                    <p className="text-sm text-neutral-500 mt-4">
                      {address ? 'Processing blockchain transaction...' : 'Connect wallet to mint NFT credits'}
                    </p>
                  ) : (
                    <p className="text-sm text-neutral-500 mt-4">
                      This emission has been recorded to your profile
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="card p-5">
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-red-100 text-red-600 mr-3">
                  <FireIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    Track Emissions
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Log daily activities to monitor your carbon footprint.
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-primary-100 text-primary-600 mr-3">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    Offset & Earn
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Environmental activities earn NFT credits.
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600 mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    Trade Credits
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Buy and sell credits in the marketplace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
