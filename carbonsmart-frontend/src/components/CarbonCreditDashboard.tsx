// src/components/CarbonCreditDashboard.tsx
'use client';

import { useEffect } from 'react';
import { useWeb3 } from '@/hooks/useWeb3';

export default function CarbonCreditDashboard() {
  const { 
    walletAddress, 
    credits, 
    loading, 
    error, 
    isConnected,
    connect, 
    disconnect, 
    loadCredits 
  } = useWeb3();

  // Calculate total CO2
  const totalCO2 = credits.reduce((sum, credit) => sum + credit.co2Amount, 0);

  // Format wallet address
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🌱 Carbon Credit Dashboard
              </h1>
              <p className="text-gray-600">
                Track your environmental impact through blockchain NFTs
              </p>
            </div>
            
            {!isConnected ? (
              <button
                onClick={connect}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition-all transform hover:scale-105"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  '🦊 Connect MetaMask'
                )}
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Connected Wallet</p>
                  <p className="font-mono text-sm font-semibold text-gray-800">
                    {formatAddress(walletAddress)}
                  </p>
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-semibold transition-all"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isConnected && (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Total Credits */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 font-medium">Total Credits</p>
                  <span className="text-3xl">🏆</span>
                </div>
                <p className="text-4xl font-bold text-gray-800">{credits.length}</p>
                <p className="text-sm text-gray-500 mt-1">NFTs Owned</p>
              </div>

              {/* Total CO2 */}
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Total CO₂ Offset</p>
                  <span className="text-3xl">🌍</span>
                </div>
                <p className="text-4xl font-bold">{totalCO2.toFixed(2)}</p>
                <p className="text-sm opacity-90 mt-1">kg CO₂</p>
              </div>

              {/* Blockchain Status */}
              <div className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Network</p>
                  <span className="text-3xl">⛓️</span>
                </div>
                <p className="text-2xl font-bold">Sepolia</p>
                <p className="text-sm opacity-90 mt-1">Testnet Active</p>
              </div>
            </div>

            {/* Credits List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Your Carbon Credits
                </h2>
                <button
                  onClick={() => loadCredits()}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
                  <p className="mt-4 text-gray-600">Loading your credits...</p>
                </div>
              ) : credits.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📭</span>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    No carbon credits yet
                  </p>
                  <p className="text-gray-500">
                    Log some activities to start earning carbon credits!
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {credits.map((credit) => (
                    <div
                      key={credit.tokenId}
                      className="border-2 border-gray-200 rounded-xl p-5 hover:border-green-400 hover:shadow-lg transition-all bg-gradient-to-br from-white to-green-50"
                    >
                      {/* Token ID Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                          NFT #{credit.tokenId}
                        </span>
                        <span className="text-2xl">
                          {credit.activityType === 'transport' && '🚗'}
                          {credit.activityType === 'electricity' && '⚡'}
                          {credit.activityType === 'waste' && '♻️'}
                          {!['transport', 'electricity', 'waste'].includes(credit.activityType) && '🌿'}
                        </span>
                      </div>

                      {/* CO2 Amount */}
                      <div className="mb-3">
                        <p className="text-3xl font-bold text-gray-800">
                          {credit.co2Amount.toFixed(3)}
                          <span className="text-lg text-gray-600 ml-1">kg</span>
                        </p>
                        <p className="text-sm text-gray-600">CO₂ Offset</p>
                      </div>

                      {/* Activity Type */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-500">Activity</p>
                        <p className="font-semibold text-gray-700 capitalize">
                          {credit.activityType}
                        </p>
                      </div>

                      {/* Date */}
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          📅 {credit.timestamp.toLocaleDateString()} at{' '}
                          {credit.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <span className="text-3xl mr-4">💡</span>
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">What are Carbon Credits?</h3>
                  <p className="text-blue-800 text-sm mb-2">
                    Each carbon credit is an NFT (Non-Fungible Token) representing your CO₂ offset from sustainable activities.
                  </p>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>✅ Stored permanently on Ethereum blockchain</li>
                    <li>✅ Verifiable and transparent</li>
                    <li>✅ Tradeable in the marketplace (coming soon)</li>
                    <li>✅ Earn badges and rewards</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ============================================
// Alternative Compact Version
// ============================================

export function CompactCarbonWidget() {
  const { walletAddress, credits, isConnected, connect } = useWeb3();
  const totalCO2 = credits.reduce((sum, credit) => sum + credit.co2Amount, 0);

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <p className="text-gray-600 mb-3">Connect wallet to view credits</p>
        <button
          onClick={connect}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-bold text-gray-800 mb-3">🌱 Your Impact</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Credits:</span>
          <span className="font-semibold">{credits.length} NFTs</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total CO₂:</span>
          <span className="font-semibold text-green-600">{totalCO2.toFixed(2)} kg</span>
        </div>
      </div>
    </div>
  );
}
