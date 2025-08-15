'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Copy, Loader2, Terminal } from 'lucide-react';

export default function VSCodeAuthPage() {
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const deviceId = searchParams.get('device_id');

  useEffect(() => {
    authenticateAndGenerateCode();
  }, [deviceId]);

  const authenticateAndGenerateCode = async () => {
    try {
      const supabase = createClient();
      
      // Check if user is already authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        // Redirect to sign in
        window.location.href = `/signin?redirect=${encodeURIComponent(`/auth/vscode?device_id=${deviceId}`)}`;
        return;
      }

      if (!deviceId) {
        setError('Invalid request: Device ID is missing');
        setLoading(false);
        return;
      }

      // Generate auth code
      const code = generateAuthCode();
      
      // Store auth code in database
      const { error: codeError } = await supabase
        .from('vscode_auth_codes')
        .insert({
          code,
          device_id: deviceId,
          user_id: user.id
        });

      if (codeError) {
        console.error('Failed to store auth code:', codeError);
        setError('Failed to generate authentication code');
        setLoading(false);
        return;
      }

      setAuthCode(code);
      setLoading(false);
    } catch (error) {
      console.error('Auth error:', error);
      setError('An error occurred during authentication');
      setLoading(false);
    }
  };

  const generateAuthCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const copyToClipboard = async () => {
    if (authCode) {
      await navigator.clipboard.writeText(authCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating authentication code...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              onClick={() => window.location.href = '/signin'}
              className="w-full mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Terminal className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">VS Code Extension Authentication</CardTitle>
          <CardDescription>
            Copy the code below and paste it in VS Code to complete authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {authCode && (
            <>
              <div className="relative">
                <div className="flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <code className="text-3xl font-mono font-bold tracking-wider text-primary">
                    {authCode}
                  </code>
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Copy the authentication code above</li>
                  <li>Return to VS Code</li>
                  <li>Paste the code when prompted</li>
                  <li>You'll be signed in automatically</li>
                </ol>
              </div>

              <Alert>
                <AlertDescription>
                  This code will expire in 5 minutes for security reasons.
                </AlertDescription>
              </Alert>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  You can close this window after copying the code
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}