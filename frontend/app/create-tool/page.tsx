'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Plus, CheckCircle, AlertCircle, Loader2, Code, DollarSign, Link as LinkIcon, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export default function CreateToolPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    api_url: '',
    api_method: 'GET',
    api_headers: '{}',
    api_body_template: '{}',
    price_mnee: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Validate JSON fields
      if (formData.api_headers) {
        JSON.parse(formData.api_headers);
      }
      if (formData.api_body_template) {
        JSON.parse(formData.api_body_template);
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        api_url: formData.api_url,
        api_method: formData.api_method,
        api_headers: formData.api_headers || '{}',
        api_body_template: formData.api_body_template || '{}',
        price_mnee: parseFloat(formData.price_mnee),
      };

      await api.post('/api/tools/', payload);
      setSuccess(true);
      
      // Redirect to tools page after 2 seconds
      setTimeout(() => {
        router.push('/tools');
      }, 2000);
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message.includes('JSON')) {
        setError('Invalid JSON in headers or body template');
      } else {
        setError('Failed to create tool');
      }
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
      PATCH: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    };
    return colors[method] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      <Navbar />
      
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">Create New Tool</h1>
            </div>
            <p className="text-gray-400">Submit your API to the marketplace and start earning MNEE</p>
          </div>

          {/* x402 Protocol Info Banner */}
          <div className="mb-6 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-2 border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-500/30 p-3 rounded-xl flex-shrink-0">
                <Code className="h-6 w-6 text-purple-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  💡 Build with x402 Protocol
                </h3>
                <p className="text-gray-300 mb-3">
                  The <strong className="text-purple-300">x402 protocol</strong> is a standardized way to create payment-gated APIs that work seamlessly with AI agents. 
                  It enables automatic micropayments for API usage using the MNEE stablecoin on Ethereum.
                </p>
                <div className="bg-black/30 rounded-lg p-4 mb-3">
                  <h4 className="text-sm font-semibold text-purple-300 mb-2">Key Features:</h4>
                  <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                    <li>🔐 <strong>Authentication:</strong> HTTP 402 (Payment Required) status code</li>
                    <li>💰 <strong>Pricing:</strong> Set per-request prices in MNEE tokens</li>
                    <li>🤖 <strong>AI-Friendly:</strong> Compatible with MCP (Model Context Protocol)</li>
                    <li>⚡ <strong>Instant Payments:</strong> Automatic blockchain transactions on each API call</li>
                    <li>🛡️ <strong>Secure:</strong> Cryptographic verification of payments before API access</li>
                  </ul>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com/x402-protocol/specification"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    📖 Read Specification
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href="https://github.com/x402-protocol/examples"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    💻 View Examples
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-300 font-semibold">Tool created successfully!</p>
                <p className="text-green-400 text-sm">Pending admin approval. Redirecting to tools page...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Tool Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    placeholder="e.g., Weather API, Stock Price Lookup"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    required
                    rows={3}
                    placeholder="Describe what your API does and when AI agents should use it"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* API Configuration Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Code className="h-5 w-5" />
                API Configuration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    API Endpoint URL *
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.api_url}
                      onChange={(e) => handleChange('api_url', e.target.value)}
                      required
                      placeholder="https://api.example.com/v1/endpoint"
                      className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    HTTP Method *
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {HTTP_METHODS.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handleChange('api_method', method)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                          formData.api_method === method
                            ? getMethodColor(method)
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Request Headers (JSON)
                  </label>
                  <textarea
                    value={formData.api_headers}
                    onChange={(e) => handleChange('api_headers', e.target.value)}
                    rows={3}
                    placeholder='{"Content-Type": "application/json", "Authorization": "Bearer {{token}}"}'
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Use {`{{variable}}`} for dynamic values</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Request Body Template (JSON)
                  </label>
                  <textarea
                    value={formData.api_body_template}
                    onChange={(e) => handleChange('api_body_template', e.target.value)}
                    rows={4}
                    placeholder='{"query": "{{user_input}}", "options": {"limit": 10}}'
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Template for request body with variable placeholders</p>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing
              </h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Price per Request (MNEE) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_mnee}
                  onChange={(e) => handleChange('price_mnee', e.target.value)}
                  required
                  placeholder="0.10"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">You'll earn this amount each time your tool is used</p>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> Your tool will require admin approval before it appears in the marketplace. 
                Make sure your API is reliable and well-documented.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Tool...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Tool Created!
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Create Tool
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
