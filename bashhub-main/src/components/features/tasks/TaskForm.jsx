import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
function TaskForm({ task: initialTask, onSubmit, onCancel }) {
  console.log(initialTask);
  const [task, setTask] = useState({
    task_name: initialTask?.task_name || "",
    task_desc: initialTask?.task_desc || "",
    // task_level: initialTask?.task_level || '', // No default value for urgency
  });

  const [errors, setErrors] = useState({});

  // Update the form state if the `task` prop changes
  // useEffect(() => {
  //   if (initialTask) {
  //     setTask({
  //       task_name: initialTask.task_name || "",
  //       task_desc: initialTask?.task_desc || "",
  //       date: initialTask.date
  //         ? new Date(initialTask.date + "T00:00:00Z")
  //             .toISOString()
  //             .split("T")[0]
  //         : "",
  //     });
  //   }
  // }, [initialTask]);


  useEffect(() => {
    if (initialTask) {
      setTask({
        task_name: initialTask.task_name || "",
        task_desc: initialTask?.task_desc || "",
        date: initialTask.date
          ? new Date(initialTask.date + "T00:00:00Z")
              .toISOString()
              .split("T")[0]
          : "",
      });
    }
  }, [initialTask]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    const validationErrors = {};
    if (!task.task_name.trim()) {
      validationErrors.task_name = "Task title is required.";
    }
    // if (!task.task_level) {
    //   validationErrors.task_level = 'Urgency level is required.';
    // }

    // If there are errors, set them and prevent submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const updatedTask = initialTask
      ? {
          ...initialTask,
          task_id: initialTask.task_id,
          task_name: task.task_name,
          task_desc: task.task_desc,
          date:
            task.date && task.date.trim() !== ""
              ? task.date
              : new Date().toISOString().split("T")[0], // Set to current date if empty
        }
      : {
          ...task,
          date:
            task.date && task.date.trim() !== ""
              ? task.date
              : new Date().toISOString().split("T")[0], // Set to current date if empty
        };

    onSubmit(updatedTask);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        {/* Task Title */}
        <div className="flex-1">
          <Input
            placeholder="Add a new task..."
            value={task.task_name}
            onChange={(e) => {
              setTask({ ...task, task_name: e.target.value });
              setErrors((prevErrors) => ({ ...prevErrors, task_name: "" })); // Clear error on input
            }}
            required
          />
          {errors.task_name && (
            <p className="text-red-500 text-sm mt-1">{errors.task_name}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        {/* Task Description */}
        <div className="flex-1">
          <Input
            placeholder="Add description..."
            value={task.task_desc}
            onChange={(e) => setTask({ ...task, task_desc: e.target.value })}
          />
        </div>
      </div>
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
              selected={task.deadline}
              onSelect={(date) => {
                if (date) {
                  const localDate = new Date(
                    date.getTime() - date.getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .split("T")[0];
                  setTask({ ...task, date: localDate });
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
