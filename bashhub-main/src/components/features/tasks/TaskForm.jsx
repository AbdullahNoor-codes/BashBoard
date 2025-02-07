import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";

function TaskForm({ task: initialTask, onSubmit, onCancel }) {
  console.log(initialTask);

  // Initialize state with task_tags included
  const [task, setTask] = useState({
    task_name: initialTask?.task_name || "",
    task_desc: initialTask?.task_desc || "",
    date: initialTask?.date
      ? new Date(initialTask.date + "T00:00:00Z").toISOString().split("T")[0]
      : getCurrentLocalDate(), // Use local date by default
    task_tags: initialTask?.task_tags || [], // Include task_tags in the initial state
  });

  const [errors, setErrors] = useState({});

  // Helper function to get the current date in the local timezone
  function getCurrentLocalDate() {
    const now = new Date();
    const localDate = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    ).toISOString();
    return localDate.split("T")[0];
  }

  // Update state when initialTask changes
  useEffect(() => {
    if (initialTask) {
      setTask({
        task_name: initialTask.task_name || "",
        task_desc: initialTask?.task_desc || "",
        date: initialTask.date
          ? new Date(initialTask.date + "T00:00:00Z").toISOString().split("T")[0]
          : getCurrentLocalDate(), // Use local date by default
        task_tags: initialTask?.task_tags || [], // Preserve task_tags
      });
    }
  }, [initialTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = {};
    if (!task.task_name.trim()) {
      validationErrors.task_name = "Task title is required.";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Create the updated task object
    const updatedTask = initialTask
      ? {
          ...initialTask,
          task_id: initialTask.task_id,
          task_name: task.task_name,
          task_desc: task.task_desc,
          date:
            task.date && task.date.trim() !== ""
              ? task.date
              : getCurrentLocalDate(), // Set to current local date if empty
          task_tags: task.task_tags, // Include task_tags in the updated task
        }
      : {
          ...task,
          date:
            task.date && task.date.trim() !== ""
              ? task.date
              : getCurrentLocalDate(), // Set to current local date if empty
        };

    onSubmit(updatedTask);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Task Title */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Add a new task..."
            value={task.task_name}
            onChange={(e) =>
              setTask((prevTask) => ({
                ...prevTask,
                task_name: e.target.value,
              }))
            }
            required
          />
          {errors.task_name && (
            <p className="text-red-500 text-sm mt-1">{errors.task_name}</p>
          )}
        </div>
      </div>

      {/* Task Description */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Add description..."
            value={task.task_desc}
            onChange={(e) =>
              setTask((prevTask) => ({
                ...prevTask,
                task_desc: e.target.value,
              }))
            }
          />
        </div>
      </div>

      {/* Task Date */}
      <div className="w-full">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {task.date ? (
                new Date(task.date).toLocaleDateString()
              ) : (
                <span>date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={task.date ? new Date(task.date) : null}
              onSelect={(date) => {
                if (date) {
                  const localDate = new Date(
                    date.getTime() - date.getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .split("T")[0];
                  setTask((prevTask) => ({
                    ...prevTask,
                    date: localDate,
                  }));
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialTask ? "Save Changes" : "Add Task"}
        </Button>
      </div>
    </form>
  );
}

export default TaskForm;