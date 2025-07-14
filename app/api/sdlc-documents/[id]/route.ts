import { NextRequest, NextResponse } from 'next/server'
import { SDLCDocumentDatabaseService } from '@/lib/sdlc-document-database-service'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    const dbService = new SDLCDocumentDatabaseService()
    const document = await dbService.getSDLCDocumentById(id)
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      document,
      success: true 
    })
  } catch (error) {
    console.error('Error fetching SDLC document:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()
    
    const dbService = new SDLCDocumentDatabaseService()
    
    // Check if document exists first
    const existingDocument = await dbService.getSDLCDocumentById(id)
    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' }, 
        { status: 404 }
      )
    }
    
    // Update the document
    const updatedDocument = await dbService.updateSDLCDocument(id, body)
    
    if (!updatedDocument) {
      return NextResponse.json(
        { error: 'Failed to update document' }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      document: updatedDocument,
      success: true,
      message: 'Document updated successfully'
    })
  } catch (error) {
    console.error('Error updating SDLC document:', error)
    return NextResponse.json(
      { error: 'Failed to update document' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    const dbService = new SDLCDocumentDatabaseService()
    
    // Check if document exists first
    const existingDocument = await dbService.getSDLCDocumentById(id)
    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' }, 
        { status: 404 }
      )
    }
    
    const success = await dbService.deleteSDLCDocument(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete document' }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Document deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting SDLC document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' }, 
      { status: 500 }
    )
  }
} 