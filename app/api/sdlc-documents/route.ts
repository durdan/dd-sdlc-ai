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
    
    // Ensure documents is always an array
    documents = (documents || []) as any[]
    
    // Filter by platform if specified
    if (platform && platform !== 'all') {
      documents = documents.filter(doc => 
        doc?.linked_projects?.[platform as keyof typeof doc.linked_projects]?.length > 0
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
    const { title, content, description, userId, projectId, documentType, selectedSections, generationType }: { 
      title?: string; 
      content?: string; 
      description?: string; 
      userId?: string; 
      projectId?: string;
      documentType?: string; // Add documentType for individual documents
      selectedSections?: string[]; // Selected sections for the document
      generationType?: string; // 'full' or 'sections'
    } = body
    
    console.log('🔍 SDLC Documents POST - Request received:', {
      title: title?.substring(0, 50) + '...',
      contentLength: content?.length || 0,
      description: description?.substring(0, 50) + '...',
      userId: userId?.substring(0, 8) + '...',
      projectId: projectId || 'new',
      documentType: documentType || 'comprehensive_sdlc',
      selectedSections: selectedSections || [],
      generationType: generationType || 'full'
    })
    
    if (!title || !content) {
      console.log('❌ SDLC Documents POST - Missing required fields')
      return NextResponse.json(
        { error: 'Title and content are required' }, 
        { status: 400 }
      )
    }

    if (!userId) {
      console.log('❌ SDLC Documents POST - Missing userId')
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      )
    }
    
    const dbService = new SDLCDocumentDatabaseService()
    
    // If projectId is provided, try to update existing project
    if (projectId) {
      console.log('🔍 Updating existing SDLC document:', projectId)
      
      // If documentType is provided, add/update individual document
      if (documentType && documentType !== 'comprehensive_sdlc') {
        const success = await dbService.addOrUpdateIndividualDocument(projectId, documentType, content, selectedSections, generationType)
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to update individual document' }, 
            { status: 500 }
          )
        }
        
        // Get updated document
        const updatedDocument = await dbService.getSDLCDocumentById(projectId)
        return NextResponse.json({ 
          document: updatedDocument,
          success: true,
          action: 'updated_individual'
        })
      }
      
      // Update comprehensive document
      const updatedDocument = await dbService.updateSDLCDocument(projectId, {
        title: (title as string).trim(),
        content,
        description: description?.trim()
      })
      
      if (!updatedDocument) {
        console.error('Failed to update SDLC document')
        return NextResponse.json(
          { error: 'Failed to update document' }, 
          { status: 500 }
        )
      }
      
      console.log('✅ SDLC document updated successfully:', updatedDocument.id)
      
      return NextResponse.json({ 
        document: updatedDocument,
        success: true,
        action: 'updated'
      })
    }
    
    // Create new document
    console.log('🔍 Creating new SDLC document with userId:', userId)
    
    const document = await dbService.createSDLCDocument({
      title: (title as string).trim(),
      content,
      description: description?.trim(),
      document_type: documentType || 'comprehensive_sdlc',
      userId: userId
    })
    
    if (!document) {
      console.error('Failed to create SDLC document')
      return NextResponse.json(
        { error: 'Failed to create document' }, 
        { status: 500 }
      )
    }
    
    console.log('✅ New SDLC document created successfully:', document.id)
    
    return NextResponse.json({ 
      document,
      success: true,
      action: 'created'
    })
  } catch (error) {
    console.error('Error creating/updating SDLC document:', error)
    return NextResponse.json(
      { error: 'Failed to create/update document' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, title, content, description, userId }: { 
      projectId: string;
      title?: string; 
      content?: string; 
      description?: string; 
      userId?: string; 
    } = body
    
    console.log('🔍 SDLC Documents PUT - Request received:', {
      projectId,
      title: title?.substring(0, 50) + '...',
      contentLength: content?.length || 0,
      description: description?.substring(0, 50) + '...',
      userId: userId?.substring(0, 8) + '...'
    })
    
    if (!projectId) {
      console.log('❌ SDLC Documents PUT - Missing projectId')
      return NextResponse.json(
        { error: 'Project ID is required' }, 
        { status: 400 }
      )
    }

    if (!userId) {
      console.log('❌ SDLC Documents PUT - Missing userId')
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      )
    }
    
    const dbService = new SDLCDocumentDatabaseService()
    
    console.log('🔍 Updating SDLC document:', projectId)
    
    const updatedDocument = await dbService.updateSDLCDocument(projectId, {
      title: title?.trim(),
      content,
      description: description?.trim()
    })
    
    if (!updatedDocument) {
      console.error('Failed to update SDLC document')
      return NextResponse.json(
        { error: 'Failed to update document' }, 
        { status: 500 }
      )
    }
    
    console.log('✅ SDLC document updated successfully:', updatedDocument.id)
    
    return NextResponse.json({ 
      document: updatedDocument,
      success: true
    })
  } catch (error) {
    console.error('Error updating SDLC document:', error)
    return NextResponse.json(
      { error: 'Failed to update document' }, 
      { status: 500 }
    )
  }
} 