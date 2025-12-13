'use client';

import Link from 'next/link';
import { Wallet, Wrench, Bot, Zap, Shield, Coins } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/30 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20">
              <Wallet className="h-16 w-16 text-white drop-shadow-lg" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
            AI Agent Tool Marketplace
          </h1>
          
          <p className="text-xl md:text-2xl text-white mb-4 drop-shadow-lg">
            Powered by <span className="font-bold text-white bg-white/20 px-3 py-1 rounded-lg">MNEE Stablecoin</span>
          </p>
          
          <p className="text-lg text-white/90 max-w-3xl mx-auto mb-10 drop-shadow-lg">
            Build, share, and monetize APIs for AI agents. Automatic payments with programmable money.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all transform hover:scale-105 hover:bg-indigo-50"
            >
              Get Started Free
            </Link>
            
            <Link
              href="/tools"
              className="bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl text-lg font-semibold border-2 border-white/40 hover:bg-white/30 transition-all hover:shadow-2xl"
            >
              Browse Tools
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <h2 className="text-3xl font-bold text-center text-white mb-12 drop-shadow-lg">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border border-white/20">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Upload Your Tools
            </h3>
            <p className="text-gray-600">
              Create and upload your API tools. Set your price in MNEE stablecoin. Get admin approval.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border border-white/20">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              AI Agents Use Tools
            </h3>
            <p className="text-gray-600">
              AI agents discover and use your tools via MCP protocol. Automatic selection based on needs.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border border-white/20">
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Get Paid Instantly
            </h3>
            <p className="text-gray-600">
              Automatic MNEE payments when tools are used. Track earnings in real-time on your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white/95 backdrop-blur-lg py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why StableTool?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Secure & Encrypted</h3>
                <p className="text-gray-600">
                  Your private keys are encrypted with AES-256. API metadata is hashed and verified on every use.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Coins className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Stable Payments</h3>
                <p className="text-gray-600">
                  MNEE is a USD-backed stablecoin on Ethereum. No volatility, predictable pricing.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Bot className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">MCP Compatible</h3>
                <p className="text-gray-600">
                  Built on Model Context Protocol. Works seamlessly with Claude, GPT, and other AI agents.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Fully Automated</h3>
                <p className="text-gray-600">
                  No manual approvals needed. AI agents pay and use tools automatically. You just earn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center text-white border border-white/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Monetize Your APIs?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Join the future of AI agent commerce. Get your wallet and start earning in minutes.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105"
          >
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  );
}
