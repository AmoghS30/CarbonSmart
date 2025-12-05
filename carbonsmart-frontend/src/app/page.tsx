'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ChartBarIcon,
  CreditCardIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CpuChipIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'

export default function HomePage() {
  const { data: session } = useSession()

  const features = [
    {
      icon: ChartBarIcon,
      title: 'Track Carbon Footprint',
      description: 'Log your daily activities and monitor their environmental impact.',
    },
    {
      icon: CreditCardIcon,
      title: 'Earn Carbon Credits',
      description: 'Get blockchain-verified NFT credits for environmental activities.',
    },
    {
      icon: SparklesIcon,
      title: 'AI-Powered Calculation',
      description: 'ML model predicts carbon emissions from activity descriptions.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Blockchain Verified',
      description: 'Credits are minted as NFTs on Ethereum Sepolia testnet.',
    },
    {
      icon: CpuChipIcon,
      title: 'Smart Contracts',
      description: 'ERC-721 based carbon credit tokens with full ownership.',
    },
    {
      icon: CircleStackIcon,
      title: 'Marketplace',
      description: 'Buy and sell carbon credits in the integrated marketplace.',
    },
  ]

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
              Track. Offset.
              <span className="block text-primary-600">Earn Credits.</span>
            </h1>

            <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto">
              A full-stack Web3 application for tracking carbon emissions and earning
              blockchain-verified NFT carbon credits for environmental activities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Link href="/activities" className="btn-primary text-lg px-8 py-4">
                  Log Activity
                  <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4">
                    Get Started
                    <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
                  </Link>
                  <Link href="/auth/signin" className="btn-outline text-lg px-8 py-4">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16"
          >
            <p className="text-sm text-neutral-500 mb-4">Built with</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['Next.js', 'Django', 'FastAPI', 'Solidity', 'PostgreSQL', 'Prisma'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-lg bg-white border border-neutral-200 text-sm font-medium text-neutral-600"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Project Features
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Key functionalities implemented in this carbon credit management system
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <div className="inline-flex p-3 rounded-xl bg-primary-100 text-primary-600 mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-neutral-600">
              Simple workflow for carbon tracking and credit earning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Log Activity',
                description: 'Enter your carbon emitting or offset activities',
              },
              {
                step: '2',
                title: 'AI Calculates',
                description: 'ML model predicts CO2 emissions/offset amount',
              },
              {
                step: '3',
                title: 'Mint NFT',
                description: 'Offset activities mint carbon credit NFTs',
              },
              {
                step: '4',
                title: 'Trade Credits',
                description: 'Buy or sell credits in the marketplace',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center card p-10 bg-gradient-to-br from-primary-600 to-primary-700"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Try the Demo
          </h2>
          <p className="text-primary-100 mb-6">
            Create an account or use demo credentials to explore all features.
            Connect a wallet to mint NFTs on Sepolia testnet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-primary-600 bg-white hover:bg-primary-50 transition-colors">
              Create Account
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/auth/signin" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white border border-white/30 hover:bg-white/10 transition-colors">
              Demo Login
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
