import React, { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useSessionLock } from '@/hooks/useSessionLock';
import axios from 'axios';

function SessionCard({ id, title, tasks, className, onAddTask, onTaskMove, handleTasksUpdated, children }) {
  const [showInProgressTasks, setShowInProgressTasks] = useState(true);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  console.log("tasks");
  console.log(tasks);
  const completedTasks = tasks.filter(task => task.is_complete);
  const inProgressTasks = tasks.filter(task => !task.is_complete && task.is_in_progress);
  const activeTasks = tasks.filter(task => !task.is_complete && !task.is_in_progress);
  console.log("completedTasks");
  console.log(completedTasks);
  console.log("inProgressTasks");
  console.log(inProgressTasks);
  console.log("activeTasks");
  console.log(activeTasks);

  const lockStatus = useSessionLock();
  const isLocked = lockStatus[id];
  console.log("isLocked");
  console.log(isLocked);

  useEffect(() => {
    // Check if the session is locked and there are tasks to move
    if (lockStatus[id] && (inProgressTasks.length > 0 || activeTasks.length > 0)) {
      const taskIds = [
        ...inProgressTasks.map((task) => task.task_id),
        ...activeTasks.map((task) => task.task_id),
      ];
      MoveTasksToCurrentTasks(taskIds); // Move tasks to "current-tasks"
    }
  }, [lockStatus[id], inProgressTasks, activeTasks]);

  // Function to move tasks to "current-tasks"
  const MoveTasksToCurrentTasks = async (listOfTaskIds) => {
    try {
      const requestBody = {
        task_ids: listOfTaskIds,
        coming_from: "current-tasks", // Update the "coming_from" field
      };

      // Make the API call to update tasks in bulk
      const response = await axios.post('https://server-bashboard.vercel.app/apis/tasks/bulk-update', requestBody);
      const fetchedTasks = response.data;
      handleTasksUpdated(fetchedTasks);
      console.log("Tasks moved to current-tasks successfully");
    } catch (error) {
      console.error("Error moving tasks to current-tasks:", error);
    }
  };

  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => {
      if (!item.isCompleted && (!isLocked || item.fromLockedCard)) {
        onTaskMove(item.id, id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver() && (!isLocked || monitor.getItem()?.fromLockedCard),
    }),
  });

  return (
    <div
      ref={drop}
      className={`min-h-[50vh] bg-white border border-gray-200 rounded-lg shadow-md shrink-0 overflow-y-auto
        ${isOver && 'border-blue-500 border-2'} 
        ${isLocked ? 'opacity-75' : ''} 
        ${className}`}
      id={id}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-gray-200 ">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold mb-2 sm:mb-0">{title}</h2>
            {isLocked && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                Locked
              </span>
            )}
          </div>
          {!isLocked && (
            <button
              className="px-3 py-1 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              onClick={() => onAddTask(id)}
            >
              Add Tasks
            </button>
          )}
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-4">
        {/* Active Tasks Section - Always visible */}
        <div className="space-y-2">
          <h3 className="text-md font-semibold mb-3">Active Tasks ({activeTasks.length})</h3>
          {React.cloneElement(children, { 
            tasks: activeTasks,
            isLocked: isLocked 
          })}
        </div>

        {/* In Progress Tasks Section - Collapsible */}
        {inProgressTasks.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button 
              onClick={() => setShowInProgressTasks(!showInProgressTasks)}
              className="flex items-center space-x-2 w-full text-left mb-3"
            >
              {showInProgressTasks ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <h3 className="text-md font-semibold">In Progress ({inProgressTasks.length})</h3>
            </button>
            {showInProgressTasks && React.cloneElement(children, { 
              tasks: inProgressTasks,
              isInProgressSection: true 
            })}
          </div>
        )}

        {/* Completed Tasks Section - Collapsible */}
        {completedTasks.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button 
              onClick={() => setShowCompletedTasks(!showCompletedTasks)}
              className="flex items-center space-x-2 w-full text-left mb-3"
            >
              {showCompletedTasks ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <h3 className="text-md font-semibold">Completed ({completedTasks.length})</h3>
            </button>
            {showCompletedTasks && React.cloneElement(children, { 
              tasks: completedTasks,
              isCompletedSection: true 
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionCard;