
'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Task, UserProfile } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { getTasksForSession, deleteTask } from '@/lib/firebase/firestore';
import { getUserProfile } from '@/lib/firebase/auth'; // Corrected import path
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, Filter, ListChecks } from 'lucide-react';
import { TaskItem } from '@/components/tasks/TaskItem';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { onSnapshot, query, collection, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';

type TaskFilter = "all" | "my_tasks" | "completed" | "pending" | "overdue";

export default function ChecklistPage() {
  const { user } = useAuth();
  const { weddingSession, loadingSession } = useWedding();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [partners, setPartners] = useState<UserProfile[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const { toast } = useToast();

  useEffect(() => {
    if (!weddingSession || !user) return;

    setIsLoadingTasks(true);
    const q = query(
      collection(db, 'tasks'), 
      where('weddingId', '==', weddingSession.id),
      orderBy('deadline', 'asc') // Sort by deadline
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedTasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(fetchedTasks);
      setIsLoadingTasks(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      toast({variant: "destructive", title: "Error", description: "Could not load tasks."});
      setIsLoadingTasks(false);
    });

    // Fetch partner profiles
    const fetchPartners = async () => {
      const partnerProfiles = await Promise.all(
        weddingSession.partnerIds.map(uid => getUserProfile(uid))
      );
      setPartners(partnerProfiles.filter(p => p !== null) as UserProfile[]);
    };
    fetchPartners();

    return () => unsubscribe();
  }, [weddingSession, user, toast]);


  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      toast({ title: 'Task Deleted', description: 'The task has been successfully deleted.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to delete task: ${error.message}` });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleAddNewTask = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
        const isOverdue = task.status !== 'completed' && task.deadline.toDate() < new Date();
        switch (filter) {
            case 'my_tasks': return task.assignedTo.includes(user?.uid || '');
            case 'completed': return task.status === 'completed';
            case 'pending': return task.status === 'pending' && !isOverdue;
            case 'overdue': return isOverdue;
            default: return true; // 'all'
        }
    });
  }, [tasks, filter, user]);


  if (loadingSession || (isLoadingTasks && tasks.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline text-primary">Wedding Checklist</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filter} onValueChange={(value) => setFilter(value as TaskFilter)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="my_tasks">My Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNewTask} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl text-primary">
                  {editingTask ? 'Edit Task' : 'Add New Task'}
                </DialogTitle>
              </DialogHeader>
              <TaskForm
                task={editingTask}
                onFormSubmit={() => setIsFormOpen(false)}
                partners={partners}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoadingTasks && tasks.length === 0 ? (
         <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Fetching your tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
          <ListChecks className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">
            {filter === 'all' ? "No tasks yet. Let's add some!" : `No tasks match the filter "${filter.replace("_", " ")}".`}
          </p>
          {filter === 'all' && (
            <Button onClick={handleAddNewTask} className="mt-4">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Task
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              currentUserId={user?.uid}
              partners={partners}
            />
          ))}
        </div>
      )}
    </div>
  );
}
