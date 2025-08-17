'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
  Calendar,
  Activity
} from 'lucide-react'
import { format } from 'date-fns'

interface AnonymousDocument {
  project_id: string
  session_id: string
  title: string
  input_text: string
  status: string
  created_at: string
  user_agent: string
  ip_address: string
  referrer: string
  document_count: number
  documents: Record<string, string>
}

interface DocumentStats {
  total_anonymous_projects: number
  business_docs: number
  functional_docs: number
  technical_docs: number
  ux_docs: number
  architecture_docs: number
  unique_sessions: number
  recent_activity: number
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
  mermaid: 'Architecture Diagram'
}

export default function AnonymousDocumentsView() {
  const [documents, setDocuments] = useState<AnonymousDocument[]>([])
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<AnonymousDocument | null>(null)
  const [selectedType, setSelectedType] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load anonymous documents
      const docsResponse = await fetch('/api/admin/anonymous-documents')
      if (!docsResponse.ok) throw new Error('Failed to load anonymous documents')
      const docsData = await docsResponse.json()
      
      setDocuments(docsData.documents || [])
      setStats(docsData.stats || null)
    } catch (err) {
      console.error('Error loading anonymous documents:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = selectedType === 'all' 
    ? documents 
    : documents.filter(doc => {
        const hasType = doc.documents && doc.documents[selectedType]
        return hasType
      })

  const getDocumentTypes = (doc: AnonymousDocument) => {
    if (!doc.documents) return []
    return Object.keys(doc.documents).filter(key => doc.documents[key])
  }

  const downloadDocument = (doc: AnonymousDocument, type: string) => {
    const content = doc.documents[type]
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.title.replace(/\s+/g, '-')}-${type}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="p-8 text-center">Loading anonymous documents...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anonymous Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_anonymous_projects || 0}</div>
            <p className="text-xs text-muted-foreground">All anonymous documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Document Types</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Business:</span>
                <span className="font-semibold">{stats?.business_docs || 0}</span>
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
            <CardTitle className="text-sm font-medium">Unique Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unique_sessions || 0}</div>
            <p className="text-xs text-muted-foreground">Anonymous users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recent_activity || 0}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Document Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Anonymous Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All Types</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="functional">Functional</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="ux">UX Design</TabsTrigger>
              <TabsTrigger value="mermaid">Architecture</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedType} className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title / Input</TableHead>
                      <TableHead>Document Types</TableHead>
                      <TableHead>Session Info</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.project_id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {doc.input_text}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {getDocumentTypes(doc).map((type) => {
                              const Icon = documentTypeIcons[type as keyof typeof documentTypeIcons] || FileText
                              return (
                                <Badge key={type} variant="secondary" className="text-xs">
                                  <Icon className="h-3 w-3 mr-1" />
                                  {documentTypeLabels[type as keyof typeof documentTypeLabels] || type}
                                </Badge>
                              )
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <p className="text-muted-foreground">
                              Session: {doc.session_id ? doc.session_id.substring(0, 20) + '...' : 'N/A'}
                            </p>
                            {doc.ip_address && (
                              <p className="text-muted-foreground">IP: {doc.ip_address}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(doc.created_at), 'MMM d, yyyy')}
                            <br />
                            <span className="text-muted-foreground">
                              {format(new Date(doc.created_at), 'h:mm a')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedDoc(doc)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{selectedDoc?.title || doc.title}</DialogTitle>
                              </DialogHeader>
                              {selectedDoc && (
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="font-semibold mb-2">Project Details</h3>
                                    <dl className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <dt className="font-medium">Session ID:</dt>
                                        <dd className="text-muted-foreground">{selectedDoc.session_id}</dd>
                                      </div>
                                      <div>
                                        <dt className="font-medium">Created:</dt>
                                        <dd className="text-muted-foreground">
                                          {format(new Date(selectedDoc.created_at), 'PPpp')}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="font-medium">IP Address:</dt>
                                        <dd className="text-muted-foreground">{selectedDoc.ip_address || 'N/A'}</dd>
                                      </div>
                                      <div>
                                        <dt className="font-medium">User Agent:</dt>
                                        <dd className="text-muted-foreground text-xs">{selectedDoc.user_agent || 'N/A'}</dd>
                                      </div>
                                    </dl>
                                  </div>

                                  <div>
                                    <h3 className="font-semibold mb-2">Input Text</h3>
                                    <p className="text-sm bg-muted p-3 rounded-md">{selectedDoc.input_text}</p>
                                  </div>

                                  {Object.entries(selectedDoc.documents || {}).map(([type, content]) => (
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
                                            onClick={() => downloadDocument(selectedDoc, type)}
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
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}