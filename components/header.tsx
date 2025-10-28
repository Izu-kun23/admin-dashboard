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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Search */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search task"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 border-gray-300 focus:border-[#8359ee] focus:ring-[#8359ee]"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">⌘F</kbd>
            </div>
          </div>
        </div>

        {/* Right side - Actions and Profile */}
        <div className="flex items-center space-x-4">
          {/* Action Buttons */}
          <Button className="bg-[#8359ee] hover:bg-[#7245e8] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
          <Button variant="outline" className="border-[#8359ee] text-[#8359ee] hover:bg-[#8359ee] hover:text-white">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>

          {/* Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 bg-[#8359ee] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">
                {user?.name || 'Admin User'}
              </div>
              <div className="text-gray-500">
                {user?.email || 'admin@example.com'}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} className="text-gray-500 hover:text-gray-700">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
