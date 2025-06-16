
'use client';

import { useWedding } from '@/contexts/WeddingContext';
import { Countdown } from '@/components/dashboard/Countdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, CalendarDays, Bell, Settings, Loader2, Sparkles, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import type { Task } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { onSnapshot, query, collection, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format, isSameDay, isPast } from 'date-fns';

export default function DashboardPage() {
  const { weddingSession, loadingSession } = useWedding();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  useEffect(() => {
    if (!weddingSession || !user) return;

    setIsLoadingTasks(true);
    const q = query(
      collection(db, 'tasks'),
      where('weddingId', '==', weddingSession.id),
      orderBy('deadline', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedTasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(fetchedTasks);
      setIsLoadingTasks(false);
    }, (error) => {
      console.error("Error fetching tasks for dashboard:", error);
      setIsLoadingTasks(false);
    });

    return () => unsubscribe();
  }, [weddingSession, user]);

  const taskSummary = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const overdue = tasks.filter(task => task.status !== 'completed' && task.deadline.toDate() < new Date() && !isSameDay(task.deadline.toDate(), new Date())).length;
    return { total, completed, overdue };
  }, [tasks]);

  const todayTasks = useMemo(() => {
    const today = new Date();
    return tasks.filter(task => 
      isSameDay(task.deadline.toDate(), today) && task.status !== 'completed'
    );
  }, [tasks]);


  if (loadingSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }

  if (!weddingSession) {
    return (
      <div className="text-center">
        <p className="text-xl">No wedding session found.</p>
        <Link href="/welcome">
          <Button className="mt-4">Setup Your Wedding</Button>
        </Link>
      </div>
    );
  }
  
  const weddingDate = weddingSession.weddingDate.toDate();

  return (
    <div className="space-y-6 sm:space-y-8">
      <Countdown weddingDate={weddingDate} />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {label: 'Checklist', href: '/checklist', icon: ListChecks},
            {label: 'Calendar', href: '/calendar', icon: CalendarDays},
            {label: 'Vendors', href: '/vendor-suggestions', icon: Sparkles},
            {label: 'Settings', href: '/settings', icon: Settings},
          ].map(link => (
            <Button key={link.label} variant="outline" asChild className="h-20 sm:h-24 flex-col gap-1 text-center">
              <Link href={link.href}>
                <link.icon className="h-6 w-6 sm:h-8 sm:w-8 mb-1" />
                <span className="text-xs sm:text-sm">{link.label}</span>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <Card>
          <CardHeader>
            <CardTitle  className="font-headline text-xl text-primary">Task Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoadingTasks ? (
              <div className="flex justify-center items-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                <p>Total Tasks: <span className="font-semibold">{taskSummary.total}</span></p>
                <p>Completed: <span className="font-semibold text-green-600">{taskSummary.completed}</span></p>
                {taskSummary.overdue > 0 && (
                   <p className="flex items-center">
                     <AlertTriangle className="h-4 w-4 mr-1 text-red-600"/>
                     Overdue: <span className="font-semibold text-red-600 ml-1">{taskSummary.overdue}</span>
                   </p>
                )}
                <Link href="/checklist">
                  <Button variant="link" className="px-0 pt-2">View all tasks</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Today&apos;s Focus</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTasks ? (
               <div className="flex justify-center items-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : todayTasks.length > 0 ? (
              <ul className="space-y-2">
                {todayTasks.map(task => (
                  <li key={task.id} className="text-sm p-2 bg-secondary/30 rounded-md shadow-sm">
                     <Link href={`/checklist?task=${task.id}`} className="hover:underline">
                        {task.title}
                     </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No tasks due today. Relax!</p>
            )}
             <Link href="/checklist?filter=today"> 
              <Button variant="link" className="px-0 mt-2">View today&apos;s tasks</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
       <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">Meet Your Partner in Planning!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
            {weddingSession.partnerIds.length < 2 && weddingSession.shareCode ? (
                <>
                <p className="mb-4">Share this code with your partner so they can join the wedding plan:</p>
                <p className="text-2xl font-bold tracking-widest bg-accent/30 text-accent-foreground p-3 rounded-md inline-block">
                    {weddingSession.shareCode}
                </p>
                </>
            ) : (
                <p>You and your partner are all set up!</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

