'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Send, Loader2, ExternalLink, CheckCircle, AlertCircle, Coins, Wrench, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolUsed?: string;
  toolResult?: any;
  pricePaid?: number;
  txHash?: string;
  timestamp: Date;
}

export default function AIAgentPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExecutingTool, setIsExecutingTool] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Check if Gemini API key is configured
    checkGeminiKey();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkGeminiKey = async () => {
    try {
      const response = await api.get('/api/settings/groq');
      setHasGeminiKey(response.data.has_key);
      if (!response.data.has_key) {
        setMessages([{
          role: 'assistant',
          content: '⚠️ Please configure your Gemini API key in Settings to use the AI Agent.',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error checking Gemini key:', error);
    } finally {
      setCheckingKey(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !hasGeminiKey) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/api/agent/chat', {
        message: input
      });

      // Check if a tool was used to show appropriate loading message
      if (response.data.tool_used) {
        setIsExecutingTool(true);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        toolUsed: response.data.tool_used,
        toolResult: response.data.tool_result,
        pricePaid: response.data.price_paid,
        txHash: response.data.transaction_hash,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsExecutingTool(false);
    } catch (error: any) {
      setIsExecutingTool(false);
      let errorMsg = 'Failed to process your request. Please try again.';
      
      // Handle different error response formats
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMsg = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMsg = error.response.data.detail.map((e: any) => e.msg).join(', ');
        }
      }
      
      const errorMessage: Message = {
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (checkingKey) {
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
      
      <div className="pt-16 h-screen flex flex-col">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-xl">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Agent Assistant</h1>
                <p className="text-sm text-gray-400">Ask anything - I'll find and use the right tools</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && hasGeminiKey && (
              <div className="text-center py-12">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                  <Bot className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome to AI Agent</h2>
                  <p className="text-gray-400 mb-6">
                    Ask me anything! I can search, analyze, calculate, and more using available tools.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <p className="text-sm text-gray-300">💡 "Search for Python tutorials"</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <p className="text-sm text-gray-300">📊 "Analyze this dataset"</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <p className="text-sm text-gray-300">🔍 "Find weather in New York"</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <p className="text-sm text-gray-300">🧮 "Calculate compound interest"</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                      : 'bg-white/10 backdrop-blur-xl border border-white/10 text-white'
                  } rounded-2xl p-4 shadow-lg`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs font-semibold text-indigo-400">AI Assistant</span>
                    </div>
                  )}
                  
                  {/* Render tool results */}
                  {message.role === 'assistant' && message.toolResult ? (
                    <>
                      {/* QR Code Generator Result */}
                      {message.toolResult.qr_code && (
                        <div className="space-y-3">
                          <div className="bg-white p-4 rounded-lg inline-block">
                            <img 
                              src={message.toolResult.qr_code} 
                              alt="Generated QR Code"
                              className="w-64 h-64 object-contain"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = message.toolResult.qr_code
                              link.download = 'qr-code.png'
                              link.click()
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-xl"
                          >
                            <Download className="h-4 w-4" />
                            Download QR Code
                          </button>
                        </div>
                      )}
                      
                      {/* Movie Booking Result */}
                      {message.toolResult.booking_id && (
                        <div className="space-y-3">
                          <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-bold text-purple-300">🎬 {message.toolResult.movie}</h3>
                              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Confirmed</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-400">Theater</p>
                                <p className="text-white font-semibold">{message.toolResult.theater}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">City</p>
                                <p className="text-white font-semibold">{message.toolResult.city}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Date</p>
                                <p className="text-white font-semibold">{message.toolResult.date}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Showtime</p>
                                <p className="text-white font-semibold">{message.toolResult.showtime}</p>
                              </div>
                            </div>
                            
                            <div className="border-t border-white/10 pt-3">
                              <p className="text-gray-400 text-sm mb-1">Seats</p>
                              <div className="flex flex-wrap gap-2">
                                {message.toolResult.seats?.map((seat: string) => (
                                  <span key={seat} className="bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded text-sm font-mono">
                                    {seat}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center border-t border-white/10 pt-3">
                              {/*
                              <div>
                                <p className="text-gray-400 text-xs">Total Price</p>
                                <p className="text-2xl font-bold text-yellow-400">${message.toolResult.total_price}</p>
                                <p className="text-xs text-gray-400">{message.toolResult.total_tickets} tickets × ${message.toolResult.price_per_ticket}</p>
                              </div>
                             */ }
                              <div className="text-right">
                                <p className="text-gray-400 text-xs">Booking ID</p>
                                <p className="text-sm font-mono text-purple-300">{message.toolResult.booking_id}</p>
                              </div>
                            </div>
                            
                            {message.toolResult.qr_code_url && (
                              <div className="border-t border-white/10 pt-3">
                                <p className="text-gray-400 text-xs mb-2">Ticket QR Code</p>
                                <img 
                                  src={message.toolResult.qr_code_url} 
                                  alt="Booking QR Code"
                                  className="w-40 h-40 bg-white p-2 rounded"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Show text response only if no special result format */}
                      {!message.toolResult.qr_code && !message.toolResult.booking_id && (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  {message.toolUsed && (
                    <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Wrench className="h-3 w-3 text-green-400" />
                        <span className="text-green-400 font-semibold">Tool Used:</span>
                        <span className="text-gray-300">{message.toolUsed}</span>
                      </div>
                      
                      {message.pricePaid !== undefined && (
                        <div className="flex items-center gap-2 text-xs">
                          <Coins className="h-3 w-3 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">Price:</span>
                          <span className="text-gray-300">{message.pricePaid} MNEE</span>
                        </div>
                      )}
                      
                      {message.txHash && (
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-blue-400" />
                          <span className="text-blue-400 font-semibold">Transaction:</span>
                          <a
                            href={`https://etherscan.io/tx/${message.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 hover:text-blue-200 flex items-center gap-1"
                          >
                            {message.txHash.slice(0, 10)}...{message.txHash.slice(-8)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
                      <span className="text-sm text-gray-300">
                        {isExecutingTool ? 'Executing tool...' : 'AI is thinking...'}
                      </span>
                    </div>
                    {isExecutingTool && (
                      <div className="flex items-start gap-2 pl-8">
                        <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-300/80">
                          First request may take up to 2 minutes as the service wakes up. Subsequent requests will be faster.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-black/30 backdrop-blur-xl border-t border-white/10 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {!hasGeminiKey ? (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-300 mb-2">
                    Configure your Gemini API key to start using the AI Agent
                  </p>
                  <button
                    onClick={() => router.push('/settings')}
                    className="text-sm bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Go to Settings
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={loading}
                  rows={1}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 resize-none"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
