import { useEffect } from 'react';
import { SESSION_TIMES, isPastTime, isSameDay } from '@/lib/utils';
import axios from 'axios';

export function useTaskAutoMove(tasks, fetchTasks) {
  useEffect(() => {
    const checkAndMoveTasks = async () => {
      const now = new Date();
      const isUnlockTime = isPastTime(SESSION_TIMES.ALL_UNLOCK);

      if (isUnlockTime) {
        try {
          // Filter tasks that need to be moved (active and in-progress from today)
          const tasksToMove = tasks.filter(task => {
            const taskDate = new Date(task.task_time);
            return !task.is_complete && 
                   isSameDay(taskDate, now) &&
                   (task.coming_from === 'dws1' || 
                    task.coming_from === 'dws2' || 
                    task.coming_from === 'dws3' || 
                    task.coming_from === 'rws');
          });

          // Move tasks to current-tasks
          for (const task of tasksToMove) {
            const updatedTask = {
              ...task,
              coming_from: 'current-tasks',
              is_in_progress: false, // Reset in-progress state
              // Preserve original task_time
              task_time: task.task_time
            };
            // await axios.put(`https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`, updatedTask);
            await axios.put(`https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`, updatedTask);
          }

          // Refresh tasks if any were moved
          if (tasksToMove.length > 0) {
            fetchTasks();
          }
        } catch (error) {
          console.error('Error moving tasks:', error);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkAndMoveTasks, 60000);
    checkAndMoveTasks(); // Initial check

    return () => clearInterval(interval);
  }, [tasks, fetchTasks]);
}
