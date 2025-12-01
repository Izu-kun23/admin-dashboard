'use client'

import { useState } from 'react'
import { Search, Bell, MessageSquare, Plus, Upload, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface HeaderProps {
  onLogout: () => void
  user?: {
    name: string
    email: string
    id?: string
  } | null
}

export default function Header({ onLogout, user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Search */}
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-64 text-xs border-gray-200 focus:border-gray-300 focus:ring-0"
            />
          </div>
        </div>

        {/* Right side - Actions and Profile */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4 text-gray-500" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Profile */}
          <div className="flex items-center space-x-2 pl-3 border-l border-gray-100">
            <div className="w-7 h-7 bg-[#8359ee] rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div className="text-xs">
              <div className="font-medium text-gray-900">
                {user?.name || 'Admin'}
              </div>
              <div className="text-gray-500 text-[10px]">
                {user?.email || 'admin@example.com'}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} className="h-8 w-8 text-gray-400 hover:text-gray-600">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
