"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Users, Loader2, X, FileText, Sparkles, Download, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface MeetingTranscriptModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate?: (transcript: string, metadata?: MeetingMetadata) => void
  userId?: string
}

interface MeetingMetadata {
  title?: string
  date?: string
  participants?: string[]
}

export function MeetingTranscriptModal({
  isOpen,
  onClose,
  onGenerate,
  userId
}: MeetingTranscriptModalProps) {
  const [transcript, setTranscript] = useState("")
  const [meetingTitle, setMeetingTitle] = useState("")
  const [meetingDate, setMeetingDate] = useState("")
  const [participants, setParticipants] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when content updates during streaming
  useEffect(() => {
    if (generatedContent && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [generatedContent])

  // Extract metadata from transcript when it changes
  useEffect(() => {
    if (transcript && !meetingTitle && !meetingDate && !participants) {
      extractMetadataFromTranscript(transcript)
    }
  }, [transcript])

  const extractMetadataFromTranscript = (text: string) => {
    const lines = text.split('\n').slice(0, 10) // Check first 10 lines for metadata
    
    // Extract title
    const titleMatch = lines.find(line => 
      line.toLowerCase().includes('meeting') || 
      line.toLowerCase().includes('transcript') ||
      line.toLowerCase().includes('session')
    )
    if (titleMatch && !meetingTitle) {
      const cleanTitle = titleMatch.replace(/^(meeting transcript:|transcript:|meeting:|session:)/i, '').trim()
      if (cleanTitle) setMeetingTitle(cleanTitle)
    }

    // Extract date
    const datePatterns = [
      /date:\s*(.+)/i,
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/,
      /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/,
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i
    ]
    
    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern)
        if (match && !meetingDate) {
          const dateStr = match[1].trim()
          // Try to parse and format the date
          try {
            const date = new Date(dateStr)
            if (!isNaN(date.getTime())) {
              setMeetingDate(date.toISOString().split('T')[0])
            } else {
              setMeetingDate(dateStr)
            }
          } catch {
            setMeetingDate(dateStr)
          }
          break
        }
      }
      if (meetingDate) break
    }

    // Extract participants
    const participantPatterns = [
      /participants?:\s*(.+)/i,
      /attendees?:\s*(.+)/i,
      /present:\s*(.+)/i
    ]
    
    for (const line of lines) {
      for (const pattern of participantPatterns) {
        const match = line.match(pattern)
        if (match && !participants) {
          setParticipants(match[1].trim())
          break
        }
      }
      if (participants) break
    }
  }

  const saveToDatabase = async (content: string, metadata: MeetingMetadata) => {
    try {
      // Create or get project
      const projectTitle = metadata.title || "Meeting Transcript"
      const projectResponse = await fetch('/api/sdlc-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectTitle,
          content: content,
          userId: userId || 'anonymous',
          metadata: {
            meetingDate: metadata.date,
            participants: metadata.participants,
            generated_at: new Date().toISOString()
          }
        })
      })

      if (projectResponse.ok) {
        const projectResult = await projectResponse.json()
        if (projectResult.success && projectResult.document?.id) {
          setProjectId(projectResult.document.id)
          
          // Save as meeting document type
          await fetch('/api/sdlc-documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: projectResult.document.id,
              documentType: 'meeting_transcript',
              title: `${projectTitle} - Meeting Documentation`,
              content: content,
              userId: userId || 'anonymous'
            })
          })
        }
      }
    } catch (error) {
      console.error('Failed to save to database:', error)
    }
  }

  const downloadPDF = () => {
    if (!generatedContent) return

    // Create a blob with the content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${meetingTitle || 'Meeting Transcript'}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 20px; }
          pre { white-space: pre-wrap; word-wrap: break-word; }
          .metadata { background: #f5f5f5; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>${meetingTitle || 'Meeting Transcript Documentation'}</h1>
        <div class="metadata">
          ${meetingDate ? `<p><strong>Date:</strong> ${meetingDate}</p>` : ''}
          ${participants ? `<p><strong>Participants:</strong> ${participants}</p>` : ''}
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <pre>${generatedContent}</pre>
      </body>
      </html>
    `

    // Create and download the file
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${meetingTitle || 'meeting-transcript'}-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      setError("Please paste your meeting transcript")
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedContent("")
    setProjectId(null)
    setProgress(0)
    setIsComplete(false)

    try {
      const participantsList = participants
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0)

      const response = await fetch('/api/generate-meeting-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          meetingTitle: meetingTitle || undefined,
          meetingDate: meetingDate || undefined,
          participants: participantsList.length > 0 ? participantsList : undefined,
          userId: userId || 'anonymous'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process meeting transcript')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('No response body')
      }

      let buffer = ''
      let fullContent = ''
      let estimatedLength = transcript.length * 2 // Estimate output length

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim() === '') continue
          
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim()
            if (!jsonStr || jsonStr === '[DONE]') continue
            
            try {
              const data = JSON.parse(jsonStr)
              
              if (data.type === 'chunk') {
                fullContent += data.content
                setGeneratedContent(fullContent)
                // Update progress based on content length
                const currentProgress = Math.min(95, Math.floor((fullContent.length / estimatedLength) * 100))
                setProgress(currentProgress)
              } else if (data.type === 'complete') {
                setGeneratedContent(data.fullContent)
                setProgress(100)
                setIsComplete(true)
                
                const metadata = {
                  title: meetingTitle,
                  date: meetingDate,
                  participants: participantsList
                }
                // Save to database
                await saveToDatabase(data.fullContent, metadata)
                // Call onGenerate callback if provided
                if (onGenerate) {
                  onGenerate(data.fullContent, metadata)
                }
                
                // Show completion animation
                setTimeout(() => {
                  setIsGenerating(false)
                }, 1000)
              } else if (data.type === 'error') {
                throw new Error(data.error)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } catch (err) {
      console.error('Error generating meeting documentation:', err)
      setError(err instanceof Error ? err.message : 'Failed to process meeting transcript')
      setProgress(0)
      setIsComplete(false)
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    setTranscript("")
    setMeetingTitle("")
    setMeetingDate("")
    setParticipants("")
    setGeneratedContent("")
    setError(null)
    setProjectId(null)
    setProgress(0)
    setIsComplete(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              <DialogTitle>Process Meeting Transcript</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Transform your meeting transcript into structured documentation with summaries and Agile requirement stories
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Processing transcript...</span>
                <span className="text-gray-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {!generatedContent ? (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-title">Meeting Title (Optional)</Label>
                    <Input
                      id="meeting-title"
                      placeholder="e.g., Product Planning Session"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meeting-date">Meeting Date (Optional)</Label>
                    <Input
                      id="meeting-date"
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participants">Participants (Optional, comma-separated)</Label>
                  <Input
                    id="participants"
                    placeholder="e.g., John (PM), Sarah (Dev), Mike (Design)"
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transcript">Meeting Transcript *</Label>
                  <Textarea
                    id="transcript"
                    placeholder="Paste your meeting transcript here..."
                    className="min-h-[300px] font-mono text-sm"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Supports transcripts up to 100,000 characters
                  </p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                  Generated Documentation
                  {isGenerating && !isComplete && (
                    <span className="text-sm font-normal text-gray-500 animate-pulse">
                      Generating...
                    </span>
                  )}
                  {isComplete && (
                    <span className="text-sm font-normal text-green-600">
                      Complete!
                    </span>
                  )}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadPDF}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGeneratedContent("")
                      setTranscript("")
                      setMeetingTitle("")
                      setMeetingDate("")
                      setParticipants("")
                      setError(null)
                      setProjectId(null)
                      setProgress(0)
                      setIsComplete(false)
                    }}
                  >
                    Process Another
                  </Button>
                </div>
              </div>
              <div 
                ref={contentRef}
                className="bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-y-auto"
              >
                <pre className="whitespace-pre-wrap text-sm font-mono">{generatedContent}</pre>
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {transcript.length > 0 && !generatedContent && (
              <span>{transcript.length} characters</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              {generatedContent ? 'Close' : 'Cancel'}
            </Button>
            {!generatedContent && (
              <Button 
                onClick={handleGenerate} 
                disabled={!transcript.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Documentation
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}