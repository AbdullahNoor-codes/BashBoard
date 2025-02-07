import React, { useState, useEffect } from "react";
import TaskForm from "../components/features/tasks/TaskForm";
import TaskList from "../components/features/tasks/TaskList";
import { Button } from "@/components/ui/button";
import { useSessionLock } from "@/hooks/useSessionLock";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { isSameDay } from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TagsForm from "@/components/features/tasks/TagsForm";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isViewingTask, setIsViewingTask] = useState(false);
  const [taskToView, setTaskToView] = useState(null);
  const [isMovingTask, setIsMovingTask] = useState(false);
  const [taskToMove, setTaskToMove] = useState(null);
  const [taskToAddTags, setTaskTags] = useState(null);
  const [IsAddingTag, setIsAddingTag] = useState(false);
  const lockStatus = useSessionLock();
  const [activeTab, setActiveTab] = useState("today");


  // https://server-bashboard.vercel.app/
  // https://server-bashboard.vercel.app/







  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found in local storage");
      fetchTasks(user.user_id);
    } catch (error) {
      console.error("Error fetching task:", error);
    }
  }, []);

  const fetchTasks = async (userId) => {
    let loadingToastId;
    try {
      loadingToastId = toast.loading("Loading Tasks");
      // const response = await axios.get(`https://server-bashboard.vercel.app/apis/tasks?userId=${userId}`);
      const response = await axios.get(
        `https://server-bashboard.vercel.app/apis/tasks?userId=${userId}`
      );
      // console.log(response.data);
      toast.dismiss(loadingToastId);
      setTasks(response.data);
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Sorry Try again could not load tasks");
      console.error("Error fetching tasks:", error);
    }
  };

  const handleAddTask = async (newTask) => {
    let loadingToastId;
    let taskData;
    if (newTask.date)
      try {
        loadingToastId = toast.loading("Creating Task");

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) throw new Error("User not found in local storage");

        taskData = {
          task_id: uuidv4(),
          task_name: newTask.task_name,
          task_desc: newTask.task_desc,
          date: newTask.date,
          coming_from: "current-tasks",
          moved_to: "",
          is_in_progress: false,
          is_complete: false,
          user_id: user.user_id,
        };

        setTasks((prevTasks) => [taskData, ...prevTasks]);

        await axios.post("https://server-bashboard.vercel.app/apis/tasks", taskData);
        setIsAddingTask(false);
        toast.dismiss(loadingToastId);
        toast.success("Task Create Successfully!");
      } catch (error) {
        toast.dismiss(loadingToastId);
        toast.error("Sorry Try again, could not create Task");
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.task_id !== taskData.task_id)
        );
        console.error("Error adding task:", error.message || error);
      }
  };

  const handleEditTask = async (task) => {
    setIsEditingTask(true);
    setTaskToEdit(task);
  };

  const handleAddTag = (task) => {
    console.log(task);
    setTaskTags(task);  
    setIsAddingTag(true);
  };

  const handleSaveEdit = async (updatedTask) => {
    let loadingToastId;
    const oldTask = tasks.find((t) => t.task_id === updatedTask.task_id); // Store the original task name
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.task_id === updatedTask.task_id ? { ...updatedTask } : t
      )
    );

    try {
      loadingToastId = toast.loading("Editing Task");
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found in local storage");

      await axios.put(
        `https://server-bashboard.vercel.app/apis/tasks/${updatedTask.task_id}`,
        updatedTask
      );
      setIsEditingTask(false); // Close the edit dialog
      toast.dismiss(loadingToastId);
      toast.success("Task Edited Successfully!");
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Sorry Try again, could not edit Task");
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.task_id === updatedTask.task_id ? oldTask : task
        )
      );
      console.error("Error updating task:", error.message || error);
    }
  };

  const handleDeleteTask = async (task) => {
    let loadingToastId;
    const oldtasks = tasks;
    setTasks((prevTasks) =>
      prevTasks.filter((t) => t.task_id !== task.task_id)
    );
    try {
      loadingToastId = toast.loading("Deleting Task");
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found in local storage");
      await axios.delete(`https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`);
      toast.dismiss(loadingToastId);
      toast.success("Task Deleted Successfully!");
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Sorry Try again, could not delete Task");
      setTasks(oldtasks);
      console.error("Error deleting task:", error);
    }
  };

  // View a task
  const handleViewTask = (task) => {
    setTaskToView(task);
    setIsViewingTask(true);
  };

  // Move a task
  const handleMoveTask = (task) => {
    setTaskToMove(task);
    setIsMovingTask(true);
  };

  // Confirm moving a task to a session
  const handleMoveTaskConfirm = async (sessionId) => {
    let loadingToastId;
    setTasks((prevTask) =>
      prevTask.filter((task) => task.task_id !== taskToMove.task_id)
    );
    try {
      loadingToastId = toast.loading("Moving Task to a Session");
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found in local storage");
      const updatedTask = {
        ...taskToMove,
        coming_from: sessionId,
      };
      setIsMovingTask(false);
      await axios.put(
        `https://server-bashboard.vercel.app/apis/tasks/${taskToMove.task_id}`,
        updatedTask
      );
      toast.dismiss(loadingToastId);
      toast.success("Task Moved To a Session Successfully!");
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Sorry Try again, could not move Task");
      setTasks((prevTasks) => [taskToMove, ...prevTasks]);
      console.error("Error moving task:", error);
    }
  };

  // Add function to separate today's tasks
  const separateTasks = (tasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    return {
      todayTasks: tasks.filter(
        (task) => {
          const taskDate = new Date(task.date + "T00:00:00Z");
          return isSameDay(taskDate, today) && !task.is_complete && task.coming_from === "current-tasks";
        }
      ),
      oldTasks: tasks.filter(
        (task) => {
          const taskDate = new Date(task.date + "T00:00:00Z");
          return taskDate < today && !isSameDay(taskDate, today) && !task.is_complete && task.coming_from === "current-tasks";
        }
      ),
      futureTasks: tasks.filter(
        (task) => {
          const taskDate = new Date(task.date + "T00:00:00Z");
          return taskDate > today && !isSameDay(taskDate, today) && !task.is_complete && task.coming_from === "current-tasks";
        }
      ),
    };
  };
  

  // Separate tasks before rendering
  const { todayTasks, oldTasks, futureTasks } = separateTasks(tasks);

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        {!isAddingTask && (
          <Button onClick={() => setIsAddingTask(true)}>Add Task</Button>
        )}
      </div>

      <Tabs
        defaultValue="today"
        className="w-full"
        onValueChange={setActiveTab}
      >
        {/* Tabs List */}
        <TabsList className="mb-4">
          <TabsTrigger value="old">Old ({oldTasks.length})</TabsTrigger>
          <TabsTrigger value="today">Today's ({todayTasks.length})</TabsTrigger>
          <TabsTrigger value="future">
            Future ({futureTasks.length})
          </TabsTrigger>
        </TabsList>

        {/* Tabs Content */}
        <TabsContent value="old">
          <TaskList
            tasks={oldTasks}
            onEdit={handleEditTask}
            onAddTag={handleAddTag}
            onView={handleViewTask}
            onMove={handleMoveTask}
            onDelete={handleDeleteTask}
          />
        </TabsContent>
        <TabsContent value="today">
          <TaskList

            tasks={todayTasks}
            onEdit={handleEditTask}
            onAddTag={handleAddTag}
            onView={handleViewTask}
            onMove={handleMoveTask}
            onDelete={handleDeleteTask}
          />
        </TabsContent>
        <TabsContent value="future">
          <TaskList
            tasks={futureTasks}
            onEdit={handleEditTask}
            onAddTag={handleAddTag}
            onView={handleViewTask}
            onMove={handleMoveTask}
            onDelete={handleDeleteTask}
          />
        </TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create a new task</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new task.
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            onSubmit={handleAddTask}
            onCancel={() => setIsAddingTask(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditingTask} onOpenChange={setIsEditingTask}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the details of the selected task.
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            task={taskToEdit}
            onSubmit={handleSaveEdit}
            onCancel={() => setIsEditingTask(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={IsAddingTag} onOpenChange={setIsAddingTag}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
            <DialogDescription>
              Add Tags for the selected task.
            </DialogDescription>
          </DialogHeader>
          <TagsForm
            task={taskToAddTags}
            onSubmit={handleSaveEdit}
            onCancel={() => setIsAddingTag(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog open={isViewingTask} onOpenChange={setIsViewingTask}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {taskToView && (
            <div>
              <p>
                <strong>Name:</strong> {taskToView.task_name}
              </p>
              <p>
                <strong>Description:</strong> {taskToView.task_desc}
              </p>
              {/* <p><strong>Level:</strong> {taskToView.task_level}</p> */}
              <p>
                <strong>Status:</strong>{" "}
                {taskToView.is_complete ? "Completed" : "Not Completed"}
              </p>
              <p className="mb-4">
                <strong>Date:</strong>{" "}
                {taskToView.date
                  ? new Date(taskToView.date + "T00:00:00Z").toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }
                    )
                  : "No Date"}
              </p>
              <Button onClick={() => setIsViewingTask(false)}>OK</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Move Task Dialog */}
      <Dialog open={isMovingTask} onOpenChange={setIsMovingTask}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Move Task to Session</DialogTitle>
            <DialogDescription>
              Select a session to move this task to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["dws1", "dws2", "dws3", "rws"].map((sessionId) => {
              if (!lockStatus[sessionId]) {
                return (
                  <Button
                    key={sessionId}
                    variant="outline"
                    onClick={() => handleMoveTaskConfirm(sessionId)}
                    className="w-full"
                  >
                    {sessionId === "dws1" && "Deep Work Session 1"}
                    {sessionId === "dws2" && "Deep Work Session 2"}
                    {sessionId === "dws3" && "Deep Work Session 3"}
                    {sessionId === "rws" && "Remote Session"}
                  </Button>
                );
              }
              return (
                <Button
                  key={sessionId}
                  variant="disabled"
                  onClick={() => {}}
                  className="w-full"
                >
                  {sessionId === "dws1" && "Deep Work Session 1"}
                  {sessionId === "dws2" && "Deep Work Session 2"}
                  {sessionId === "dws3" && "Deep Work Session 3"}
                  {sessionId === "rws" && "Remote Session"}
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Tasks;
