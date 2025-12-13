'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Wallet, Home, Wrench, Bot, BarChart3, Settings, LogOut } from 'lucide-react';
import { getStoredUser, clearAuth, type User } from '@/lib/auth';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="bg-white/10 backdrop-blur-xl text-white shadow-2xl border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 font-bold text-xl hover:scale-105 transition-transform">
            <Wallet className="h-8 w-8 drop-shadow-lg" />
            <span className="drop-shadow-lg">StableTool</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-1 hover:text-white/80 transition hover:scale-105">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            {user && (
              <>
                <Link href="/tools" className="flex items-center space-x-1 hover:text-white/80 transition hover:scale-105">
                  <Wrench className="h-4 w-4" />
                  <span>Browse Tools</span>
                </Link>
                
                <Link href="/create-tool" className="flex items-center space-x-1 hover:text-white/80 transition hover:scale-105">
                  <Wrench className="h-4 w-4" />
                  <span>Create Tool</span>
                </Link>
                
                <Link href="/ai-agent" className="flex items-center space-x-1 hover:text-white/80 transition hover:scale-105">
                  <Bot className="h-4 w-4" />
                  <span>AI Agent</span>
                </Link>
                
                <Link href="/dashboard" className="flex items-center space-x-1 hover:text-white/80 transition hover:scale-105">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                {user.is_admin && (
                  <Link href="/admin" className="flex items-center space-x-1 hover:text-white/80 transition hover:scale-105">
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium drop-shadow-lg">{user.email}</span>
                  <span className="text-xs text-white/70 font-mono drop-shadow-lg">{user.public_key.slice(0, 10)}...</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-white/30 transition font-medium border border-white/30 hover:scale-105"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg hover:bg-white/10 transition font-medium hover:scale-105"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-white/30 transition font-medium border border-white/30 hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-white/20 bg-white/5 backdrop-blur-xl">
            <Link href="/" className="block px-4 py-2 hover:bg-white/10 rounded-lg transition">
              Home
            </Link>
            
            {user ? (
              <>
                <Link href="/tools" className="block px-4 py-2 hover:bg-indigo-700 rounded-lg transition">
                  Browse Tools
                </Link>
                <Link href="/create-tool" className="block px-4 py-2 hover:bg-indigo-700 rounded-lg transition">
                  Create Tool
                </Link>
                <Link href="/ai-agent" className="block px-4 py-2 hover:bg-indigo-700 rounded-lg transition">
                  AI Agent
                </Link>
                <Link href="/dashboard" className="block px-4 py-2 hover:bg-indigo-700 rounded-lg transition">
                  Dashboard
                </Link>
                {user.is_admin && (
                  <Link href="/admin" className="block px-4 py-2 hover:bg-indigo-700 rounded-lg transition">
                    Admin Panel
                  </Link>
                )}
                <div className="px-4 py-2 text-sm border-t border-indigo-500 mt-2">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-xs text-indigo-200 font-mono">{user.public_key.slice(0, 20)}...</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-2 hover:bg-indigo-700 rounded-lg transition">
                  Login
                </Link>
                <Link href="/register" className="block px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
