'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Users, Shield, TrendingUp } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  isPrimary?: boolean
}

function MetricCard({ title, value, description, icon: Icon, trend, isPrimary = false }: MetricCardProps) {
  return (
    <Card className={`${isPrimary ? 'bg-[#8359ee] text-white' : 'bg-white'} border border-gray-200 shadow-none`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${isPrimary ? 'text-white/80' : 'text-gray-600'}`}>
              {title}
            </p>
            <div className={`text-3xl font-bold mt-2 ${isPrimary ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </div>
            {trend && (
              <div className="flex items-center mt-2">
                <TrendingUp className={`h-4 w-4 mr-1 ${isPrimary ? 'text-white/80' : 'text-green-500'}`} />
                <span className={`text-sm ${isPrimary ? 'text-white/80' : 'text-green-600'}`}>
                  {trend}
                </span>
              </div>
            )}
            <p className={`text-xs mt-1 ${isPrimary ? 'text-white/70' : 'text-gray-500'}`}>
              {description}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${isPrimary ? 'bg-white/20' : 'bg-[#8359ee]/10'}`}>
            <Icon className={`h-6 w-6 ${isPrimary ? 'text-white' : 'text-[#8359ee]'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardMetricsProps {
  quizCompletions: number
  dailyActiveUsers: number
  totalAdmins: number
}

export default function DashboardMetrics({ 
  quizCompletions, 
  dailyActiveUsers, 
  totalAdmins 
}: DashboardMetricsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <MetricCard
        title="Quiz Completions"
        value={quizCompletions.toLocaleString()}
        description="Users who completed quizzes"
        icon={CheckCircle}
        trend="+12% from last week"
        isPrimary={true}
      />
      <MetricCard
        title="Daily Active Users"
        value={dailyActiveUsers.toLocaleString()}
        description="Users active today"
        icon={Users}
        trend="+8% from yesterday"
      />
      <MetricCard
        title="Total Admins"
        value={totalAdmins.toLocaleString()}
        description="Admin accounts in system"
        icon={Shield}
        trend="+2 this month"
      />
    </div>
  )
}
