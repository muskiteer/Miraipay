'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, XCircle, Clock, Users, Wrench, Loader2, DollarSign, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Tool {
  id: number;
  name: string;
  description: string;
  api_url: string;
  api_method: string;
  price_mnee: number;
  owner_id: number;
  approved: boolean;
  active: boolean;
  created_at: string;
}

interface User {
  id: number;
  email: string;
  public_key: string;
  is_admin: boolean;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [pendingTools, setPendingTools] = useState<Tool[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [toolsRes, usersRes] = await Promise.all([
        api.get('/api/admin/pending-tools'),
        api.get('/api/admin/users'),
      ]);
      setPendingTools(toolsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (toolId: number) => {
    setActionLoading(toolId);
    try {
      await api.post(`/api/admin/approve-tool/${toolId}`);
      setPendingTools((prev) => prev.filter((t) => t.id !== toolId));
    } catch (error) {
      setError('Failed to approve tool');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (toolId: number) => {
    setActionLoading(toolId);
    try {
      await api.post(`/api/admin/reject-tool/${toolId}`);
      setPendingTools((prev) => prev.filter((t) => t.id !== toolId));
    } catch (error) {
      setError('Failed to reject tool');
    } finally {
      setActionLoading(null);
    }
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-green-500/20 text-green-300 border-green-500/30',
      POST: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      PUT: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      DELETE: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return colors[method] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      <Navbar />
      
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <p className="text-gray-400">Manage tools, users, and platform operations</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Pending Tools</p>
                  <p className="text-4xl font-bold text-white">{pendingTools.length}</p>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-xl">
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Users</p>
                  <p className="text-4xl font-bold text-white">{users.length}</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-xl">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Admin Users</p>
                  <p className="text-4xl font-bold text-white">
                    {users.filter((u) => u.is_admin).length}
                  </p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <Shield className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Pending Tools Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Wrench className="h-6 w-6" />
              Pending Tool Approvals
            </h2>

            {pendingTools.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
                <p className="text-gray-400">No pending tools to review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/[0.15] transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{tool.name}</h3>
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold border ${getMethodColor(
                              tool.api_method
                            )}`}
                          >
                            {tool.api_method}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{tool.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="truncate">📍 {tool.api_url}</span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-yellow-400" />
                            {tool.price_mnee} MNEE
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(tool.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(tool.id)}
                        disabled={actionLoading === tool.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        {actionLoading === tool.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(tool.id)}
                        disabled={actionLoading === tool.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        {actionLoading === tool.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-5 w-5" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Users Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Registered Users
            </h2>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Wallet Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400 font-mono">
                            {user.public_key.slice(0, 10)}...{user.public_key.slice(-8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.is_admin ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Admin
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300 border border-gray-500/30">
                              User
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
