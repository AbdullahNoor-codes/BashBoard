import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from "sonner";

function TagsForm({ task: initialTask, onSubmit, onCancel, optionTags }) {
  const [task, setTask] = useState({
    ...initialTask,
    task_tags: initialTask?.task_tags || [],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (initialTask) {
      setTask({
        task_tags: initialTask?.task_tags || [],
      });
    }
  }, [initialTask]);

  // Function to add a tag from input
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

  // Function to remove a tag
  const handleRemoveTag = (indexToRemove) => {
    setTask((prevTask) => ({
      ...prevTask,
      task_tags: prevTask.task_tags.filter((_, index) => index !== indexToRemove),
    }));
  };

  // Function to add a tag from the optionTags list
  const handleSelectTag = (selectedTag) => {
    if (task.task_tags.includes(selectedTag)) {
      toast.error("Tag already added");
      return;
    }
    if (task.task_tags.length >= 5) {
      toast.error("Each task cannot have more than 5 tags");
      return;
    }
    setTask((prevTask) => ({
      ...prevTask,
      task_tags: [...prevTask.task_tags, selectedTag],
    }));
  };

  // Form submission handler
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
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Input for adding tags */}
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

      {/* Display added tags */}
      <div>
        <strong>Added Tags:</strong>
        <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
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
            <span className="text-gray-400">No tags added</span>
          )}
        </div>
      </div>

      {/* Display optional tags for selection */}
      {optionTags && optionTags.length > 0 && (
        <div>
          <strong>Select Tags:</strong>
          <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
            {optionTags.map((tag, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectTag(tag)}
                className={`text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 ${
                  task.task_tags.includes(tag) ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={task.task_tags.includes(tag)} // Disable if already added
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 sticky bottom-0 bg-white p-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Tags</Button>
      </div>
    </form>
  );
}

export default TagsForm;