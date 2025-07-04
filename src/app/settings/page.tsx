
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useNotes } from '@/hooks/use-notes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleAuthProvider, UserCredential } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { exportNotesToSheet } from '@/ai/flows/export-to-sheets';
import { Loader2, ArrowLeft } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/icons';
import { redirect } from 'next/navigation';
import { ToastAction } from '@/components/ui/toast';

export default function SettingsPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { notes, loading: notesLoading } = useNotes(user);
  const [isExporting, setIsExporting] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!authLoading && !user) {
      redirect('/login');
    }
  }, [user, authLoading]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const credential = await signInWithGoogle();
      const oauthCredential = GoogleAuthProvider.credentialFromResult(credential);
      const accessToken = oauthCredential?.accessToken;

      if (!accessToken) {
        throw new Error('Could not get access token from Google');
      }

      if (notes.length === 0) {
        toast({ title: 'No notes to export.' });
        setIsExporting(false);
        return;
      }
      
      const result = await exportNotesToSheet({ notes, accessToken });

      toast({
        title: 'Export Successful!',
        description: 'Your notes have been exported to Google Sheets.',
        action: (
          <ToastAction
            altText="Open Sheet"
            onClick={() => window.open(result.sheetUrl, '_blank')}
          >
            Open Sheet
          </ToastAction>
        ),
        duration: 10000,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Logo className="size-6 text-primary" />
            <h1 className="font-headline text-lg font-bold">Settings</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </header>
      <main className="flex flex-1 justify-center p-4 md:p-10">
        <Card className="h-fit w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Export Notes</CardTitle>
            <CardDescription>
              Export all your notes to a Google Sheets document for backup or
              analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} disabled={isExporting || notesLoading}>
              {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isExporting ? 'Exporting...' : 'Export to Google Sheets'}
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              You will be prompted to sign in with your Google account to grant
              permissions.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
