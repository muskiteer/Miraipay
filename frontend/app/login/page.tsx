"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as loginUser, saveAuth } from "@/lib/auth";
import AnimatedBackground from "@/components/AnimatedBackground";
import AuthSwitch from "@/components/ui/auth-switch";
import { Lock, Mail, Wrench, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authData = await loginUser(email, password);
      saveAuth(authData);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="w-full max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden md:block text-white space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                <Wrench className="w-7 h-7" />
              </div>
              <span className="text-3xl font-bold">StableTool</span>
            </Link>
            
            <h1 className="text-5xl font-bold leading-tight drop-shadow-lg">
              Welcome Back to the Future of AI Commerce
            </h1>
            
            <p className="text-xl text-white/90 drop-shadow-md">
              Sign in to access your tool marketplace dashboard and start earning MNEE tokens.
            </p>
            
            <div className="space-y-4 pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🔐</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Secure Wallet</h3>
                  <p className="text-white/80">Your Ethereum wallet is encrypted and protected</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💰</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Track Earnings</h3>
                  <p className="text-white/80">Monitor your MNEE earnings in real-time</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Agent Ready</h3>
                  <p className="text-white/80">Your tools are accessible via MCP protocol</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/40">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Sign In
                </h2>
                <p className="text-gray-600">
                  Enter your credentials to access your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                    <div className="text-sm text-red-700 text-center">{error}</div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-gray-900"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-gray-900"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <span>{loading ? "Signing in..." : "Sign In"}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="pt-4 border-t border-gray-200">
                  <AuthSwitch mode="login" />
                </div>
              </form>
            </div>

            {/* Mobile Branding */}
            <div className="md:hidden mt-6 text-center">
              <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors">
                <span className="text-sm">← Back to home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
