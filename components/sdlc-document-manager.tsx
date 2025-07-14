"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Calendar,
  ExternalLink,
  Trash2,
  Eye,
  Search,
  Plus,
  Github,
  Link,
  Archive,
  Clock,
  Loader2,
  Filter,
  AlertCircle
} from 'lucide-react'

interface SavedDocument {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  linkedProjects: Array<{
    platform: 'github' | 'clickup' | 'trello'
    projectId: string
    projectName: string
    projectUrl: string
  }>
  sectionsGenerated: number
  detailLevel: string
}

interface SDLCDocumentManagerProps {
  onDocumentSelect?: (documentId: string) => void
  onCreateNew?: () => void
}

export function SDLCDocumentManager({ onDocumentSelect, onCreateNew }: SDLCDocumentManagerProps) {
  const [documents, setDocuments] = useState<SavedDocument[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<SavedDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeletingDocument, setIsDeletingDocument] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [documents, searchTerm, filterPlatform])

  const loadDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/sdlc-documents')
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Transform documents from database format to expected UI format
        const transformedDocuments = data.documents.map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          createdAt: doc.created_at,
          updatedAt: doc.updated_at,
          linkedProjects: transformLinkedProjects(doc.linked_projects || {}),
          sectionsGenerated: doc.content ? doc.content.split('#').length - 1 : 0,
          detailLevel: doc.document_type || 'comprehensive_sdlc'
        }))
        setDocuments(transformedDocuments)
      } else {
        console.error('Failed to load documents:', data.error)
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Transform linked projects from database format to UI format
  const transformLinkedProjects = (linkedProjects: any) => {
    const result: Array<{
      platform: 'github' | 'clickup' | 'trello'
      projectId: string
      projectName: string
      projectUrl: string
    }> = []

    // Transform GitHub projects
    if (linkedProjects.github) {
      linkedProjects.github.forEach((project: any) => {
        result.push({
          platform: 'github',
          projectId: project.url || project.name,
          projectName: project.name,
          projectUrl: project.url
        })
      })
    }

    // Transform ClickUp projects
    if (linkedProjects.clickup) {
      linkedProjects.clickup.forEach((project: any) => {
        result.push({
          platform: 'clickup',
          projectId: project.url || project.name,
          projectName: project.name,
          projectUrl: project.url
        })
      })
    }

    // Transform Trello projects
    if (linkedProjects.trello) {
      linkedProjects.trello.forEach((project: any) => {
        result.push({
          platform: 'trello',
          projectId: project.url || project.name,
          projectName: project.name,
          projectUrl: project.url
        })
      })
    }

    return result
  }

  const filterDocuments = () => {
    let filtered = documents

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by platform
    if (filterPlatform !== 'all') {
      filtered = filtered.filter(doc =>
        doc.linkedProjects.some(project => project.platform === filterPlatform)
      )
    }

    setFilteredDocuments(filtered)
  }

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return

    setIsDeletingDocument(true)
    try {
      const response = await fetch(`/api/sdlc-documents/${selectedDocument}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== selectedDocument))
        setIsDeleteDialogOpen(false)
        setSelectedDocument(null)
        alert('✅ Document deleted successfully!')
      } else {
        throw new Error('Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('❌ Failed to delete document')
    } finally {
      setIsDeletingDocument(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Github className="h-4 w-4" />
      case 'clickup':
        return <div className="h-4 w-4 bg-purple-500 rounded" />
      case 'trello':
        return <div className="h-4 w-4 bg-blue-500 rounded" />
      default:
        return <Link className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading documents...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                SDLC Document Library
              </CardTitle>
              <CardDescription>
                Manage your saved SDLC documents and linked projects
              </CardDescription>
            </div>
            <Button onClick={onCreateNew} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="all">All Platforms</option>
                <option value="github">GitHub</option>
                <option value="clickup">ClickUp</option>
                <option value="trello">Trello</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-gray-400">
                {documents.length === 0 ? (
                  <FileText className="h-12 w-12 mx-auto" />
                ) : (
                  <Search className="h-12 w-12 mx-auto" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {documents.length === 0 ? 'No documents yet' : 'No documents found'}
                </h3>
                <p className="text-gray-500">
                  {documents.length === 0 
                    ? 'Create your first SDLC document to get started' 
                    : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
              {documents.length === 0 && (
                <Button onClick={onCreateNew} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Document
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {document.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {document.sectionsGenerated} sections
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {document.detailLevel} level
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                {/* Linked Projects */}
                {document.linkedProjects && document.linkedProjects.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Linked Projects ({document.linkedProjects.length})
                    </h4>
                    <div className="space-y-2">
                      {document.linkedProjects.slice(0, 2).map((project, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2 min-w-0">
                            {getPlatformIcon(project.platform)}
                            <span className="text-sm truncate">{project.projectName}</span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      ))}
                      {document.linkedProjects.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{document.linkedProjects.length - 2} more project{document.linkedProjects.length - 2 > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No linked projects</p>
                    <p className="text-xs">Create projects from this document</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created: {formatDate(document.createdAt)}
                  </div>
                  {document.updatedAt !== document.createdAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated: {formatDate(document.updatedAt)}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onDocumentSelect?.(document.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Dialog open={isDeleteDialogOpen && selectedDocument === document.id} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedDocument(document.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Document</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete "{document.title}"? This action cannot be undone.
                          {document.linkedProjects.length > 0 && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded text-yellow-800">
                              ⚠️ This document has {document.linkedProjects.length} linked project{document.linkedProjects.length > 1 ? 's' : ''}. The projects will remain but won't be linked to this document.
                            </div>
                          )}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteDocument}
                          disabled={isDeletingDocument}
                        >
                          {isDeletingDocument ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {documents.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                <strong>{documents.length}</strong> document{documents.length > 1 ? 's' : ''} saved
                {documents.reduce((acc, doc) => acc + doc.linkedProjects.length, 0) > 0 && (
                  <span> • <strong>{documents.reduce((acc, doc) => acc + doc.linkedProjects.length, 0)}</strong> linked project{documents.reduce((acc, doc) => acc + doc.linkedProjects.length, 0) > 1 ? 's' : ''}</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 