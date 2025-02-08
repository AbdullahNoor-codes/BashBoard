import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import SessionCard from "../components/features/objectives/SessionCard";
import SessionTasksList from "../components/features/objectives/SessionTasksList";
// import TaskForm from '../components/features/objectives/TaskForm';
import TaskForm from "../components/features/tasks/TaskForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTaskAutoMove } from "@/hooks/useTaskAutoMove";
import { isTaskFromToday, isSameDay, getCurrentLocalDate } from "@/lib/utils";
import { useSessionLock } from "@/hooks/useSessionLock";
import { toast } from "sonner";
import TagsForm from "@/components/features/tasks/TagsForm";

//  https://server-bashboard.vercel.app/,

function Objectives() {
  const [activeTab, setActiveTab] = useState("current-tasks");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isViewingTask, setIsViewingTask] = useState(false);
  const [IsAddingTag, setIsAddingTag] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToAddTags, setTaskTags] = useState(null);
  const [taskToView, setTaskToView] = useState(null);
  const lockStatus = useSessionLock();

  const sessions = [
    { id: "current-tasks", title: "Current Task" },
    { id: "dws1", title: "Deep Work Session 1" },
    { id: "dws2", title: "Deep Work Session 2" },
    { id: "dws3", title: "Deep Work Session 3" },
    { id: "rws", title: "Remote Session" },
  ];

  // Fetch all tasks when the component mounts
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
    console.log("entered fetchTasks");
    let loadingToastId;
    try {
      loadingToastId = toast.loading("Loading Tasks");
      const response = await axios.get(
        `https://server-bashboard.vercel.app/apis/tasks?userId=${userId}`
      );
      const responseData = Array.isArray(response.data) ? response.data : [];
      console.log(responseData);
      toast.dismiss(loadingToastId);
      setTasks(responseData); // Ensure tasks is always an array
      const uniqueTags = [
        ...new Set(
          responseData.flatMap((task) => task.task_tags).filter((tag) => tag)
        ),
      ];
      setTags(uniqueTags);
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Sorry, try again. Could not load tasks.");
      console.error("Error fetching tasks:", error);
    }
  };

  const handleAddTask = async (newTask) => {
    let loadingToastId;
    let taskData;
    try {
      loadingToastId = toast.loading("Creating Task");

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found in local storage");

      taskData = {
        task_id: crypto.randomUUID(),
        task_name: newTask.task_name,
        task_tags: [],
        task_desc: newTask.task_desc,
        date: newTask.date,
        coming_from: selectedSessionId,
        moved_to: "",
        is_in_progress: false,
        is_complete: false,
        user_id: user.user_id,
      };

      setTasks((prevTasks) => [taskData, ...prevTasks]);

      await axios.post(
        "https://server-bashboard.vercel.app/apis/tasks",
        taskData
      );
      setIsAddingTask(false);
      toast.dismiss(loadingToastId);
      toast.success("Task Create Successfully!");
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Sorry Try again, could not Add Task");
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.task_id !== taskData.task_id)
      );
      console.error("Error adding task:", error.message || error);
    }
  };

  const handleMarkComplete = async (task) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found in local storage");
      const updatedTask = {
        ...task,
        date: getCurrentLocalDate(),
        is_complete: true,
        is_in_progress: false,
      };
      const newTasks = tasks.map((t) =>
        t.task_id === task.task_id ? updatedTask : t
      );
      setTasks(newTasks);

      await axios.put(
        `https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`,
        updatedTask
      );
      toast.success("Task Completed Successfully");
    } catch (error) {
      toast.error("Please Try Again Task is Not completed");
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.task_id === task.task_id ? task : t))
      );
      console.error("Error marking task as complete:", error);
    }
  };

  const handleMarkUncomplete = async (task) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found in local storage");
      const updatedTask = {
        ...task,
        is_complete: false,
        is_in_progress: false,
      };
      const newTasks = tasks.map((t) =>
        t.task_id === task.task_id ? updatedTask : t
      );
      setTasks(newTasks);

      await axios.put(
        `https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`,
        updatedTask
      );
    } catch (error) {
      toast.error("Please Try Again Task is Not Updated Correctly");
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.task_id === task.task_id ? task : t))
      );
      console.error("Error marking task as complete:", error);
    }
  };

  const handleEditTask = (task) => {
    console.log(task);
    setTaskToEdit(task);
    setIsEditingTask(true);
  };

  const handleSaveEdit = async (updatedTaskData) => {
    console.log(updatedTaskData);
    let loadingToastId;
    const oldTask = tasks.find((t) => t.task_id === updatedTaskData.task_id);
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.task_id === updatedTaskData.task_id ? { ...updatedTaskData } : t
      )
    );

    try {
      loadingToastId = toast.loading("Editing Task");
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found in local storage");

      await axios.put(
        `https://server-bashboard.vercel.app/apis/tasks/${updatedTaskData.task_id}`,
        updatedTaskData
      );
      setIsEditingTask(false); // Close the edit dialog
      toast.dismiss(loadingToastId);
      toast.success("Task Edited Successfully!");
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Sorry Try again, could not edit Task");
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.task_id === updatedTaskData.task_id ? oldTask : task
        )
      );
      console.error("Error updating task:", error.message || error);
    }
  };

  const handleAddTag = (task) => {
    console.log(task);
    setTaskTags(task);
    setIsAddingTag(true);
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
      await axios.delete(
        `https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`
      );
      toast.dismiss(loadingToastId);
      toast.success("Task Deleted Successfully!");
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Sorry Try again, could not delete Task");
      setTasks(oldtasks);
      console.error("Error deleting task:", error);
    }
  };

  const handleViewTask = (task) => {
    setTaskToView(task);
    setIsViewingTask(true);
  };

  const handleTaskMove = async (taskId, targetSession) => {
    const taskToUPdate = tasks.find((t) => t.task_id === taskId);

    if (!taskToUPdate) {
      toast.error("Task not found");
      return;
    }
    const updatedTask = {
      ...taskToUPdate,
      coming_from: targetSession,
    };

    const newTasks = tasks.map((t) => (t.task_id === taskId ? updatedTask : t));
    setTasks(newTasks);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found in local storage");

      await axios.put(
        `https://server-bashboard.vercel.app/apis/tasks/${taskId}`,
        updatedTask
      );

      toast.success("Task moved successfully");
    } catch (error) {
      toast.error("Sorry, could not move task. Please try again.");
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.task_id === taskId ? taskToUPdate : t))
      );
      console.error("Error moving task:", error);
    }
  };

  const handleSetInProgress = async (task) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("User not found in local storage");
      const updatedTask = {
        ...task,
        is_complete: false,
        is_in_progress: true,
      };
      const newTasks = tasks.map((t) =>
        t.task_id === task.task_id ? updatedTask : t
      );
      setTasks(newTasks);
      await axios.put(
        `https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`,
        updatedTask
      );
      toast.success("Task Completed Successfully");
    } catch (error) {
      toast.error("Please Try Again Task is Not completed");
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.task_id === task.task_id ? task : t))
      );
      console.error("Error marking task as complete:", error);
    }
  };


  const handleTasksUpdated = (dataToUpdate) => {
    console.log("Entered handleTasksUpdated")
    const updatedTasks = tasks.map((t) =>{
        const task = dataToUpdate.find(newtask => newtask.task_id === t.task_id);
        if(task){
          return { ...t, ...task }
        }
        return t;
      }
      );
      console.log(updatedTasks);
    setTasks(updatedTasks);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Sessions</h1>
      <DndProvider backend={HTML5Backend}>
        <div className="mx-30 max-h-[100vh] w-100">
          {/* Header */}
          {/* Responsive Layout */}
          <div className="lg:hidden">
            {/* Horizontal Scrolling Tabs for Small Screens */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="overflow-x-auto whitespace-nowrap pb-2">
                <TabsList className="flex gap-2 w-max">
                  {sessions.map((session) => (
                    <TabsTrigger
                      key={session.id}
                      value={session.id}
                      className="whitespace-nowrap"
                    >
                      {session.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {sessions.map((session) => (
                <TabsContent key={session.id} value={session.id}>
                  <SessionCard
                    id={session.id}
                    title={session.title}
                    tasks={tasks.filter((task) => task.coming_from === session.id)}
                    onAddTask={(sessionId) => {
                      setSelectedSessionId(sessionId);
                      setIsAddingTask(true);
                    }}
                    onTaskMove={handleTaskMove}
                    handleTasksUpdated={handleTasksUpdated}
                  >
                    <SessionTasksList
                      tasks={tasks.filter((task) => task.coming_from === session.id)}
                      onDeleteTask={handleDeleteTask}
                      onEditTask={handleEditTask}
                      onViewTask={handleViewTask}
                      onAddTag={handleAddTag}
                      onMarkComplete={handleMarkComplete}
                      onSetInProgress={handleSetInProgress}
                      onMarkUncomplete={handleMarkUncomplete}
                      showCompleteButton={session.id !== "current-tasks"} // Disable for current-tasks
                      showInProgressOption={session.id !== "current-tasks"}
                      // isLocked={lockStatus[session]}
                    />
                  </SessionCard>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Horizontal Scrolling for Larger Screens */}
          <div className="hidden lg:flex gap-4 pb-4 max-h-[80vh]">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                id={session.id}
                title={session.title}
                tasks={tasks.filter((task) => task.coming_from === session.id)}
                className="min-w-[400px] max-w-[400px]"
                onAddTask={(sessionId) => {
                  setSelectedSessionId(sessionId);
                  setIsAddingTask(true);
                }}
                onTaskMove={handleTaskMove}
                handleTasksUpdated={handleTasksUpdated}
              >
                <SessionTasksList
                  tasks={tasks.filter((task) => task.coming_from === session.id)}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleEditTask}
                  onAddTag={handleAddTag}
                  onViewTask={handleViewTask}
                  onMarkComplete={handleMarkComplete}
                  onSetInProgress={handleSetInProgress}
                  onMarkUncomplete={handleMarkUncomplete}
                  showCompleteButton={session.id !== "current-tasks"} // Disable for current-tasks
                  showInProgressOption={session.id !== "current-tasks"}
                  // isLocked={lockStatus[session]}
                />
              </SessionCard>
            ))}
          </div>

          {/* Add Task Dialog */}
          <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Task to Session</DialogTitle>
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
                optionTags={tags}
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
                  <p>
                    <strong>Status:</strong>{" "}
                    {taskToView.is_complete ? "Completed" : "Not Completed"}
                  </p>
                  {/* <p><strong>Level:</strong> {taskToView.task_level}</p>  */}
                  <p className="mb-4">
                    <strong>Created At:</strong>{" "}
                    {taskToView.date
                      ? new Date(
                          taskToView.date + "T00:00:00Z"
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "No Date"}
                  </p>
                  <button
                    className="px-3 py-1 bg-black text-white rounded-md mt-4 hover:bg-gray-800 transition-colors"
                    onClick={() => setIsViewingTask(false)}
                  >
                    OK
                  </button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DndProvider>
    </>
  );
}

export default Objectives;
