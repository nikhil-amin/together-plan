'use client';

import type { Task, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format, differenceInDays, isPast } from 'date-fns';
import { Edit2, Trash2, User, Users, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateTask } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  currentUserId: string | undefined;
  partners: UserProfile[];
}

export function TaskItem({ task, onEdit, onDelete, currentUserId, partners }: TaskItemProps) {
  const { toast } = useToast();
  const daysLeft = differenceInDays(task.deadline.toDate(), new Date());
  const isOverdue = isPast(task.deadline.toDate()) && task.status !== 'completed';
  const effectiveStatus = isOverdue ? 'overdue' : task.status;

  const handleStatusChange = async (completed: boolean) => {
    try {
      await updateTask(task.id, { status: completed ? 'completed' : 'pending' });
      toast({ title: 'Task Updated', description: `Task "${task.title}" marked as ${completed ? 'completed' : 'pending'}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to update task: ${error.message}` });
    }
  };
  
  const getAssigneeNames = () => {
    if (task.assignedTo.length === partners.length && partners.length > 1) return "Both";
    return task.assignedTo.map(uid => {
      if (uid === currentUserId) return "You";
      const partner = partners.find(p => p.uid === uid);
      return partner?.displayName?.split(' ')[0] || "Partner";
    }).join(', ');
  };


  const getStatusBadgeVariant = () => {
    switch (effectiveStatus) {
      case 'completed': return 'default'; // default is primary based on theme
      case 'overdue': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };
  
  const getStatusText = ()_=> {
     switch (effectiveStatus) {
      case 'completed': return 'Completed'; 
      case 'overdue': return 'Overdue';
      case 'pending': return 'Pending';
      default: return 'Pending';
    }
  }


  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl",
      effectiveStatus === 'completed' ? 'bg-primary/5 border-primary/20' : 
      effectiveStatus === 'overdue' ? 'bg-destructive/5 border-destructive/20' :
      'bg-card'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className={cn("text-lg leading-tight", effectiveStatus === 'completed' && 'line-through text-muted-foreground')}>{task.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={effectiveStatus === 'completed'}
              onCheckedChange={(checked) => handleStatusChange(Boolean(checked))}
              aria-label={`Mark task ${task.title} as ${effectiveStatus === 'completed' ? 'pending' : 'completed'}`}
              className={cn(effectiveStatus === 'completed' ? "border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" : "")}
            />
          </div>
        </div>
        {task.description && <CardDescription className={cn("text-xs pt-1", effectiveStatus === 'completed' && 'line-through text-muted-foreground/80')}>{task.description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            {task.assignedTo.length > 1 ? <Users className="h-3 w-3" /> : <User className="h-3 w-3" />}
            <span>{getAssigneeNames()}</span>
          </div>
           <Badge variant={getStatusBadgeVariant()} className="capitalize text-xs px-2 py-0.5">{getStatusText()}</Badge>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={cn(
            "font-medium",
            isOverdue ? "text-destructive" : daysLeft < 3 ? "text-amber-600" : "text-foreground/80"
          )}>
            Due: {format(task.deadline.toDate(), 'dd MMM, yyyy')}
          </span>
          <span className={cn(
            "font-semibold",
            isOverdue ? "text-destructive" : daysLeft < 0 ? "text-destructive" : (daysLeft < 3 ? "text-amber-600" : "text-green-600")
          )}>
            {effectiveStatus === 'completed' ? `Completed!` : 
             daysLeft < 0 ? `${Math.abs(daysLeft)} day(s) overdue` : 
             `${daysLeft} day(s) left`}
          </span>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 py-2 px-4 flex justify-end space-x-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(task)} aria-label="Edit task">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} aria-label="Delete task">
          <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
        </Button>
      </CardFooter>
    </Card>
  );
}
