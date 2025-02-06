import React from 'react';
import { useDrag } from 'react-dnd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Pencil, Trash, CheckCircle, Clock, Tags  } from 'lucide-react';

function SessionTasksList({
  tasks, 
  onDeleteTask, 
  onEditTask, 
  onAddTag,
  onViewTask, 
  onMarkComplete,
  onMarkUncomplete, 
  onSetInProgress,
  showCompleteButton,
  showInProgressOption,
  // isCompletedSection,
  // isInProgressSection,
  isLocked 
}) {
  const TaskItem = ({ task }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'TASK',
      item: { 
        id: task.task_id, 
        isCompleted: task.is_complete,
        fromLockedCard: isLocked 
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: !task.is_complete && (!isLocked || !task.is_in_progress)
    });

    const handleAction = (action, ...args) => {
      if (!isLocked) {
        action(...args);
      }
    };

    return (
      <div
        ref={drag}
        className={`bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm flex justify-between items-center ${
          isDragging ? 'opacity-50' : ''
        } ${task.is_complete ? 'bg-gray-50' : ''}`}
      >
        <div className="flex items-center space-x-4">
          {showCompleteButton && (
            <button
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                task.is_complete ? 'border-green-500 bg-green-500' : 'border-gray-300'
              }`}
              onClick={() => handleAction(task.is_complete ? onMarkUncomplete : onMarkComplete, task)}
            >
              {task.is_complete && <CheckCircle className="w-4 h-4 text-white mx-auto" />}
            </button>
          )}

          <div>
            <p className="font-semibold line-clamp-1">{task.task_name}</p>
            <div className="text-sm text-gray-500 line-clamp-1 overflow-hidden text-ellipsis">
                {task.task_desc}
              </div> 

              {/* Render Tags */}
            <div className="flex flex-wrap gap-2 mt-1">
              {task.task_tags && task.task_tags.length > 0 ? (
                task.task_tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">No tags</span>
              )}
            </div>
            <span className="text-xs text-gray-500">
                  {task.date
                    ? new Date(task.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "No Date"}
                </span>
          </div>
        </div>

        {!isLocked && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewTask(task)}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>

              {showInProgressOption && !task.is_complete && !task.is_in_progress && (
                <DropdownMenuItem onClick={() => onSetInProgress(task)}>
                  <Clock className="w-4 h-4 mr-2" />
                  Set In Progress
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => onEditTask(task)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onAddTag(task)}>
                <Tags className="w-4 h-4 mr-2" />
                Add tag
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onDeleteTask(task)}
                className="text-red-600"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <TaskItem key={task.task_id} task={task} />
        ))
      ) : (
        <p className="text-gray-500 text-center mt-4">No tasks available.</p>
      )}
    </div>
  );
}

// const getPriorityColor = (level) => {
//   switch (level.toLowerCase()) {
//     case 'high':
//       return 'text-red-500';
//     case 'medium':
//       return 'text-yellow-500';
//     case 'low':
//       return 'text-green-500';
//     default:
//       return 'text-gray-500';
//   }
// };

export default SessionTasksList;