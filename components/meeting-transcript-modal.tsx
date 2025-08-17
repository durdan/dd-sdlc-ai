"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Users, Loader2, X, FileText, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      setError("Please paste your meeting transcript")
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedContent("")

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
              } else if (data.type === 'complete') {
                setGeneratedContent(data.fullContent)
                if (onGenerate) {
                  onGenerate(data.fullContent, {
                    title: meetingTitle,
                    date: meetingDate,
                    participants: participantsList
                  })
                }
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
    } finally {
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
                  <FileText className="h-5 w-5" />
                  Generated Documentation
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGeneratedContent("")
                    setTranscript("")
                  }}
                >
                  Process Another
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
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