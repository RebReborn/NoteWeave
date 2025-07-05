
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useNotes } from '@/hooks/use-notes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleAuthProvider } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { exportNotesToSheet } from '@/ai/flows/export-to-sheets';
import { Loader2, ArrowLeft } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/icons';
import { redirect } from 'next/navigation';
import { ToastAction } from '@/components/ui/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


export default function SettingsPage() {
  const { user, loading: authLoading, getGoogleCredentialForSheets } = useAuth();
  const { notes, loading: notesLoading, deleteAllNotes } = useNotes(user);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!authLoading && !user) {
      redirect('/login');
    }
  }, [user, authLoading]);

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || "U";
  };
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const credential = await getGoogleCredentialForSheets();
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
  
  const handleDeleteAllNotes = async () => {
    setIsDeleting(true);
    try {
      await deleteAllNotes();
      // Toast is shown in the hook
    } catch (error: any) {
      // Error is already handled in the hook with a toast
      console.error(error);
    } finally {
      setIsDeleting(false);
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
      <main className="flex flex-1 justify-center p-4 md:p-10 bg-muted/20">
        <div className="w-full max-w-2xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is your account information.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {getInitials(user.displayName, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold text-lg">{user.displayName || 'No Name'}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export your notes for backup or analysis.
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
          
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                These actions are irreversible. Please proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting || notes.length === 0}>
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete All Notes
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all
                      of your notes from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllNotes}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="mt-2 text-sm text-muted-foreground">
                Permanently delete all of your notes.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
