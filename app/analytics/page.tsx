'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, TrendingDown, Users, Clock, CheckCircle, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { DUMMY_QUIZ_SUBMISSIONS } from '@/lib/dummy-data'

interface AnalyticsData {
  totalSubmissions: number
  inProgress: number
  completed: number
  pending: number
  averageCompletionTime: number
  submissionsByMonth: { month: string; count: number }[]
  statusDistribution: { status: string; count: number }[]
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSubmissions: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
    averageCompletionTime: 0,
    submissionsByMonth: [],
    statusDistribution: []
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Use dummy quiz submissions data
      const submissions = DUMMY_QUIZ_SUBMISSIONS

      // Calculate analytics
      const totalSubmissions = submissions.length
      const inProgress = submissions.filter(s => s.logo_status === 'in_progress').length
      const completed = submissions.filter(s => s.logo_status === 'completed').length
      const pending = submissions.filter(s => s.logo_status === 'pending').length

      // Calculate average completion time (days between created_at and updated_at for completed items)
      const completedItems = submissions.filter(s => s.logo_status === 'completed')
      const totalDays = completedItems.reduce((sum, item) => {
        const created = new Date(item.created_at)
        const updated = new Date(item.updated_at)
        const days = (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        return sum + days
      }, 0)
      const averageCompletionTime = completedItems.length > 0 ? totalDays / completedItems.length : 0

      // Group by month
      const monthMap = new Map<string, number>()
      submissions.forEach(submission => {
        const date = new Date(submission.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1)
      })
      const submissionsByMonth = Array.from(monthMap.entries())
        .map(([month, count]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6) // Last 6 months

      // Status distribution
      const statusDistribution = [
        { status: 'Completed', count: completed },
        { status: 'In Progress', count: inProgress },
        { status: 'Pending', count: pending }
      ]

      setAnalytics({
        totalSubmissions,
        inProgress,
        completed,
        pending,
        averageCompletionTime,
        submissionsByMonth,
        statusDistribution
      })
    } catch (error) {
      console.error('❌ Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate percentage change (mock data for now)
  const getPercentageChange = (current: number, previous: number = current * 0.8) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const completionChange = getPercentageChange(analytics.completed)
  const inProgressChange = getPercentageChange(analytics.inProgress)

  return (
    <Sidebar>
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-xl font-semibold text-gray-900">Project Analytics</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Insights and metrics for your projects
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8359ee] mx-auto mb-3"></div>
                <p className="text-xs text-gray-500">Loading analytics...</p>
              </div>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="border border-gray-100 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Total Submissions</p>
                          <p className="text-xl font-semibold text-gray-900">{analytics.totalSubmissions}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-[#8359ee]/10">
                          <BarChart3 className="h-4 w-4 text-[#8359ee]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-100 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Completed</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xl font-semibold text-gray-900">{analytics.completed}</p>
                            {completionChange > 0 ? (
                              <div className="flex items-center text-[10px] text-green-600">
                                <ArrowUpRight className="h-3 w-3" />
                                <span>{completionChange.toFixed(0)}%</span>
                              </div>
                            ) : completionChange < 0 ? (
                              <div className="flex items-center text-[10px] text-red-600">
                                <ArrowDownRight className="h-3 w-3" />
                                <span>{Math.abs(completionChange).toFixed(0)}%</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-100 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">In Progress</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xl font-semibold text-gray-900">{analytics.inProgress}</p>
                            {inProgressChange > 0 ? (
                              <div className="flex items-center text-[10px] text-green-600">
                                <ArrowUpRight className="h-3 w-3" />
                                <span>{inProgressChange.toFixed(0)}%</span>
                              </div>
                            ) : inProgressChange < 0 ? (
                              <div className="flex items-center text-[10px] text-red-600">
                                <ArrowDownRight className="h-3 w-3" />
                                <span>{Math.abs(inProgressChange).toFixed(0)}%</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-100 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Avg. Completion</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {analytics.averageCompletionTime > 0 
                              ? `${analytics.averageCompletionTime.toFixed(1)} days`
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-50">
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Submissions Over Time */}
                  <Card className="border border-gray-100 shadow-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-900">Submissions Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.submissionsByMonth.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.submissionsByMonth.map((item, index) => {
                            const maxCount = Math.max(...analytics.submissionsByMonth.map(i => i.count))
                            const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                            return (
                              <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">{item.month}</span>
                                  <span className="font-medium text-gray-900">{item.count}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div
                                    className="bg-[#8359ee] h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-4">No data available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Status Distribution */}
                  <Card className="border border-gray-100 shadow-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-900">Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.statusDistribution.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.statusDistribution.map((item, index) => {
                            const total = analytics.statusDistribution.reduce((sum, i) => sum + i.count, 0)
                            const percentage = total > 0 ? (item.count / total) * 100 : 0
                            const colors = {
                              'Completed': 'bg-green-500',
                              'In Progress': 'bg-blue-500',
                              'Pending': 'bg-yellow-500'
                            }
                            return (
                              <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${colors[item.status as keyof typeof colors] || 'bg-gray-400'}`} />
                                    <span className="text-gray-600">{item.status}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900">{item.count}</span>
                                    <span className="text-gray-400">({percentage.toFixed(0)}%)</span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div
                                    className={`${colors[item.status as keyof typeof colors] || 'bg-gray-400'} h-2 rounded-full transition-all`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-4">No data available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border border-gray-100 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Pending Projects</p>
                          <p className="text-lg font-semibold text-gray-900">{analytics.pending}</p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                          Pending
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-100 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Completion Rate</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {analytics.totalSubmissions > 0
                              ? `${((analytics.completed / analytics.totalSubmissions) * 100).toFixed(1)}%`
                              : '0%'}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-green-50">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-100 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Active Projects</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {analytics.inProgress + analytics.pending}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </Sidebar>
  )
}
