'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  FileText, 
  FileCode, 
  Code, 
  Palette, 
  Database, 
  Eye, 
  Download,
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  Activity,
  Filter,
  Search,
  User,
  UserX
} from 'lucide-react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  user_id: string | null
  session_id: string | null
  title: string
  description: string
  input_text: string
  status: string
  created_at: string
  updated_at: string
  created_by: string
  project_type: 'anonymous' | 'authenticated'
  user_agent?: string
  ip_address?: string
  document_count: number
  documents: {
    business?: string
    functional?: string
    technical?: string
    ux?: string
    mermaid?: string
  }
}

interface ProjectStats {
  total_projects: number
  anonymous_projects: number
  authenticated_projects: number
  business_docs: number
  functional_docs: number
  technical_docs: number
  ux_docs: number
  architecture_docs: number
  projects_today: number
  projects_this_week: number
  unique_users: number
  unique_anonymous_sessions: number
}

const documentTypeIcons = {
  business: FileText,
  functional: FileText,
  technical: FileCode,
  ux: Palette,
  mermaid: Database
}

const documentTypeLabels = {
  business: 'Business Analysis',
  functional: 'Functional Spec',
  technical: 'Technical Spec',
  ux: 'UX Design',
  mermaid: 'Architecture'
}

const documentTypeColors = {
  business: 'bg-blue-100 text-blue-800',
  functional: 'bg-purple-100 text-purple-800',
  technical: 'bg-green-100 text-green-800',
  ux: 'bg-pink-100 text-pink-800',
  mermaid: 'bg-orange-100 text-orange-800'
}

export default function AllProjectsView() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [error, setError] = useState('')
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'anonymous' | 'authenticated'>('all')
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/admin/all-projects')
      if (!response.ok) throw new Error('Failed to load projects')
      
      const data = await response.json()
      setProjects(data.projects || [])
      setStats(data.stats || null)
    } catch (err) {
      console.error('Error loading projects:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Filter projects based on all criteria
  const filteredProjects = projects.filter(project => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      if (!project.title.toLowerCase().includes(search) && 
          !project.input_text.toLowerCase().includes(search) &&
          !project.created_by.toLowerCase().includes(search)) {
        return false
      }
    }

    // User type filter
    if (userTypeFilter !== 'all' && project.project_type !== userTypeFilter) {
      return false
    }

    // Document type filter
    if (documentTypeFilter !== 'all') {
      if (!project.documents || !project.documents[documentTypeFilter as keyof typeof project.documents]) {
        return false
      }
    }

    // Status filter
    if (statusFilter !== 'all' && project.status !== statusFilter) {
      return false
    }

    // Date range filter
    if (dateRange?.from) {
      const projectDate = new Date(project.created_at)
      if (projectDate < dateRange.from) return false
      if (dateRange.to && projectDate > dateRange.to) return false
    }

    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getDocumentTypes = (project: Project) => {
    if (!project.documents) return []
    return Object.keys(project.documents).filter(key => 
      project.documents[key as keyof typeof project.documents]
    )
  }

  const downloadDocument = (project: Project, type: string) => {
    const content = project.documents[type as keyof typeof project.documents]
    if (!content) return
    
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.title.replace(/\s+/g, '-')}-${type}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="p-8 text-center">Loading all projects...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_projects || 0}</div>
            <div className="text-xs text-muted-foreground space-y-1 mt-2">
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> Authenticated:
                </span>
                <span className="font-semibold">{stats?.authenticated_projects || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <UserX className="h-3 w-3" /> Anonymous:
                </span>
                <span className="font-semibold">{stats?.anonymous_projects || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Document Types</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Business:</span>
                <span className="font-semibold">{stats?.business_docs || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Functional:</span>
                <span className="font-semibold">{stats?.functional_docs || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Technical:</span>
                <span className="font-semibold">{stats?.technical_docs || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>UX Design:</span>
                <span className="font-semibold">{stats?.ux_docs || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Architecture:</span>
                <span className="font-semibold">{stats?.architecture_docs || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unique_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              + {stats?.unique_anonymous_sessions || 0} anonymous sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.projects_today || 0}</div>
            <p className="text-xs text-muted-foreground">
              Today | {stats?.projects_this_week || 0} this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Project Filters
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setUserTypeFilter('all')
                setDocumentTypeFilter('all')
                setStatusFilter('all')
                setDateRange(undefined)
                setCurrentPage(1)
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>

            {/* User Type Filter */}
            <Select value={userTypeFilter} onValueChange={(value: any) => {
              setUserTypeFilter(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="authenticated">Authenticated</SelectItem>
                <SelectItem value="anonymous">Anonymous</SelectItem>
              </SelectContent>
            </Select>

            {/* Document Type Filter */}
            <Select value={documentTypeFilter} onValueChange={(value) => {
              setDocumentTypeFilter(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="business">Business Analysis</SelectItem>
                <SelectItem value="functional">Functional Spec</SelectItem>
                <SelectItem value="technical">Technical Spec</SelectItem>
                <SelectItem value="ux">UX Design</SelectItem>
                <SelectItem value="mermaid">Architecture</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} -{" "}
                        {format(dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range)
                    setCurrentPage(1)
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              All Projects ({filteredProjects.length})
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {paginatedProjects.length} of {filteredProjects.length} projects
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium line-clamp-1">{project.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.input_text}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={project.project_type === 'anonymous' ? 'secondary' : 'default'}>
                          {project.project_type === 'anonymous' ? (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Anonymous
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3 mr-1" />
                              {project.created_by}
                            </>
                          )}
                        </Badge>
                        {project.session_id && (
                          <p className="text-xs text-muted-foreground">
                            Session: {project.session_id.substring(0, 15)}...
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {getDocumentTypes(project).map((type) => {
                          const Icon = documentTypeIcons[type as keyof typeof documentTypeIcons] || FileText
                          return (
                            <Badge 
                              key={type} 
                              variant="outline"
                              className={cn(
                                "text-xs",
                                documentTypeColors[type as keyof typeof documentTypeColors]
                              )}
                            >
                              <Icon className="h-3 w-3 mr-1" />
                              {documentTypeLabels[type as keyof typeof documentTypeLabels] || type}
                            </Badge>
                          )
                        })}
                        {project.document_count === 0 && (
                          <span className="text-xs text-muted-foreground">No documents</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        project.status === 'completed' ? 'default' :
                        project.status === 'processing' ? 'secondary' :
                        'destructive'
                      }>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(project.created_at), 'MMM d, yyyy')}
                        <br />
                        <span className="text-muted-foreground">
                          {format(new Date(project.created_at), 'h:mm a')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProject(project)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{project.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Project Details */}
                            <div>
                              <h3 className="font-semibold mb-2">Project Details</h3>
                              <dl className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <dt className="font-medium">Project ID:</dt>
                                  <dd className="text-muted-foreground">{project.id}</dd>
                                </div>
                                <div>
                                  <dt className="font-medium">Status:</dt>
                                  <dd>
                                    <Badge>{project.status}</Badge>
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium">User Type:</dt>
                                  <dd>
                                    <Badge variant={project.project_type === 'anonymous' ? 'secondary' : 'default'}>
                                      {project.project_type}
                                    </Badge>
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium">Created By:</dt>
                                  <dd className="text-muted-foreground">{project.created_by}</dd>
                                </div>
                                {project.session_id && (
                                  <div className="col-span-2">
                                    <dt className="font-medium">Session ID:</dt>
                                    <dd className="text-muted-foreground text-xs">{project.session_id}</dd>
                                  </div>
                                )}
                                {project.ip_address && (
                                  <div>
                                    <dt className="font-medium">IP Address:</dt>
                                    <dd className="text-muted-foreground">{project.ip_address}</dd>
                                  </div>
                                )}
                                <div className="col-span-2">
                                  <dt className="font-medium">Created:</dt>
                                  <dd className="text-muted-foreground">
                                    {format(new Date(project.created_at), 'PPpp')}
                                  </dd>
                                </div>
                              </dl>
                            </div>

                            {/* Input Text */}
                            <div>
                              <h3 className="font-semibold mb-2">Input Text</h3>
                              <p className="text-sm bg-muted p-3 rounded-md">{project.input_text}</p>
                            </div>

                            {/* Documents */}
                            {Object.entries(project.documents || {}).map(([type, content]) => (
                              content && (
                                <div key={type}>
                                  <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold flex items-center gap-2">
                                      {React.createElement(documentTypeIcons[type as keyof typeof documentTypeIcons] || FileText, {
                                        className: "h-4 w-4"
                                      })}
                                      {documentTypeLabels[type as keyof typeof documentTypeLabels] || type}
                                    </h3>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => downloadDocument(project, type)}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                  <div className="bg-muted p-3 rounded-md max-h-96 overflow-y-auto">
                                    <pre className="text-sm whitespace-pre-wrap">{content}</pre>
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}