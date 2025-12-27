'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import {
  ShoppingCartIcon,
  TagIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

interface Listing {
  id: string
  tokenId: number
  seller: string
  sellerWallet: string
  priceEth: number
  co2Amount: number
  activityType: string
  createdAt: string
  isActive: boolean
}

// Mock listings for demo - In production, these would come from the backend
const mockListings: Listing[] = [
  {
    id: '1',
    tokenId: 1,
    seller: 'eco_company',
    sellerWallet: '0x1234...5678',
    priceEth: 0.01,
    co2Amount: 100,
    activityType: 'tree_planting',
    createdAt: '2024-12-01',
    isActive: true,
  },
  {
    id: '2',
    tokenId: 2,
    seller: 'green_corp',
    sellerWallet: '0x2345...6789',
    priceEth: 0.015,
    co2Amount: 200,
    activityType: 'renewable_energy',
    createdAt: '2024-12-02',
    isActive: true,
  },
  {
    id: '3',
    tokenId: 3,
    seller: 'carbon_neutral',
    sellerWallet: '0x3456...7890',
    priceEth: 0.008,
    co2Amount: 50,
    activityType: 'recycling',
    createdAt: '2024-12-03',
    isActive: true,
  },
]

export default function MarketplacePage() {
  const { data: session } = useSession()
  const { address } = useAccount()
  const router = useRouter()

  const [listings, setListings] = useState<Listing[]>(mockListings)
  const [userCredits, setUserCredits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showListModal, setShowListModal] = useState(false)
  const [selectedCredit, setSelectedCredit] = useState<any>(null)
  const [listPrice, setListPrice] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (address) {
      loadUserCredits()
    }
  }, [address])

  const loadUserCredits = async () => {
    // In production, fetch from blockchain/backend
    // For demo, using mock data
    setUserCredits([
      { tokenId: 10, co2Amount: 150, activityType: 'tree_planting' },
      { tokenId: 11, co2Amount: 75, activityType: 'recycling' },
    ])
  }

  const handleBuy = async (listing: Listing) => {
    if (!session?.user) {
      toast.error('Please sign in to buy credits')
      router.push('/auth/signin')
      return
    }

    if (!address) {
      toast.error('Please connect your wallet to buy credits')
      return
    }

    setIsLoading(true)
    try {
      // In production, this would:
      // 1. Call smart contract to transfer NFT
      // 2. Handle ETH payment
      // 3. Update backend listing status

      toast.success(`Successfully purchased Credit #${listing.tokenId}!`)
      setListings(listings.filter(l => l.id !== listing.id))
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Failed to complete purchase')
    } finally {
      setIsLoading(false)
    }
  }

  const handleListCredit = async () => {
    if (!selectedCredit || !listPrice) {
      toast.error('Please select a credit and set a price')
      return
    }

    setIsLoading(true)
    try {
      // In production, this would:
      // 1. Approve marketplace contract
      // 2. Create listing on backend

      const newListing: Listing = {
        id: Date.now().toString(),
        tokenId: selectedCredit.tokenId,
        seller: session?.user?.username || 'anonymous',
        sellerWallet: address || '',
        priceEth: parseFloat(listPrice),
        co2Amount: selectedCredit.co2Amount,
        activityType: selectedCredit.activityType,
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true,
      }

      setListings([newListing, ...listings])
      setUserCredits(userCredits.filter(c => c.tokenId !== selectedCredit.tokenId))
      setShowListModal(false)
      setSelectedCredit(null)
      setListPrice('')
      toast.success('Credit listed successfully!')
    } catch (error) {
      console.error('Listing error:', error)
      toast.error('Failed to list credit')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredListings = filter === 'all'
    ? listings
    : listings.filter(l => l.activityType === filter)

  const activityTypeLabels: Record<string, string> = {
    tree_planting: 'Tree Planting',
    renewable_energy: 'Renewable Energy',
    recycling: 'Recycling',
    carbon_offset: 'Carbon Offset',
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Carbon Credit Marketplace
              </h1>
              <p className="text-neutral-500 mt-2">
                Buy and sell verified carbon credits
              </p>
            </div>

            {address && userCredits.length > 0 && (
              <button
                onClick={() => setShowListModal(true)}
                className="mt-4 md:mt-0 btn-primary flex items-center gap-2"
              >
                <TagIcon className="h-5 w-5" />
                List Your Credit
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Active Listings</p>
                  <p className="text-2xl font-bold text-neutral-900">{listings.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary-100">
                  <ShoppingCartIcon className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Total CO2 Available</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {listings.reduce((sum, l) => sum + l.co2Amount, 0)} kg
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-100">
                  <ArrowPathIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Your Credits</p>
                  <p className="text-2xl font-bold text-neutral-900">{userCredits.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-100">
                  <TagIcon className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4 mb-6">
            <FunnelIcon className="h-5 w-5 text-neutral-500" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                All
              </button>
              {Object.entries(activityTypeLabels).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === value
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Grid */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary-100">
                      <CheckCircleIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      Verified
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    Carbon Credit #{listing.tokenId}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    {activityTypeLabels[listing.activityType] || listing.activityType}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">CO2 Offset</span>
                      <span className="font-medium text-neutral-900">{listing.co2Amount} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Seller</span>
                      <span className="font-medium text-neutral-900">{listing.seller}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Listed</span>
                      <span className="font-medium text-neutral-900">{listing.createdAt}</span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-neutral-500">Price</p>
                        <p className="text-xl font-bold text-primary-600">{listing.priceEth} ETH</p>
                      </div>
                      <button
                        onClick={() => handleBuy(listing)}
                        disabled={isLoading || listing.sellerWallet === address}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                          listing.sellerWallet === address
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {listing.sellerWallet === address ? 'Your Listing' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <ShoppingCartIcon className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No listings found</h3>
              <p className="text-neutral-500">
                {filter === 'all'
                  ? 'Be the first to list your carbon credits!'
                  : 'No listings match this filter. Try a different category.'}
              </p>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 card p-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              How the Marketplace Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                  <span className="text-lg font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900">Earn Credits</h3>
                  <p className="text-sm text-neutral-500">
                    Log environmental activities like tree planting to earn NFT credits.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                  <span className="text-lg font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900">List for Sale</h3>
                  <p className="text-sm text-neutral-500">
                    Set your price and list your carbon credits on the marketplace.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                  <span className="text-lg font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900">Trade Securely</h3>
                  <p className="text-sm text-neutral-500">
                    All transactions are secured on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* List Credit Modal */}
        {showListModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900">List Your Credit</h2>
                <button
                  onClick={() => setShowListModal(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-neutral-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select Credit
                  </label>
                  <div className="space-y-2">
                    {userCredits.map((credit) => (
                      <button
                        key={credit.tokenId}
                        onClick={() => setSelectedCredit(credit)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                          selectedCredit?.tokenId === credit.tokenId
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-neutral-900">Credit #{credit.tokenId}</p>
                            <p className="text-sm text-neutral-500">
                              {activityTypeLabels[credit.activityType] || credit.activityType}
                            </p>
                          </div>
                          <span className="text-primary-600 font-medium">{credit.co2Amount} kg</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Price (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    className="input-field"
                    placeholder="0.01"
                  />
                </div>

                <button
                  onClick={handleListCredit}
                  disabled={!selectedCredit || !listPrice || isLoading}
                  className="w-full btn-primary py-3"
                >
                  {isLoading ? 'Listing...' : 'List Credit for Sale'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
