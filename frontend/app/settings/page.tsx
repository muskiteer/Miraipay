"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Settings, Key, CheckCircle, AlertCircle, Save, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [groqApiKey, setGroqApiKey] = useState("");
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    checkAuth();
    checkExistingKey();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await api.get("/api/auth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Authentication check failed:", error);
      router.push("/login");
    }
  };

  const checkExistingKey = async () => {
    try {
      const response = await api.get("/api/settings/groq");
      setHasExistingKey(response.data.has_key);
    } catch (error) {
      console.error("Failed to check existing key:", error);
    }
  };

  const handleSaveKey = async () => {
    if (!groqApiKey.trim()) {
      setMessage({ type: "error", text: "Please enter a valid API key" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.post("/api/settings/groq", {
        api_key: groqApiKey,
      });

      setMessage({ type: "success", text: response.data.message });
      setHasExistingKey(true);
      setGroqApiKey("");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "Failed to save API key",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!confirm("Are you sure you want to delete your Groq API key?")) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.delete("/api/settings/groq");
      setMessage({ type: "success", text: response.data.message });
      setHasExistingKey(false);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "Failed to delete API key",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <div className="ml-64">
        <TopNavbar title="Settings" subtitle="Configure your preferences" />
        
        <main className="p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Groq API Key Section */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Groq API Key</h2>
                  <p className="text-gray-400 text-sm">Configure your Groq API key for AI agent functionality</p>
                </div>
              </div>

              {/* Status Badge */}
              {hasExistingKey && (
                <div className="mb-6 flex items-center gap-2 bg-green-900/30 border border-green-500/50 rounded-lg px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium">API Key Configured</span>
                </div>
              )}

              {/* Message Display */}
              {message && (
                <div className={`mb-6 flex items-center gap-2 rounded-lg px-4 py-3 ${
                  message.type === "success"
                    ? "bg-green-900/30 border border-green-500/50"
                    : "bg-red-900/30 border border-red-500/50"
                }`}>
                  {message.type === "success" ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={message.type === "success" ? "text-green-300" : "text-red-300"}>
                    {message.text}
                  </span>
                </div>
              )}

              {/* API Key Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    {hasExistingKey ? "Update API Key" : "Enter API Key"}
                  </label>
                  <input
                    type="password"
                    value={groqApiKey}
                    onChange={(e) => setGroqApiKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    disabled={isLoading}
                  />
                  <p className="mt-2 text-sm text-gray-400">
                    Get your API key from{" "}
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Groq Console
                    </a>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveKey}
                    disabled={isLoading || !groqApiKey.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50"
                  >
                    <Save className="w-5 h-5" />
                    {isLoading ? "Saving..." : hasExistingKey ? "Update Key" : "Save Key"}
                  </button>

                  {hasExistingKey && (
                    <button
                      onClick={handleDeleteKey}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 bg-red-900/30 border border-red-500/50 text-red-300 py-3 px-6 rounded-xl font-semibold hover:bg-red-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">Security Notice</p>
                    <p className="text-blue-400">
                      Your API key is encrypted using AES-256 encryption and stored securely. It is never exposed in API responses.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Information */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Model Information</h2>
                  <p className="text-gray-400 text-sm">Default AI model configuration</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <span className="text-gray-300">Default Model</span>
                  <span className="text-white font-mono bg-gray-800 px-3 py-1 rounded-lg">llama-3.1-70b-versatile</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <span className="text-gray-300">Temperature</span>
                  <span className="text-white font-mono bg-gray-800 px-3 py-1 rounded-lg">0.3 (tool selection) / 0.7 (responses)</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <span className="text-gray-300">Max Tokens</span>
                  <span className="text-white font-mono bg-gray-800 px-3 py-1 rounded-lg">500 (selection) / 1000 (responses)</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
