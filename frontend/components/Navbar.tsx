"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Wallet,
  Home,
  Wrench,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Shield,
  User,
  DollarSign,
  BookOpen,
} from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Miraipay
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {!user ? (
              // Not logged in - Show Sign In / Sign Up
              <>
                <Link href="/">
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive("/")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </button>
                </Link>

                <Link href="/tool-guide">
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive("/tool-guide")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Tool Guide</span>
                  </button>
                </Link>

                <Link href="/login">
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </button>
                </Link>

                <Link href="/register">
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-indigo-500/50">
                    <Sparkles className="h-4 w-4" />
                    <span>Sign Up</span>
                  </button>
                </Link>
              </>
            ) : (
              // Logged in - Show Dashboard, AI Agent, Settings, Logout
              <>
                <Link href="/dashboard">
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive("/dashboard")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                </Link>

                <Link href="/tools">
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive("/tools")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Wrench className="h-4 w-4" />
                    <span>Browse Tools</span>
                  </button>
                </Link>

                <Link href="/ai-agent">
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive("/ai-agent")
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Bot className="h-4 w-4" />
                    <span>AI Agent</span>
                  </button>
                </Link>

                <Link href="/wallet">
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive("/wallet")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Wallet</span>
                  </button>
                </Link>

                <Link href="/tool-guide">
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive("/tool-guide")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Tool Guide</span>
                  </button>
                </Link>

                <Link href="/settings">
                  <button
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive("/settings")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                </Link>

                {user.is_admin && (
                  <Link href="/admin">
                    <button
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        isActive("/admin")
                          ? "bg-white/20 text-white"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </button>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all ml-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>

                {/* User Badge */}
                <div className="ml-4 flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300 truncate max-w-[120px]">
                    {user.email.split("@")[0]}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-gray-900/98 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2">
            {!user ? (
              <>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive("/")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </button>
                </Link>

                <Link href="/tool-guide" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive("/tool-guide")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Tool Guide</span>
                  </button>
                </Link>

                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition-all">
                    <User className="h-5 w-5" />
                    <span>Sign In</span>
                  </button>
                </Link>

                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
                    <Sparkles className="h-5 w-5" />
                    <span>Sign Up</span>
                  </button>
                </Link>
              </>
            ) : (
              <>
                <div className="px-4 py-3 mb-2 rounded-lg bg-white/10 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300">{user.email}</span>
                  </div>
                </div>

                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive("/dashboard")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Dashboard</span>
                  </button>
                </Link>

                <Link href="/tools" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive("/tools")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Wrench className="h-5 w-5" />
                    <span>Browse Tools</span>
                  </button>
                </Link>

                <Link href="/ai-agent" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive("/ai-agent")
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Bot className="h-5 w-5" />
                    <span>AI Agent</span>
                  </button>
                </Link>

                <Link href="/wallet" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive("/wallet")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <DollarSign className="h-5 w-5" />
                    <span>Wallet</span>
                  </button>
                </Link>

                <Link href="/tool-guide" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive("/tool-guide")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Tool Guide</span>
                  </button>
                </Link>

                <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive("/settings")
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                </Link>

                {user.is_admin && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <button
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive("/admin")
                          ? "bg-white/20 text-white"
                          : "text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <Shield className="h-5 w-5" />
                      <span>Admin</span>
                    </button>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all border-t border-white/10 mt-2 pt-4"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
