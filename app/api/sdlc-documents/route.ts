import { NextRequest, NextResponse } from 'next/server'
import { SDLCDocumentDatabaseService } from '@/lib/sdlc-document-database-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const platform = searchParams.get('platform')
    
    const dbService = new SDLCDocumentDatabaseService()
    
    let documents = search 
      ? await dbService.searchSDLCDocuments(search)
      : await dbService.getUserSDLCDocuments()
    
    // Filter by platform if specified
    if (platform && platform !== 'all') {
      documents = documents.filter(doc => 
        doc.linked_projects?.[platform as keyof typeof doc.linked_projects]?.length > 0
      )
    }
    
    return NextResponse.json({ 
      documents,
      success: true 
    })
  } catch (error) {
    console.error('Error fetching SDLC documents:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch documents',
        documents: [],
        success: false 
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, description } = body
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' }, 
        { status: 400 }
      )
    }
    
    const dbService = new SDLCDocumentDatabaseService()
    const document = await dbService.createSDLCDocument({
      title: title.trim(),
      content,
      description: description?.trim(),
      document_type: 'comprehensive_sdlc'
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Failed to create document' }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      document,
      success: true 
    })
  } catch (error) {
    console.error('Error creating SDLC document:', error)
    return NextResponse.json(
      { error: 'Failed to create document' }, 
      { status: 500 }
    )
  }
} 