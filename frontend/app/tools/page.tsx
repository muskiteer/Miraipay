'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Wrench, DollarSign, CheckCircle, Clock, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
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

export default function ToolsPage() {
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTools();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTools(filtered);
    } else {
      setFilteredTools(tools);
    }
  }, [searchQuery, tools]);

  const fetchTools = async () => {
    try {
      const response = await api.get('/api/tools');
      // Only show approved and active tools
      const approvedTools = response.data.filter((t: Tool) => t.approved && t.active);
      setTools(approvedTools);
      setFilteredTools(approvedTools);
    } catch (error) {
      console.error('Error fetching tools:', error);
      setError('Failed to load tools');
    } finally {
      setLoading(false);
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
            <h1 className="text-4xl font-bold text-white mb-2">Browse Tools</h1>
            <p className="text-gray-400">Discover and use APIs for your AI agents</p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-xl"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Tools Grid */}
          {filteredTools.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10">
                <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No Tools Found</h2>
                <p className="text-gray-400 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'No approved tools available yet'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => router.push('/create-tool')}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Create First Tool
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/[0.15] transition-all shadow-lg hover:shadow-xl group"
                >
                  {/* Tool Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <Wrench className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-green-400 font-semibold">Approved</span>
                    </div>
                  </div>

                  {/* Tool Name */}
                  <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
                  
                  {/* Tool Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{tool.description}</p>

                  {/* API Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold border ${getMethodColor(
                          tool.api_method
                        )}`}
                      >
                        {tool.api_method}
                      </span>
                      <span className="text-xs text-gray-400 truncate">{tool.api_url}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-yellow-400" />
                      <span className="text-lg font-bold text-white">{tool.price_mnee}</span>
                      <span className="text-sm text-gray-400">MNEE</span>
                    </div>
                    <button
                      onClick={() => router.push('/ai-agent')}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                    >
                      Use Tool
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>Created {new Date(tool.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Footer */}
          <div className="mt-12 bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-white mb-1">{filteredTools.length}</p>
                <p className="text-gray-400 text-sm">Available Tools</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {filteredTools.reduce((sum, tool) => sum + tool.price_mnee, 0).toFixed(2)}
                </p>
                <p className="text-gray-400 text-sm">Total MNEE Value</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {filteredTools.length > 0
                    ? (
                        filteredTools.reduce((sum, tool) => sum + tool.price_mnee, 0) /
                        filteredTools.length
                      ).toFixed(2)
                    : '0.00'}
                </p>
                <p className="text-gray-400 text-sm">Average Price (MNEE)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
