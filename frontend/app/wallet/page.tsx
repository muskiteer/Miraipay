'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw,
  DollarSign,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Transaction {
  id: number;
  tool_id: number;
  user_id: number;
  amount_mnee: number;
  tx_hash: string;
  status: string;
  created_at: string;
  tool_name?: string;
  type: 'sent' | 'received';
}

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Stats
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Get wallet address from stored user data
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setWalletAddress(user.public_key || '');
    }

    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setError('');
      setLoading(true);
      
      // Fetch balance
      const balanceRes = await api.get('/api/payments/balance');
      console.log('Balance API response:', balanceRes.data);
      const balanceValue = parseFloat(balanceRes.data.balance_mnee) || 0;
      console.log('Parsed balance value:', balanceValue);
      setBalance(balanceValue);

      // Fetch transactions
      const transactionsRes = await api.get('/api/payments/transactions');
      const txs = transactionsRes.data || [];
      
      // Get user ID to determine if sent or received
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : null;
      
      // Categorize transactions based on from_user_id and to_user_id
      // Exclude self-transactions (where user sent to themselves)
      const categorizedTxs = txs
        .filter((tx: any) => tx.from_user_id !== tx.to_user_id)
        .map((tx: any) => ({
          ...tx,
          type: tx.from_user_id === userId ? 'sent' : 'received'
        }));
      
      setTransactions(categorizedTxs);

      // Calculate totals (already filtered for non-self transactions)
      const earned = categorizedTxs
        .filter((tx: Transaction) => tx.type === 'received')
        .reduce((sum: number, tx: Transaction) => sum + tx.amount_mnee, 0);
      
      const spent = categorizedTxs
        .filter((tx: Transaction) => tx.type === 'sent')
        .reduce((sum: number, tx: Transaction) => sum + tx.amount_mnee, 0);
      
      setTotalEarned(earned);
      setTotalSpent(spent);

    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-xl">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">My Wallet</h1>
              </div>
              <p className="text-gray-400">Manage your MNEE balance and transactions</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Balance Card */}
          <div className="mb-8 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-xl border-2 border-yellow-500/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-yellow-300 text-sm font-semibold mb-2">Total Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-white">{balance.toFixed(2)}</span>
                  <span className="text-2xl text-yellow-300 font-semibold">MNEE</span>
                </div>
                <p className="text-yellow-200/70 text-sm mt-2">≈ ${balance.toFixed(2)} USD</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl">
                <DollarSign className="h-16 w-16 text-yellow-300" />
              </div>
            </div>

            {/* Wallet Address */}
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-yellow-300 text-xs font-semibold mb-2">WALLET ADDRESS</p>
              <div className="flex items-center gap-3">
                <code className="text-white font-mono text-sm flex-1 break-all">
                  {walletAddress}
                </code>
                <button
                  onClick={copyAddress}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all flex-shrink-0"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-white" />
                  )}
                </button>
                <a
                  href={`https://etherscan.io/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all flex-shrink-0"
                  title="View on Etherscan"
                >
                  <ExternalLink className="h-4 w-4 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Earned */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-500/20 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-white">{totalEarned.toFixed(2)}</p>
              <p className="text-green-400 text-sm mt-1">MNEE</p>
            </div>

            {/* Total Spent */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-500/20 p-3 rounded-xl">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                </div>
                <ArrowDownLeft className="h-5 w-5 text-red-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Spent</p>
              <p className="text-3xl font-bold text-white">{totalSpent.toFixed(2)}</p>
              <p className="text-red-400 text-sm mt-1">MNEE</p>
            </div>

            {/* Net Balance */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500/20 p-3 rounded-xl">
                  <DollarSign className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Net Balance</p>
              <p className="text-3xl font-bold text-white">
                {balance.toFixed(2)}
              </p>
              <p className="text-green-400 text-sm mt-1">
                MNEE
              </p>
            </div>
          </div>

          {/* Transactions Section */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Transaction History
            </h2>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Transactions Yet</h3>
                <p className="text-gray-400 mb-6">
                  Start using tools or earning MNEE to see your transaction history
                </p>
                <button
                  onClick={() => router.push('/tools')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Browse Tools
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Icon */}
                        <div className={`p-3 rounded-xl ${
                          tx.type === 'received' 
                            ? 'bg-green-500/20' 
                            : 'bg-red-500/20'
                        }`}>
                          {tx.type === 'received' ? (
                            <ArrowUpRight className="h-5 w-5 text-green-400" />
                          ) : (
                            <ArrowDownLeft className="h-5 w-5 text-red-400" />
                          )}
                        </div>

                        {/* Transaction Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold">
                              {tx.type === 'received' ? 'Received' : 'Sent'}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              tx.status === 'completed' 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">
                            {tx.tool_name || `Tool #${tx.tool_id}`}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(tx.created_at).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <a
                              href={`https://etherscan.io/tx/${tx.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 font-mono"
                            >
                              {tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-8)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          tx.type === 'received' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {tx.type === 'received' ? '+' : '-'}{tx.amount_mnee.toFixed(2)}
                        </p>
                        <p className="text-gray-400 text-sm">MNEE</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
