'use client';

import Link from 'next/link';
import { Wallet, Wrench, Bot, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-white/90 text-sm font-medium">Powered by mnee and X402 Protocol</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Build Tools.
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Earn MNEE.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
            The marketplace where AI agents discover and pay for your APIs automatically. Create once, earn forever.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="group bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Start Building
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/tool-guide"
              className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl text-lg font-semibold border border-white/30 hover:bg-white/20 transition-all"
            >
              View Guide
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mb-5">
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              1. Build Your Tool
            </h3>
            <p className="text-white/80 text-lg leading-relaxed">
              Create any API endpoint. Add X402 payment protocol. Set your price in MNEE.
            </p>
          </div>

          <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-14 h-14 rounded-xl flex items-center justify-center mb-5">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              2. AI Agents Discover
            </h3>
            <p className="text-white/80 text-lg leading-relaxed">
              Our AI agent finds and uses your tool automatically when users need it.
            </p>
          </div>

          <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-5">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              3. Get Paid Instantly
            </h3>
            <p className="text-white/80 text-lg leading-relaxed">
              Receive MNEE tokens automatically. Track all earnings in your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Developers
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Simple integration, powerful features, and fair compensation for your work
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Shield className="h-8 w-8 text-purple-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Secure</h3>
              <p className="text-white/70 text-sm">AES-256 encryption for all wallets</p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Wallet className="h-8 w-8 text-green-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Stable</h3>
              <p className="text-white/70 text-sm">MNEE stablecoin, no volatility</p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Bot className="h-8 w-8 text-blue-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">MCP Ready</h3>
              <p className="text-white/70 text-sm">Works with all AI agents</p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Zap className="h-8 w-8 text-yellow-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Instant</h3>
              <p className="text-white/70 text-sm">Automatic payments, no delays</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Earning Today
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join developers already monetizing their APIs with Miraipay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools"
              className="group bg-white text-purple-600 px-10 py-5 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Explore Tools
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/tool-guide"
              className="bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-xl text-lg font-semibold border border-white/30 hover:bg-white/20 transition-all"
            >
              View Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
