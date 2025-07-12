import { NextRequest, NextResponse } from 'next/server';
import { TrelloService } from '@/lib/trello-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, apiKey, token, boardId, listId, card } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const trelloService = new TrelloService(apiKey, token);

    switch (action) {
      case 'connect':
        try {
          const user = await trelloService.getCurrentUser();
          const boards = await trelloService.getUserBoards();
          
          return NextResponse.json({
            success: true,
            user,
            boards,
            message: 'Successfully connected to Trello'
          });
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid API credentials or connection failed' },
            { status: 401 }
          );
        }

      case 'get-boards':
        try {
          const boards = await trelloService.getUserBoards();
          return NextResponse.json({ boards });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch boards' },
            { status: 500 }
          );
        }

      case 'get-lists':
        if (!boardId) {
          return NextResponse.json({ error: 'Board ID is required' }, { status: 400 });
        }
        try {
          const lists = await trelloService.getBoardLists(boardId);
          return NextResponse.json({ lists });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch lists' },
            { status: 500 }
          );
        }

      case 'get-cards':
        if (!listId) {
          return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
        }
        try {
          const cards = await trelloService.getListCards(listId);
          return NextResponse.json({ cards });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch cards' },
            { status: 500 }
          );
        }

      case 'create-card':
        if (!listId || !card) {
          return NextResponse.json({ error: 'List ID and card data are required' }, { status: 400 });
        }
        try {
          const createdCard = await trelloService.createCard(listId, card);
          return NextResponse.json({ card: createdCard });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to create card' },
            { status: 500 }
          );
        }

      case 'update-card':
        if (!card?.id) {
          return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
        }
        try {
          const updatedCard = await trelloService.updateCard(card.id, card);
          return NextResponse.json({ card: updatedCard });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to update card' },
            { status: 500 }
          );
        }

      case 'delete-card':
        if (!card?.id) {
          return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
        }
        try {
          await trelloService.deleteCard(card.id);
          return NextResponse.json({ success: true });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to delete card' },
            { status: 500 }
          );
        }

      case 'add-checklist':
        if (!card?.id || !card?.checklistName) {
          return NextResponse.json({ error: 'Card ID and checklist name are required' }, { status: 400 });
        }
        try {
          const checklist = await trelloService.addChecklistToCard(card.id, card.checklistName, card.checklistItems || []);
          return NextResponse.json({ checklist });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to add checklist' },
            { status: 500 }
          );
        }

      case 'add-members':
        if (!card?.id || !card?.memberIds) {
          return NextResponse.json({ error: 'Card ID and member IDs are required' }, { status: 400 });
        }
        try {
          const result = await trelloService.addMembersToCard(card.id, card.memberIds);
          return NextResponse.json({ result });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to add members' },
            { status: 500 }
          );
        }

      case 'set-due-date':
        if (!card?.id || !card?.dueDate) {
          return NextResponse.json({ error: 'Card ID and due date are required' }, { status: 400 });
        }
        try {
          const updatedCard = await trelloService.setCardDueDate(card.id, card.dueDate);
          return NextResponse.json({ card: updatedCard });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to set due date' },
            { status: 500 }
          );
        }

      case 'add-labels':
        if (!card?.id || !card?.labelIds) {
          return NextResponse.json({ error: 'Card ID and label IDs are required' }, { status: 400 });
        }
        try {
          const result = await trelloService.addLabelsToCard(card.id, card.labelIds);
          return NextResponse.json({ result });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to add labels' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Trello API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const apiKey = searchParams.get('apiKey');
    const token = searchParams.get('token');
    const boardId = searchParams.get('boardId');
    const listId = searchParams.get('listId');

    if (!action || !apiKey || !token) {
      return NextResponse.json({ error: 'Action, API key, and token are required' }, { status: 400 });
    }

    const trelloService = new TrelloService(apiKey, token);

    switch (action) {
      case 'boards':
        try {
          const boards = await trelloService.getUserBoards();
          return NextResponse.json({ boards });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch boards' },
            { status: 500 }
          );
        }

      case 'lists':
        if (!boardId) {
          return NextResponse.json({ error: 'Board ID is required' }, { status: 400 });
        }
        try {
          const lists = await trelloService.getBoardLists(boardId);
          return NextResponse.json({ lists });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch lists' },
            { status: 500 }
          );
        }

      case 'cards':
        if (!listId) {
          return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
        }
        try {
          const cards = await trelloService.getListCards(listId);
          return NextResponse.json({ cards });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch cards' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Trello API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}