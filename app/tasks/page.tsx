'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ClipboardList, Search, Calendar, Plus, Eye, CheckCircle2, Clock, XCircle, User, Mail, Upload, FileText, Send, Edit2, Trash2, Image as ImageIcon, Download, ExternalLink } from 'lucide-react'

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
type TaskType = 'UPLOAD_FILE' | 'SEND_INFO' | 'PROVIDE_DETAILS' | 'REVIEW' | 'OTHER'

interface TaskResponse {
  id?: string
  text: string
  created_at: string
  created_by: string
  attachments?: Array<{
    name: string
    url: string
    uploaded_at?: string
    size?: number
    type?: string
  }>
}

interface Task {
  id: string
  client_id: string
  title: string
  description: string | null
  type: TaskType
  status: TaskStatus
  due_date: string | null
  completed_at: string | null
  attachments: any[]
  metadata: any
  created_by: string | null
  created_at: string
  updated_at: string
  client: {
    id: string
    name: string | null
    email: string
    plan: string
  } | null
  responses?: TaskResponse[] // Responses from metadata
}

interface Client {
  id: string
  name: string | null
  email: string
  plan: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState<{
    url: string
    name: string
    type?: string
  } | null>(null)
  const [isAttachmentViewerOpen, setIsAttachmentViewerOpen] = useState(false)

  const [taskForm, setTaskForm] = useState({
    client_id: '',
    title: '',
    description: '',
    type: 'OTHER' as TaskType,
    status: 'PENDING' as TaskStatus,
    due_date: '',
  })

  // Helper to parse metadata responses
  const parseMetadataResponses = (metadata: any): TaskResponse[] => {
    if (!metadata || typeof metadata !== 'object') {
      return []
    }

    if (!Array.isArray(metadata.responses)) {
      return []
    }

    return metadata.responses.map((r: any, index: number) => ({
      id: r.id || `response-${index}`,
      text: r.text || r.response || '',
      created_at: r.created_at || r.createdAt || new Date().toISOString(),
      created_by: r.created_by || r.createdBy || '',
      attachments: Array.isArray(r.attachments) ? r.attachments : [],
    }))
  }

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }

      const response = await fetch(`/api/tasks?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        // Parse metadata responses for each task
        const tasksWithResponses = (result.data || []).map((task: Task) => ({
          ...task,
          responses: parseMetadataResponses(task.metadata),
        }))
        setTasks(tasksWithResponses)
      } else {
        console.error('❌ Error fetching tasks:', result.error)
        setTasks([])
      }
    } catch (error) {
      console.error('❌ Error fetching tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch clients for task assignment
  const fetchClients = async () => {
    try {
      const response = await fetch('/api/projects/clients')
      const result = await response.json()

      if (result.success) {
        setClients(result.data || [])
      }
    } catch (error) {
      console.error('❌ Error fetching clients:', error)
      // Fallback to empty array
      setClients([])
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchClients()
  }, [statusFilter, typeFilter])

  // Filter tasks based on search
  const filteredTasks = tasks.filter(task => {
    const searchLower = searchTerm.toLowerCase()
    const title = task.title?.toLowerCase() || ''
    const description = task.description?.toLowerCase() || ''
    const clientName = task.client?.name?.toLowerCase() || ''
    const clientEmail = task.client?.email?.toLowerCase() || ''

    return (
      title.includes(searchLower) ||
      description.includes(searchLower) ||
      clientName.includes(searchLower) ||
      clientEmail.includes(searchLower)
    )
  })

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get status badge
  const getStatusBadge = (status: TaskStatus) => {
    const badges = {
      PENDING: <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>,
      IN_PROGRESS: <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>,
      COMPLETED: <Badge className="bg-green-100 text-green-700">Completed</Badge>,
      CANCELLED: <Badge className="bg-gray-100 text-gray-700">Cancelled</Badge>,
    }
    return badges[status] || badges.PENDING
  }

  // Get type icon
  const getTypeIcon = (type: TaskType) => {
    const icons = {
      UPLOAD_FILE: <Upload className="h-4 w-4" />,
      SEND_INFO: <Send className="h-4 w-4" />,
      PROVIDE_DETAILS: <FileText className="h-4 w-4" />,
      REVIEW: <Eye className="h-4 w-4" />,
      OTHER: <ClipboardList className="h-4 w-4" />,
    }
    return icons[type] || icons.OTHER
  }

  // Get type label
  const getTypeLabel = (type: TaskType) => {
    const labels = {
      UPLOAD_FILE: 'Upload File',
      SEND_INFO: 'Send Info',
      PROVIDE_DETAILS: 'Provide Details',
      REVIEW: 'Review',
      OTHER: 'Other',
    }
    return labels[type] || 'Other'
  }

  // Handle create task
  const handleCreateTask = async () => {
    if (!taskForm.client_id || !taskForm.title) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskForm,
          due_date: taskForm.due_date || null,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create task')
      }

      console.log('✅ Task created successfully')
      setIsTaskDialogOpen(false)
      setTaskForm({
        client_id: '',
        title: '',
        description: '',
        type: 'OTHER',
        status: 'PENDING',
        due_date: '',
      })
      await fetchTasks()
    } catch (error: any) {
      console.error('❌ Error creating task:', error)
      alert(`Failed to create task: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Handle update task status
  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update task status')
      }

      await fetchTasks()
    } catch (error: any) {
      console.error('❌ Error updating task status:', error)
      alert(`Failed to update task: ${error.message}`)
    }
  }

  // Handle delete task
  const handleDeleteTask = async (task: Task, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTaskToDelete(task)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!taskToDelete) return

    try {
      const response = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete task')
      }

      setIsDeleteModalOpen(false)
      setTaskToDelete(null)
      await fetchTasks()
    } catch (error: any) {
      console.error('❌ Error deleting task:', error)
      alert(`Failed to delete task: ${error.message}`)
    }
  }

  // Handle file download (forces download instead of opening)
  const handleDownload = async (url: string, filename: string) => {
    try {
      // Fetch the file as a blob to force download
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch file')
      }
      
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      
      // Cleanup after a short delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      }, 100)
    } catch (error) {
      console.error('Error downloading file:', error)
      // Fallback: try direct download with download attribute
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
      }, 100)
    }
  }

  // Handle view details
  const handleViewDetails = async (task: Task) => {
    // Fetch fresh task data with responses
    try {
      const response = await fetch(`/api/tasks/${task.id}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const parsedResponses = parseMetadataResponses(result.data.metadata)
        console.log('📋 Task metadata:', result.data.metadata)
        console.log('📋 Parsed responses:', parsedResponses)
        
        const taskWithResponses = {
          ...result.data,
          responses: parsedResponses,
        }
        setSelectedTask(taskWithResponses as Task)
      } else {
        // Fallback to current task data
        const parsedResponses = parseMetadataResponses(task.metadata)
        console.log('📋 Task metadata (fallback):', task.metadata)
        console.log('📋 Parsed responses (fallback):', parsedResponses)
        
        setSelectedTask({
          ...task,
          responses: parsedResponses,
        })
      }
    } catch (error) {
      console.error('Error fetching task details:', error)
      // Fallback to current task data
      const parsedResponses = parseMetadataResponses(task.metadata)
      console.log('📋 Task metadata (error fallback):', task.metadata)
      console.log('📋 Parsed responses (error fallback):', parsedResponses)
      
      setSelectedTask({
        ...task,
        responses: parsedResponses,
      })
    }
    setIsDetailsDialogOpen(true)
  }

  return (
    <Sidebar>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage customer tasks and requirements
            </p>
          </div>
          <Button onClick={() => setIsTaskDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="UPLOAD_FILE">Upload File</SelectItem>
                  <SelectItem value="SEND_INFO">Send Info</SelectItem>
                  <SelectItem value="PROVIDE_DETAILS">Provide Details</SelectItem>
                  <SelectItem value="REVIEW">Review</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('all')
                  setTypeFilter('all')
                  setSearchTerm('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8359ee] mx-auto"></div>
                  <p className="mt-4 text-sm text-gray-500">Loading tasks...</p>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tasks found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S/N</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Responses</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task, index) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{task.client?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{task.client?.email || task.client_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(task.type)}
                            <span className="text-sm">{getTypeLabel(task.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(task.status)}
                        </TableCell>
                        <TableCell>
                          {task.responses && task.responses.length > 0 ? (
                            <Badge className="bg-green-100 text-green-700">
                              {task.responses.length} {task.responses.length === 1 ? 'response' : 'responses'}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">No responses</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(task.due_date)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(task)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            {task.status !== 'COMPLETED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                                className="gap-2 text-green-600 hover:text-green-700"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Complete
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleDeleteTask(task, e)}
                              className="gap-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Send a requirement or task to a customer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select
                value={taskForm.client_id}
                onValueChange={(value) => setTaskForm({ ...taskForm, client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name || client.email} ({client.plan})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="e.g., Please upload your logo file"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Provide detailed instructions for this task..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Task Type</Label>
                <Select
                  value={taskForm.type}
                  onValueChange={(value) => setTaskForm({ ...taskForm, type: value as TaskType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPLOAD_FILE">Upload File</SelectItem>
                    <SelectItem value="SEND_INFO">Send Info</SelectItem>
                    <SelectItem value="PROVIDE_DETAILS">Provide Details</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={saving}>
              {saving ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>
              View and manage task information
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-6">
              {/* Task Information */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Task Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Title:</span>
                    <p className="mt-1 font-medium">{selectedTask.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <div className="mt-1 flex items-center gap-2">
                      {getTypeIcon(selectedTask.type)}
                      <span>{getTypeLabel(selectedTask.type)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedTask.status)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <p className="mt-1">{formatDate(selectedTask.due_date)}</p>
                  </div>
                  {selectedTask.completed_at && (
                    <div>
                      <span className="text-gray-500">Completed At:</span>
                      <p className="mt-1">{formatDate(selectedTask.completed_at)}</p>
                    </div>
                  )}
                </div>
                {selectedTask.description && (
                  <div className="mt-4">
                    <span className="text-gray-500">Description:</span>
                    <p className="mt-1 text-sm">{selectedTask.description}</p>
                  </div>
                )}
              </div>

              {/* Client Information */}
              {selectedTask.client && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-3">Client Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <p className="mt-1 font-medium">{selectedTask.client.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="mt-1 font-medium">{selectedTask.client.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Plan:</span>
                      <div className="mt-1">
                        <Badge className={
                          selectedTask.client.plan === 'LAUNCH'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }>
                          {selectedTask.client.plan}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Task Attachments (Task-level) */}
              {selectedTask.attachments && Array.isArray(selectedTask.attachments) && selectedTask.attachments.length > 0 && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-3">
                    Task Attachments ({selectedTask.attachments.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedTask.attachments.map((attachment: any, attIndex: number) => {
                      // Handle both string and object attachments
                      const isStringAttachment = typeof attachment === 'string'
                      
                      // Get attachment URL
                      const attachmentUrl = isStringAttachment 
                        ? attachment 
                        : (typeof attachment === 'object' && attachment !== null 
                            ? (attachment.url || attachment) 
                            : String(attachment))
                      
                      // Get attachment name
                      let attachmentName = 'Attachment'
                      if (isStringAttachment) {
                        attachmentName = attachment.split('/').pop() || attachment.split('\\').pop() || 'Attachment'
                      } else if (typeof attachment === 'object' && attachment !== null) {
                        attachmentName = attachment.name || attachment.url?.split('/').pop() || attachment.url?.split('\\').pop() || 'Attachment'
                      }
                      
                      // Determine file type
                      let fileType = ''
                      if (isStringAttachment) {
                        // Extract extension from string URL
                        const parts = attachment.split('.')
                        fileType = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
                      } else if (typeof attachment === 'object' && attachment !== null) {
                        // Check if type is provided
                        if (attachment.type) {
                          fileType = typeof attachment.type === 'string' 
                            ? attachment.type.toLowerCase().split('/').pop() || attachment.type.toLowerCase()
                            : ''
                        } else if (attachment.name) {
                          // Extract from name
                          const parts = attachment.name.split('.')
                          fileType = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
                        } else if (attachment.url) {
                          // Extract from URL
                          const parts = attachment.url.split('.')
                          fileType = parts.length > 1 ? parts[parts.length - 1].toLowerCase().split('?')[0] : ''
                        }
                      }
                      
                      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileType)
                      const isPdf = fileType === 'pdf'
                      
                      return (
                        <div
                          key={attIndex}
                          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {isImage ? (
                              <ImageIcon className="h-5 w-5 text-blue-500 shrink-0" />
                            ) : isPdf ? (
                              <FileText className="h-5 w-5 text-red-500 shrink-0" />
                            ) : (
                              <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {attachmentName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAttachment({
                                  url: attachmentUrl,
                                  name: attachmentName,
                                  type: typeof attachment === 'object' ? attachment.type : undefined,
                                })
                                setIsAttachmentViewerOpen(true)
                              }}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDownload(attachmentUrl, attachmentName)
                              }}
                              className="gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                window.open(attachmentUrl, '_blank', 'noopener,noreferrer')
                              }}
                              className="gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Task Responses */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">
                  Responses ({selectedTask.responses?.length || 0})
                </h3>
                {selectedTask.responses && selectedTask.responses.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTask.responses.map((response, index) => {
                      console.log(`📎 Response ${index} attachments:`, response.attachments)
                      return (
                        <div key={response.id || index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {response.created_by || 'Client'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(response.created_at)}
                              </p>
                            </div>
                          </div>
                          {response.text && (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                              {response.text}
                            </p>
                          )}
                          {response.attachments && response.attachments.length > 0 ? (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs font-medium text-gray-500">Attachments ({response.attachments.length}):</p>
                              <div className="grid grid-cols-1 gap-2">
                                {response.attachments.map((attachment: any, attIndex: number) => {
                                  const fileType = attachment.type || attachment.name?.split('.').pop()?.toLowerCase() || ''
                                  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileType)
                                  const isPdf = fileType === 'pdf'
                                  
                                  return (
                                    <div
                                      key={attIndex}
                                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {isImage ? (
                                          <ImageIcon className="h-5 w-5 text-blue-500 shrink-0" />
                                        ) : isPdf ? (
                                          <FileText className="h-5 w-5 text-red-500 shrink-0" />
                                        ) : (
                                          <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate">
                                            {attachment.name || attachment.url || 'Attachment'}
                                          </p>
                                          {attachment.size && (
                                            <p className="text-xs text-gray-500">
                                              {(attachment.size / 1024).toFixed(2)} KB
                                              {attachment.type && ` • ${attachment.type}`}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedAttachment({
                                              url: attachment.url || attachment,
                                              name: attachment.name || attachment.url || 'Attachment',
                                              type: attachment.type,
                                            })
                                            setIsAttachmentViewerOpen(true)
                                          }}
                                          className="gap-2"
                                        >
                                          <Eye className="h-4 w-4" />
                                          View
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            const url = attachment.url || attachment
                                            const filename = attachment.name || url.split('/').pop() || 'download'
                                            handleDownload(url, filename)
                                          }}
                                          className="gap-2"
                                        >
                                          <Download className="h-4 w-4" />
                                          Download
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            window.open(attachment.url || attachment, '_blank', 'noopener,noreferrer')
                                          }}
                                          className="gap-2"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 mt-2">No attachments in this response</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">No responses yet</p>
                    <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded">
                      <p className="font-medium mb-1">Metadata structure:</p>
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(selectedTask.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div>
                <h3 className="font-semibold mb-3">Update Status</h3>
                <div className="flex gap-2">
                  {selectedTask.status !== 'PENDING' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleUpdateStatus(selectedTask.id, 'PENDING')
                        setIsDetailsDialogOpen(false)
                      }}
                    >
                      Mark as Pending
                    </Button>
                  )}
                  {selectedTask.status !== 'IN_PROGRESS' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleUpdateStatus(selectedTask.id, 'IN_PROGRESS')
                        setIsDetailsDialogOpen(false)
                      }}
                    >
                      Mark as In Progress
                    </Button>
                  )}
                  {selectedTask.status !== 'COMPLETED' && (
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleUpdateStatus(selectedTask.id, 'COMPLETED')
                        setIsDetailsDialogOpen(false)
                      }}
                    >
                      Mark as Completed
                    </Button>
                  )}
                  {selectedTask.status !== 'CANCELLED' && (
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        handleUpdateStatus(selectedTask.id, 'CANCELLED')
                        setIsDetailsDialogOpen(false)
                      }}
                    >
                      Cancel Task
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attachment Viewer Dialog */}
      <Dialog open={isAttachmentViewerOpen} onOpenChange={setIsAttachmentViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAttachment?.name || 'View Attachment'}</DialogTitle>
            <DialogDescription>
              View and download the attached file
            </DialogDescription>
          </DialogHeader>

          {selectedAttachment && (
            <div className="space-y-4">
              {(() => {
                const fileType = selectedAttachment.type || selectedAttachment.name?.split('.').pop()?.toLowerCase() || ''
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileType)
                const isPdf = fileType === 'pdf'

                if (isImage) {
                  return (
                    <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
                      <img
                        src={selectedAttachment.url}
                        alt={selectedAttachment.name}
                        className="max-w-full max-h-[60vh] object-contain rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='
                        }}
                      />
                    </div>
                  )
                }

                if (isPdf) {
                  return (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <FileText className="h-16 w-16 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-4">PDF Document</p>
                        <p className="text-xs text-gray-500">{selectedAttachment.name}</p>
                      </div>
                      <iframe
                        src={selectedAttachment.url}
                        className="w-full h-[60vh] border rounded-lg"
                        title={selectedAttachment.name}
                        onError={() => {
                          console.error('Failed to load PDF')
                        }}
                      />
                    </div>
                  )
                }

                return (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {selectedAttachment.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-6">
                      This file type cannot be previewed. Please download or open in a new tab.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          handleDownload(selectedAttachment.url, selectedAttachment.name || 'download')
                        }}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          window.open(selectedAttachment.url, '_blank', 'noopener,noreferrer')
                        }}
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                )
              })()}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{selectedAttachment.name}</p>
                  {selectedAttachment.type && (
                    <p className="text-xs text-gray-500">Type: {selectedAttachment.type}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDownload(selectedAttachment.url, selectedAttachment.name || 'download')
                    }}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(selectedAttachment.url, '_blank', 'noopener,noreferrer')
                    }}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAttachmentViewerOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {taskToDelete && (
            <div className="py-4">
              <p className="font-medium">{taskToDelete.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                Client: {taskToDelete.client?.name || taskToDelete.client?.email}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}

