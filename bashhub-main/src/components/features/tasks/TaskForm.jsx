import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function TaskForm({ task: initialTask, onSubmit, onCancel }) {
  console.log(initialTask);
  const [task, setTask] = useState({
    task_name: initialTask?.task_name || '',
    // task_description: initialTask?.task_description || '',
    // task_level: initialTask?.task_level || '', // No default value for urgency
  });

  const [errors, setErrors] = useState({}); // State to track validation errors

  // Update the form state if the `task` prop changes
  useEffect(() => {
    if (initialTask) {
      setTask({
        task_name: initialTask.task_name || '',
        // task_description: initialTask.task_description || '',
        // task_level: initialTask.task_level || '',
      });
    }
  }, [initialTask]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    const validationErrors = {};
    if (!task.task_name.trim()) {
      validationErrors.task_name = 'Task title is required.';
    }
    // if (!task.task_level) {
    //   validationErrors.task_level = 'Urgency level is required.';
    // }

    // If there are errors, set them and prevent submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Include the task_id if editing an existing task
    const updatedTask = initialTask
      ? { ...initialTask, task_id: initialTask.task_id, task_name: task.task_name }
      : task;

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
              setErrors((prevErrors) => ({ ...prevErrors, task_name: '' })); // Clear error on input
            }}
            required
          />
          {errors.task_name && (
            <p className="text-red-500 text-sm mt-1">{errors.task_name}</p>
          )}
        </div>

        {/* Urgency */}
        {/* <div className="flex-2">
          <Select
            value={task.task_level}
            onValueChange={(value) => {
              setTask({ ...task, task_level: value });
              setErrors((prevErrors) => ({ ...prevErrors, task_level: '' })); // Clear error on selection
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low Urgency</SelectItem>
              <SelectItem value="Medium">Medium Urgency</SelectItem>
              <SelectItem value="High">High Urgency</SelectItem>
            </SelectContent>
          </Select>
          {errors.task_level && (
            <p className="text-red-500 text-sm mt-1">{errors.task_level}</p>
          )}
        </div> */}
      </div>

      <div className="flex gap-4">
        {/* Task Description */}
        {/* <div className="flex-1">
          <Input
            placeholder="Add description..."
            value={task.task_description}
            onChange={(e) =>
              setTask({ ...task, task_description: e.target.value })
            }
          />
        </div> */}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialTask ? 'Save Changes' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
}

export default TaskForm;