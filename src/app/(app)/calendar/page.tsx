'use client';

import { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWedding } from '@/contexts/WeddingContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Task } from '@/lib/types';
import { Loader2, ListChecks } from 'lucide-react';
import { onSnapshot, query, collection, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const { weddingSession, loadingSession } = useWedding();
  const { user } = useAuth();
  
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
      console.error("Error fetching tasks:", error);
      setIsLoadingTasks(false);
    });

    return () => unsubscribe();
  }, [weddingSession, user]);

  const tasksOnSelectedDate = useMemo(() => {
    if (!date) return [];
    return tasks.filter(task => isSameDay(task.deadline.toDate(), date));
  }, [date, tasks]);

  const highlightedDays = useMemo(() => {
    return tasks.map(task => task.deadline.toDate());
  }, [tasks]);

  if (loadingSession) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline text-primary">Wedding Calendar</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg">
          <CardContent className="p-2 sm:p-4 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              modifiers={{ highlighted: highlightedDays }}
              modifiersStyles={{
                highlighted: { 
                  border: "2px solid hsl(var(--primary))",
                  borderRadius: 'var(--radius)' 
                }
              }}
            />
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">
              Tasks for {date ? format(date, 'MMMM do, yyyy') : 'selected date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto">
            {isLoadingTasks ? (
              <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : tasksOnSelectedDate.length > 0 ? (
              <ul className="space-y-3">
                {tasksOnSelectedDate.map(task => (
                  <li key={task.id} className="p-3 bg-secondary/20 rounded-md shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-sm">{task.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'} className="capitalize text-xs">
                        {task.status}
                      </Badge>
                       <Link href={`/checklist?task=${task.id}`} className="text-xs text-primary hover:underline">
                        View Details
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ListChecks className="h-10 w-10 mx-auto mb-2 opacity-50" />
                No tasks due on this day.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
