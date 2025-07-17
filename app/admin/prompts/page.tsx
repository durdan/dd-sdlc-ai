"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PromptManagement } from '@/components/admin/prompt-management';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, XCircle } from 'lucide-react';

interface UserRole {
  role: 'admin' | 'manager' | 'user';
}

export default function AdminPromptsPage() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUserAndRole();
  }, []);

  const checkUserAndRole = async () => {
    try {
      // Check if user is authenticated first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.push('/signin?redirect=/admin/prompts');
        return;
      }

      setUser(user);

      // Check if user is configured as admin via environment variable
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (adminEmail && user.email === adminEmail) {
        setUserRole('admin');
      } else {
        // Try to query the role from the database
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (roleError) {
            if (roleError.code === 'PGRST116') {
              // No role found - check if this could be the first user
              const { count } = await supabase
                .from('user_roles')
                .select('*', { count: 'exact', head: true });

              if (count === 0 && !adminEmail) {
                // First user becomes admin if no admin email is configured
                const { error: insertError } = await supabase
                  .from('user_roles')
                  .insert({ user_id: user.id, role: 'admin' });

                if (!insertError) {
                  setUserRole('admin');
                } else {
                  console.error('Failed to create admin role:', insertError);
                  setUserRole('user');
                  setError('Setup error. Please configure NEXT_PUBLIC_ADMIN_EMAIL or contact system administrator.');
                }
              } else {
                setUserRole('user');
                setError('You do not have permission to access this page. Admin or Manager role required.');
              }
            } else {
              console.error('Role check error:', roleError);
              setUserRole('user');
              setError('Error checking user permissions. Please try again.');
            }
          } else {
            setUserRole(roleData.role);
            
            // Only allow admin and manager roles
            if (roleData.role !== 'admin' && roleData.role !== 'manager') {
              setError('You do not have permission to access this page. Admin or Manager role required.');
            }
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          setUserRole('user');
          setError('Database connection error. Please try again.');
        }
      }

    } catch (err) {
      setError('Authentication error. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Checking permissions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user || !userRole || (userRole !== 'admin' && userRole !== 'manager')) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <h1 className="text-xl font-semibold">Access Denied</h1>
                <Alert variant="destructive">
                  <AlertDescription>
                    {error || 'You do not have permission to access this page. Admin or Manager role required.'}
                  </AlertDescription>
                </Alert>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>To access prompt management, you need:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Admin role for full management access</li>
                    <li>Manager role for viewing and testing prompts</li>
                  </ul>
                  <div className="mt-4 p-3 bg-blue-50 rounded-md text-left">
                    <p className="font-medium text-blue-900 mb-1">For system administrators:</p>
                    <p className="text-blue-800 text-xs">
                      Set NEXT_PUBLIC_ADMIN_EMAIL in your .env.local file, or the first user will automatically become admin.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
                >
                  Return to Dashboard
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">
                  Prompt Management System
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
              <span className="text-sm text-muted-foreground">
                Logged in as {user.email}
              </span>
              <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {userRole.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <PromptManagement userId={user.id} userRole={userRole} />
      </div>
    </div>
  );
} 