"use client";

import { Bell, Settings } from "lucide-react";

interface TopNavbarProps {
  title: string;
  subtitle?: string;
}

export default function TopNavbar({ title, subtitle }: TopNavbarProps) {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-white/10 px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-white/60 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-white/70" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-white/70" />
        </button>
      </div>
    </div>
  );
}
