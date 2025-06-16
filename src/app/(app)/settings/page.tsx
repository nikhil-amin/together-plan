'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, UserCircle, CalendarIcon, LogOut, Trash2, Edit3 } from 'lucide-react';
import { updateUserProfile, signOut } from '@/lib/firebase/auth';
import { updateWeddingSession, leaveWeddingSession, deleteWeddingSession } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } } from 'date-fns';
import { cn } from '@/lib/utils';
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
} from "@/components/ui/alert-dialog"


export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { weddingSession, loadingSession, refreshWeddingSession, setWeddingSession } = useWedding();
  const { toast } = useToast();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newWeddingDate, setNewWeddingDate] = useState<Date | undefined>(weddingSession?.weddingDate.toDate());
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingWedding, setIsSavingWedding] = useState(false);

  // Placeholder for notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (authLoading || loadingSession) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user || !weddingSession) {
    // This should be handled by layout, but as a fallback:
    router.replace('/login');
    return null;
  }

  const handleProfileUpdate = async () => {
    setIsSavingProfile(true);
    try {
      await updateUserProfile(user.uid, { displayName });
      // Re-fetch or update user in AuthContext if needed, though onAuthStateChanged might handle it.
      toast({ title: 'Profile Updated', description: 'Your display name has been updated.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to update profile: ${error.message}` });
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  const handleWeddingDateChange = async () => {
    if (!newWeddingDate) {
      toast({variant: 'destructive', title: 'Invalid Date', description: 'Please select a new wedding date.'});
      return;
    }
    setIsSavingWedding(true);
    try {
      await updateWeddingSession(weddingSession.id, { weddingDate: Timestamp.fromDate(newWeddingDate) });
      refreshWeddingSession(); // This should update the context
      toast({ title: 'Wedding Date Updated', description: 'Your wedding date has been changed.' });
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Error', description: `Failed to update wedding date: ${error.message}` });
    } finally {
      setIsSavingWedding(false);
    }
  };

  const handleLeaveSession = async () => {
    if (weddingSession.ownerId === user.uid) {
        toast({variant: 'destructive', title: "Cannot Leave", description: "As the owner, you must delete the session instead of leaving."});
        return;
    }
    try {
        await leaveWeddingSession(weddingSession.id, user.uid);
        setWeddingSession(null); // Clear context immediately
        await updateUserProfile(user.uid, { activeWeddingId: null }); // Clear on user profile
        toast({title: "Left Session", description: "You have left the wedding session."});
        router.push('/welcome');
    } catch (error: any) {
        toast({variant: 'destructive', title: "Error Leaving", description: error.message});
    }
  };

  const handleDeleteSession = async () => {
     if (weddingSession.ownerId !== user.uid) {
        toast({variant: 'destructive', title: "Not Authorized", description: "Only the session owner can delete the wedding."});
        return;
    }
    try {
        // Clear activeWeddingId for all partners first
        for (const partnerId of weddingSession.partnerIds) {
            await updateUserProfile(partnerId, { activeWeddingId: null });
        }
        await deleteWeddingSession(weddingSession.id);
        setWeddingSession(null); // Clear context immediately
        toast({title: "Session Deleted", description: "The wedding session has been deleted."});
        router.push('/welcome');
    } catch (error: any) {
        toast({variant: 'destructive', title: "Error Deleting", description: error.message});
    }
  };


  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };


  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-headline text-primary">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><UserCircle className="mr-2 h-6 w-6 text-primary" /> Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email || ''} disabled />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleProfileUpdate} disabled={isSavingProfile || displayName === user.displayName}>
            {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Profile
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><Edit3 className="mr-2 h-6 w-6 text-primary" /> Wedding Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="weddingDate">Wedding Date</Label>
             <Popover>
                <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !newWeddingDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newWeddingDate ? format(newWeddingDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newWeddingDate}
                    onSelect={setNewWeddingDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                  />
                </PopoverContent>
              </Popover>
          </div>
          {weddingSession.shareCode && (
            <div>
                <Label>Share Code (for partner to join)</Label>
                <Input value={weddingSession.shareCode} disabled className="text-lg tracking-widest text-center font-mono"/>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleWeddingDateChange} disabled={isSavingWedding || newWeddingDate?.getTime() === weddingSession.weddingDate.toMillis()}>
             {isSavingWedding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Wedding Date
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="notifications" className="text-base">Enable Notifications</Label>
          <Switch
            id="notifications"
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
            aria-label="Toggle notifications"
          />
        </CardContent>
        <CardFooter>
            <CardDescription>Notification features require backend setup (FCM).</CardDescription>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-xl">Session Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
             {weddingSession.ownerId !== user.uid && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full">Leave Wedding Session</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will lose access to this wedding plan. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLeaveSession} className={buttonVariants({variant: "destructive"})}>Leave Session</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            {weddingSession.ownerId === user.uid && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive" className="w-full"><Trash2 className="mr-2 h-4 w-4"/> Delete Wedding Session</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Delete Wedding Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this wedding session and all its data for you and your partner. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSession} className={buttonVariants({variant: "destructive"})}>Delete Session</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </CardContent>
      </Card>

      <div className="pt-4">
         <Button variant="outline" onClick={handleSignOut} className="w-full">
            <LogOut className="mr-2 h-4 w-4" /> Log Out
        </Button>
      </div>
    </div>
  );
}

// Helper to get buttonVariants for AlertDialogAction (if not auto-imported)
const buttonVariants = ({variant}: {variant: "destructive" | "default" | "outline" | "secondary" | "ghost" | "link"}) => {
    if (variant === "destructive") return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
    // Add other variants if needed
    return "";
}

