'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import type { Task, TaskStatus, UserProfile } from '@/lib/types';
import { createTask, updateTask } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/firebase/auth'; // Assuming this function exists

interface TaskFormProps {
  task?: Task; // For editing existing task
  onFormSubmit: () => void; // Callback after submission
  partners: UserProfile[]; // List of partners in the wedding session
}

const taskFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().optional(),
  deadline: z.date({ required_error: 'Deadline is required.' }),
  assignedTo: z.array(z.string()).min(1, { message: 'Assign task to at least one person.' }),
  status: z.enum(['pending', 'completed', 'overdue']).default('pending'),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export function TaskForm({ task, onFormSubmit, partners }: TaskFormProps) {
  const { user } = useAuth();
  const { weddingSession } = useWedding();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || '',
          deadline: task.deadline.toDate(),
          assignedTo: task.assignedTo,
          status: task.status,
        }
      : {
          title: '',
          description: '',
          deadline: new Date(),
          assignedTo: user ? [user.uid] : [], // Default to current user
          status: 'pending',
        },
  });
  
  useEffect(() => {
    if (task) {
        form.reset({
            title: task.title,
            description: task.description || '',
            deadline: task.deadline.toDate(),
            assignedTo: task.assignedTo,
            status: task.status,
        });
    } else if (user) {
        form.reset({
            title: '',
            description: '',
            deadline: new Date(new Date().setDate(new Date().getDate() + 7)), // Default to 1 week from now
            assignedTo: [user.uid],
            status: 'pending',
        });
    }
  }, [task, form, user]);


  async function onSubmit(values: TaskFormValues) {
    if (!user || !weddingSession) {
      toast({ variant: 'destructive', title: 'Error', description: 'User or wedding session not found.' });
      return;
    }
    setIsSubmitting(true);

    const taskData = {
      ...values,
      deadline: Timestamp.fromDate(values.deadline),
      weddingId: weddingSession.id,
      createdBy: user.uid,
    };

    try {
      if (task) {
        await updateTask(task.id, taskData);
        toast({ title: 'Task Updated!', description: `"${values.title}" has been updated.` });
      } else {
        await createTask(taskData as Omit<Task, 'id' | 'createdAt' | 'lastUpdatedAt'>);
        toast({ title: 'Task Created!', description: `"${values.title}" has been added.` });
      }
      onFormSubmit();
      form.reset( task ? {} : {
        title: '',
        description: '',
        deadline: new Date(new Date().setDate(new Date().getDate() + 7)),
        assignedTo: user ? [user.uid] : [],
        status: 'pending',
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  const assignmentOptions = [
    { value: user?.uid || 'me', label: 'Me' },
    ...partners.filter(p => p.uid !== user?.uid).map(p => ({ value: p.uid, label: p.displayName || 'Partner' })),
    { value: 'both', label: 'Both' }
  ];


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Book photographer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add more details about the task..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Deadline</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                       disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign To</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === 'both' && user ? partners.map(p => p.uid) : [value])} 
                  defaultValue={field.value.length > 1 && user && partners.every(p => field.value.includes(p.uid)) ? 'both' : field.value[0]}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assignmentOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         {task && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {task ? 'Update Task' : 'Add Task'}
        </Button>
      </form>
    </Form>
  );
}
