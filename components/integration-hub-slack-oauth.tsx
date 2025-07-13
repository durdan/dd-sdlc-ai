// Updated Slack handlers for Integration Hub - OAuth approach

// Replace the existing Slack handlers in integration-hub.tsx with these:

// Slack OAuth flow handlers
const handleSlackConnect = async () => {
  try {
    console.log('🔗 Starting Slack OAuth flow...');
    
    // Get OAuth URL from backend
    const response = await fetch('/api/user-integrations/slack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ action: 'get_oauth_url' })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to get OAuth URL');
    }

    // Open Slack OAuth in popup
    const popup = window.open(
      data.oauthUrl,
      'slack-oauth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    // Listen for OAuth completion
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        // Reload Slack config after OAuth
        setTimeout(() => {
          loadSlackConfigFromDatabase();
        }, 1000);
      }
    }, 1000);

  } catch (error) {
    console.error('❌ Slack OAuth error:', error);
    alert(`Failed to connect Slack: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const handleSlackDisconnect = async () => {
  try {
    console.log('🗑️ Disconnecting Slack integration...');
    
    const response = await fetch('/api/user-integrations/slack', {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to disconnect');
    }
    
    // Update state
    setIntegrationConfigs((prev) => ({
      ...prev,
      slack: {
        ...prev.slack,
        enabled: false,
        settings: {
          ...prev.slack?.settings,
          connected: false,
        },
      },
    }));
    
    console.log('✅ Slack integration disconnected');
    
  } catch (error) {
    console.error('❌ Error disconnecting Slack:', error);
    alert(`Failed to disconnect Slack: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Updated Slack integration UI section (replace existing Slack section):
{integration.id === "slack" && (
  <div className="space-y-4">
    {/* Connection Status */}
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium">Slack Connection</Label>
        {integrationConfigs.slack.settings.connected ? (
          <Badge variant="default" className="text-xs bg-green-100 text-green-700">
            Connected
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Not Connected
          </Badge>
        )}
      </div>
      
      {!integrationConfigs.slack.settings.connected ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Connect your Slack workspace to enable AI assistant with slash commands.
          </p>
          <Button
            onClick={handleSlackConnect}
            size="sm"
            className="w-full bg-slack hover:bg-slack/90"
            style={{ backgroundColor: '#4A154B' }}
          >
            <Slack className="h-4 w-4 mr-2" />
            Add to Slack
          </Button>
          <p className="text-xs text-gray-500 text-center">
            One-click setup • No configuration needed
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-white p-2 rounded border">
            <p className="text-xs text-gray-600">
              <strong>Workspace:</strong> {integrationConfigs.slack.settings.workspaceName}
            </p>
            <p className="text-xs text-gray-600">
              <strong>Default channel:</strong> {integrationConfigs.slack.settings.defaultChannel}
            </p>
          </div>
          <Button
            onClick={handleSlackDisconnect}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Slack className="h-4 w-4 mr-2" />
            Disconnect Slack
          </Button>
        </div>
      )}
    </div>

    {/* Features */}
    {integrationConfigs.slack.settings.connected && (
      <div className="p-3 bg-blue-50 rounded-lg">
        <Label className="text-sm font-medium">Available Commands</Label>
        <div className="mt-2 space-y-1">
          <div className="text-xs text-gray-600">
            <code className="bg-white px-1 rounded">/sdlc create [task]</code> - Create coding task
          </div>
          <div className="text-xs text-gray-600">
            <code className="bg-white px-1 rounded">/sdlc status [id]</code> - Check task status
          </div>
          <div className="text-xs text-gray-600">
            <code className="bg-white px-1 rounded">/sdlc list</code> - List your tasks
          </div>
          <div className="text-xs text-gray-600">
            <code className="bg-white px-1 rounded">/sdlc help</code> - Show help
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            🤖 Tasks created in Slack will use your Claude and GitHub configurations
          </p>
        </div>
      </div>
    )}
  </div>
)}
