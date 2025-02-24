import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  FolderInput,
  Trash,
  Eye,
  Tags,
} from "lucide-react";

function TaskList({ tasks, onEdit, onView, onMove, onDelete, onAddTag }) {
  if (!tasks.length) {
    return (
      <div className="text-center py-12 text-gray-500">No tasks available</div>
    );
  }
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.task_id}
          className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${
            task.is_complete ? "bg-gray-50" : ""
          }`}
        >
          <div className="flex justify-between items-start items-center">
            <div className="flex-1">
              <h3
                className={`font-medium ${
                  task.is_complete ? "line-through text-gray-500" : ""
                }`}
              >
                {task.task_name}
              </h3>
              {/* <div className="text-sm text-gray-500 line-clamp-2 overflow-hidden text-ellipsis mt-1 whitespace-normal break-word">
                {task.task_desc}
              </div> */}
              <div
                className="text-sm text-gray-500 mt-1 whitespace-normal break-words line-clamp-2 overflow-hidden text-ellipsis"
                style={{ wordBreak: "break-word" }}
              >
                {task.task_desc}
              </div>
              
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
              {/* <p className={`text-sm text-gray-600 mt-1`}>
                {task.task_desc}
              </p> */}
              <div className="flex items-center space-x-4 text-sm">
                {/* <span className={getPriorityBadgeClass(task.task_level)}>
                  {task.task_level}
                </span> */}
                <span className="text-sm text-gray-500 mt-1">
                  {task.date
                    ? new Date(task.date + "T00:00:00Z").toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }
                      )
                    : "No Date"}
                </span>

                {task.is_in_progress && (
                  <span className="text-blue-600">In Progress</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(task)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddTag(task)}>
                    <Tags className="w-4 h-4 mr-2" />
                    Add tag
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMove(task)}>
                    <FolderInput className="w-4 h-4 mr-2" />
                    Move
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(task)}
                    className="text-red-600"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// const getPriorityBadgeClass = (level) => {
//   const baseClass = "px-2 py-1 rounded-full text-xs font-medium";
//   switch (level.toLowerCase()) {
//     case 'high':
//       return `${baseClass} bg-red-100 text-red-800`;
//     case 'medium':
//       return `${baseClass} bg-yellow-100 text-yellow-800`;
//     case 'low':
//       return `${baseClass} bg-green-100 text-green-800`;
//     default:
//       return `${baseClass} bg-gray-100 text-gray-800`;
//   }
// };

export default TaskList;
