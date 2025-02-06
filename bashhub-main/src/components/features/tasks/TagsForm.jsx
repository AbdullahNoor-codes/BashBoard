import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react"; // Import the cross icon
import { toast } from "sonner"; // Import toast for notifications

function TagsForm({ task: initialTask, onSubmit, onCancel }) {
  const [task, setTask] = useState({
    ...initialTask,
    task_tags: initialTask?.task_tags || [],
  });
  const [tagInput, setTagInput] = useState(""); // State for the tag input

  useEffect(() => {
    if (initialTask) {
      setTask({
        task_tags: initialTask?.task_tags || [],
      });
    }
  }, [initialTask]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();

    if (!trimmedTag) {
      return;
    }

    if (trimmedTag.length > 60) {
      toast.error("Tag is too long");
      return;
    }

    if (task.task_tags.length >= 5) {
      toast.error("Each task cannot have more than 5 tags");
      return;
    }

    setTask((prevTask) => ({
      ...prevTask,
      task_tags: [...prevTask.task_tags, trimmedTag],
    }));
    setTagInput("");
  };

  const handleRemoveTag = (indexToRemove) => {
    setTask((prevTask) => ({
      ...prevTask,
      task_tags: prevTask.task_tags.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedTask = {
      ...initialTask,
      task_tags: task.task_tags,
    };
    onSubmit(updatedTask);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div className="flex gap-2">
        <Input
          placeholder="Enter a tag..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="flex-1"
        />
        <Button type="button" onClick={handleAddTag}>
          Add Tag
        </Button>
      </div>

      <div>
        <strong>Tags:</strong>
        <div className="flex flex-wrap gap-2 mt-2">
          {task.task_tags.length > 0 ? (
            task.task_tags.map((tag, index) => (
              <span
                key={index}
                className="text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)} 
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Remove tag"
                >
                  <X size={16} />
                </button>
              </span>
            ))
          ) : (
            <span>No tags added</span>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Tags</Button>
      </div>
    </form>
  );
}

export default TagsForm;