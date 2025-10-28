'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Activity, Clock, User, CheckCircle, XCircle, Search, Calendar, MoreHorizontal, Plus, Table as TableIcon, Filter, ArrowUpDown, Users, DollarSign, Tag, Calendar as CalendarIcon } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface QuizSubmission {
  id: string
  full_name: string
  email: string
  phone_number?: string
  brand_name: string
  logo_status: string
  brand_goals: string[]
  online_presence: string
  audience: string[]
  brand_style: string
  timeline: string
  preferred_kit?: string
  created_at: string
  updated_at: string
}

export default function ActivityPage() {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch quiz submissions
  const fetchQuizSubmissions = async () => {
    try {
      console.log('🔍 Fetching quiz submissions...')
      
      // Check if demo session is active
      const demoSession = document.cookie.includes('demo_session=active')
      
      if (demoSession) {
        // For demo, create some sample data
        const sampleSubmissions: QuizSubmission[] = [
          {
            id: 1,
            user_id: 'demo-user-1',
            quiz_id: 'quiz-1',
            score: 85,
            total_questions: 10,
            submitted_at: new Date().toISOString(),
            status: 'completed',
            user_name: 'John Doe',
            user_email: 'john@example.com'
          },
          {
            id: 2,
            user_id: 'demo-user-2',
            quiz_id: 'quiz-2',
            score: 72,
            total_questions: 15,
            submitted_at: new Date(Date.now() - 3600000).toISOString(),
            status: 'completed',
            user_name: 'Jane Smith',
            user_email: 'jane@example.com'
          },
          {
            id: 3,
            user_id: 'demo-user-3',
            quiz_id: 'quiz-1',
            score: 45,
            total_questions: 10,
            submitted_at: new Date(Date.now() - 7200000).toISOString(),
            status: 'failed',
            user_name: 'Bob Johnson',
            user_email: 'bob@example.com'
          }
        ]
        setSubmissions(sampleSubmissions)
      } else {
        // Use Supabase directly for authenticated users
        console.log('🔍 Attempting to fetch from quiz_submissions table...')
        
        // First try a simple query without joins to see if table exists
        const { data, error } = await supabase
          .from('quiz_submissions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) {
          console.error('❌ Error fetching quiz submissions:', error)
          console.log('📝 Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          
          // Check for various error conditions
          const isTableMissing = error.code === 'PGRST116' || 
                                error.message.includes('relation "quiz_submissions" does not exist') ||
                                error.message.includes('does not exist') ||
                                error.code === '42P01'
          
          const isPermissionError = error.code === '42501' || 
                                   error.message.includes('permission denied') ||
                                   error.message.includes('insufficient_privilege')
          
          if (isTableMissing) {
            console.log('🔄 Table quiz_submissions does not exist, showing sample data')
          } else if (isPermissionError) {
            console.log('🔄 Permission denied for quiz_submissions table, showing sample data')
          } else {
            console.log('🔄 Unknown error with quiz_submissions table, showing sample data')
          }
          
          // Show sample data for any error
          const sampleSubmissions: QuizSubmission[] = [
            {
              id: 1,
              user_id: 'sample-user-1',
              quiz_id: 'sample-quiz-1',
              score: 8,
              total_questions: 10,
              submitted_at: new Date().toISOString(),
              status: 'completed',
              user_name: 'Alice Johnson',
              user_email: 'alice@example.com'
            },
            {
              id: 2,
              user_id: 'sample-user-2',
              quiz_id: 'sample-quiz-2',
              score: 12,
              total_questions: 15,
              submitted_at: new Date(Date.now() - 1800000).toISOString(),
              status: 'completed',
              user_name: 'Bob Smith',
              user_email: 'bob@example.com'
            },
            {
              id: 3,
              user_id: 'sample-user-3',
              quiz_id: 'sample-quiz-1',
              score: 4,
              total_questions: 10,
              submitted_at: new Date(Date.now() - 3600000).toISOString(),
              status: 'failed',
              user_name: 'Carol Davis',
              user_email: 'carol@example.com'
            },
            {
              id: 4,
              user_id: 'sample-user-4',
              quiz_id: 'sample-quiz-3',
              score: 7,
              total_questions: 8,
              submitted_at: new Date(Date.now() - 5400000).toISOString(),
              status: 'completed',
              user_name: 'David Wilson',
              user_email: 'david@example.com'
            }
          ]
          setSubmissions(sampleSubmissions)
          return
        }

        // If we get here, the table exists and we have data
        console.log('✅ Quiz submissions fetched successfully:', data?.length || 0, 'records')
        
        // Transform the data to match our interface
        const transformedSubmissions = data?.map(submission => ({
          ...submission,
          // The data already has full_name and email, so we can use them directly
        })) || []

        setSubmissions(transformedSubmissions)
      }
    } catch (error) {
      console.error('❌ Error fetching quiz submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizSubmissions()
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Sidebar>
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Brand Submissions</h1>
                <p className="text-gray-600 mt-1">
                  Monitor brand and logo design submissions from users.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#8359ee] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">A</span>
                  </div>
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">B</span>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">C</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-semibold">+</span>
                  </div>
                </div>
                <Button className="bg-[#8359ee] hover:bg-[#7245e8] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search Brand Submissions" 
                    className="pl-10 w-64"
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-4 h-4 bg-[#8359ee] rounded-full"></div>
                  <span>{submissions.length} / {submissions.length + 8} Active</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <TableIcon className="h-4 w-4" />
                  <span>Table</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                  <Badge variant="secondary" className="ml-1">3</Badge>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Sort</span>
                </Button>
              </div>
            </div>

            {/* Brand Submissions Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8359ee] mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading brand submissions...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Brand Submissions Yet</h3>
                  <p className="text-gray-500">
                    Brand submissions will appear here as users submit their design requests.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200">
                        <TableHead className="w-12">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900">Name</TableHead>
                        <TableHead className="font-semibold text-gray-900 flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>Client / Company</span>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Status</span>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 flex items-center space-x-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Timeline</span>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 flex items-center space-x-1">
                          <Tag className="h-4 w-4" />
                          <span>Category</span>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900 flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>Budget</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission, index) => (
                        <TableRow key={submission.id} className="hover:bg-gray-50 border-b border-gray-100">
                          <TableCell>
                            <input type="checkbox" className="rounded border-gray-300" />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">
                              {submission.brand_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.brand_style}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                index % 4 === 0 ? 'bg-[#8359ee]' : 
                                index % 4 === 1 ? 'bg-orange-500' : 
                                index % 4 === 2 ? 'bg-green-500' : 'bg-blue-500'
                              }`}>
                                <span className="text-white text-sm font-semibold">
                                  {submission.full_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {submission.full_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {submission.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                submission.logo_status === 'completed' ? 'bg-green-500' :
                                submission.logo_status === 'in_progress' ? 'bg-blue-500' :
                                submission.logo_status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                              }`}></div>
                              <select 
                                className="bg-gray-100 border-0 rounded-full px-3 py-1 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8359ee]"
                                defaultValue={submission.logo_status}
                              >
                                <option value="completed">Completed</option>
                                <option value="in_progress">In progress</option>
                                <option value="pending">Pending</option>
                                <option value="on_hold">On hold</option>
                              </select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                submission.timeline === 'urgent' ? 'bg-red-500' :
                                submission.timeline === 'asap' ? 'bg-yellow-500' :
                                submission.timeline === 'flexible' ? 'bg-green-500' : 'bg-blue-500'
                              }`}></div>
                              <span className="text-sm text-gray-700 capitalize">
                                {submission.timeline === 'urgent' ? 'Today' :
                                 submission.timeline === 'asap' ? 'This week' :
                                 submission.timeline === 'flexible' ? 'Next month' : submission.timeline}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {submission.brand_goals.slice(0, 2).map((goal, goalIndex) => (
                                <Badge key={goalIndex} variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-300">
                                  {goal}
                                </Badge>
                              ))}
                              {submission.brand_goals.length > 2 && (
                                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-300">
                                  +{submission.brand_goals.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-gray-900">
                              {submission.preferred_kit ? `$${submission.preferred_kit}` : 'TBD'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Sidebar>
  )
}
