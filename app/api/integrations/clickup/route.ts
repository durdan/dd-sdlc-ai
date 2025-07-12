import { NextRequest, NextResponse } from 'next/server';
import { ClickUpService } from '@/lib/clickup-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, apiToken, teamId, spaceId, listId, task } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const clickUpService = new ClickUpService(apiToken);

    switch (action) {
      case 'connect':
        try {
          const user = await clickUpService.getCurrentUser();
          const teams = await clickUpService.getTeams();
          
          return NextResponse.json({
            success: true,
            user,
            teams,
            message: 'Successfully connected to ClickUp'
          });
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid API token or connection failed' },
            { status: 401 }
          );
        }

      case 'get-teams':
        try {
          const teams = await clickUpService.getTeams();
          return NextResponse.json({ teams });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch teams' },
            { status: 500 }
          );
        }

      case 'get-spaces':
        if (!teamId) {
          return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
        }
        try {
          const spaces = await clickUpService.getSpaces(teamId);
          return NextResponse.json({ spaces });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch spaces' },
            { status: 500 }
          );
        }

      case 'get-folders':
        if (!spaceId) {
          return NextResponse.json({ error: 'Space ID is required' }, { status: 400 });
        }
        try {
          const folders = await clickUpService.getFolders(spaceId);
          return NextResponse.json({ folders });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch folders' },
            { status: 500 }
          );
        }

      case 'get-lists':
        if (!spaceId) {
          return NextResponse.json({ error: 'Space ID is required' }, { status: 400 });
        }
        try {
          const lists = await clickUpService.getLists(spaceId);
          return NextResponse.json({ lists });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch lists' },
            { status: 500 }
          );
        }

      case 'create-task':
        if (!listId || !task) {
          return NextResponse.json({ error: 'List ID and task data are required' }, { status: 400 });
        }
        try {
          const createdTask = await clickUpService.createTask(listId, task);
          return NextResponse.json({ task: createdTask });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to create task' },
            { status: 500 }
          );
        }

      case 'update-task':
        if (!task?.id) {
          return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }
        try {
          const updatedTask = await clickUpService.updateTask(task.id, task);
          return NextResponse.json({ task: updatedTask });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
          );
        }

      case 'get-task':
        if (!task?.id) {
          return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }
        try {
          const taskData = await clickUpService.getTask(task.id);
          return NextResponse.json({ task: taskData });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch task' },
            { status: 500 }
          );
        }

      case 'delete-task':
        if (!task?.id) {
          return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }
        try {
          await clickUpService.deleteTask(task.id);
          return NextResponse.json({ success: true });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to delete task' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('ClickUp API error:', error);
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
    const apiToken = searchParams.get('apiToken');
    const teamId = searchParams.get('teamId');
    const spaceId = searchParams.get('spaceId');

    if (!action || !apiToken) {
      return NextResponse.json({ error: 'Action and API token are required' }, { status: 400 });
    }

    const clickUpService = new ClickUpService(apiToken);

    switch (action) {
      case 'teams':
        try {
          const teams = await clickUpService.getTeams();
          return NextResponse.json({ teams });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch teams' },
            { status: 500 }
          );
        }

      case 'spaces':
        if (!teamId) {
          return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
        }
        try {
          const spaces = await clickUpService.getSpaces(teamId);
          return NextResponse.json({ spaces });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch spaces' },
            { status: 500 }
          );
        }

      case 'lists':
        if (!spaceId) {
          return NextResponse.json({ error: 'Space ID is required' }, { status: 400 });
        }
        try {
          const lists = await clickUpService.getLists(spaceId);
          return NextResponse.json({ lists });
        } catch (error) {
          return NextResponse.json(
            { error: 'Failed to fetch lists' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('ClickUp API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}