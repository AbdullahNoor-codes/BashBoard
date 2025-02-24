// import React, { useState, useEffect } from "react";
// import TaskForm from "../components/features/tasks/TaskForm";
// import TaskList from "../components/features/tasks/TaskList";
// import { Button } from "@/components/ui/button";
// import { useSessionLock } from "@/hooks/useSessionLock";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { v4 as uuidv4 } from "uuid";
// import axios from "axios";
// import { isSameDay } from "@/lib/utils";
// import { toast } from "sonner";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import TagsForm from "@/components/features/tasks/TagsForm";

// function Tasks() {
//   const [tasks, setTasks] = useState([]);
//   const [isAddingTask, setIsAddingTask] = useState(false);
//   const [isEditingTask, setIsEditingTask] = useState(false);
//   const [taskToEdit, setTaskToEdit] = useState(null);
//   const [isViewingTask, setIsViewingTask] = useState(false);
//   const [taskToView, setTaskToView] = useState(null);
//   const [tags, setTags] = useState([]);
//   const [isMovingTask, setIsMovingTask] = useState(false);
//   const [taskToMove, setTaskToMove] = useState(null);
//   const [taskToAddTags, setTaskTags] = useState(null);
//   const [IsAddingTag, setIsAddingTag] = useState(false);
//   const lockStatus = useSessionLock();
//   const [activeTab, setActiveTab] = useState("today");

//   // https://server-bashboard.vercel.app/
//   // https://server-bashboard.vercel.app/

//   useEffect(() => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       if (!user) throw new Error("User not found in local storage");
//       fetchTasks(user.user_id);
//     } catch (error) {
//       console.error("Error fetching task:", error);
//     }
//   }, []);

//   const fetchTasks = async (userId) => {
//     let loadingToastId;
//     try {
//       loadingToastId = toast.loading("Loading Tasks");
//       // const response = await axios.get(`https://server-bashboard.vercel.app/apis/tasks?userId=${userId}`);
//       const response = await axios.get(
//         `https://server-bashboard.vercel.app/apis/tasks?userId=${userId}`
//       );
//       // console.log(response.data);
//       const responseData = Array.isArray(response.data) ? response.data : [];
//       console.log(responseData);
//       toast.dismiss(loadingToastId);
//       setTasks(responseData);
//       const uniqueTags = [
//         ...new Set(
//           responseData.flatMap((task) => task.task_tags).filter((tag) => tag)
//         ),
//       ];
//       setTags(uniqueTags);
//     } catch (error) {
//       toast.dismiss(loadingToastId);
//       toast.error("Sorry Try again could not load tasks");
//       console.error("Error fetching tasks:", error);
//     }
//   };

//   const handleAddTask = async (newTask) => {
//     let loadingToastId;
//     let taskData;
//     if (newTask.date)
//       try {
//         loadingToastId = toast.loading("Creating Task");

//         const user = JSON.parse(localStorage.getItem("user"));
//         if (!user) throw new Error("User not found in local storage");

//         taskData = {
//           task_id: uuidv4(),
//           task_name: newTask.task_name,
//           task_desc: newTask.task_desc,
//           date: newTask.date,
//           coming_from: "current-tasks",
//           moved_to: "",
//           is_in_progress: false,
//           is_complete: false,
//           user_id: user.user_id,
//         };

//         setTasks((prevTasks) => [taskData, ...prevTasks]);

//         await axios.post(
//           "https://server-bashboard.vercel.app/apis/tasks",
//           taskData
//         );
//         setIsAddingTask(false);
//         toast.dismiss(loadingToastId);
//         toast.success("Task Create Successfully!");
//       } catch (error) {
//         toast.dismiss(loadingToastId);
//         toast.error("Sorry Try again, could not create Task");
//         setTasks((prevTasks) =>
//           prevTasks.filter((task) => task.task_id !== taskData.task_id)
//         );
//         console.error("Error adding task:", error.message || error);
//       }
//   };

//   const handleEditTask = async (task) => {
//     setIsEditingTask(true);
//     setTaskToEdit(task);
//   };

//   const handleAddTag = (task) => {
//     console.log(task);
//     setTaskTags(task);
//     setIsAddingTag(true);
//   };

//   const handleSaveEdit = async (updatedTask) => {
//     let loadingToastId;
//     const newTags = updatedTask.task_tags;
//     const uniqueTags = [
//       ...new Set(
//         [...tags,
//         ...newTags]
//       ),
//     ];
//     setTags(uniqueTags);
//     const oldTask = tasks.find((t) => t.task_id === updatedTask.task_id); // Store the original task name
//     setTasks((prevTasks) =>
//       prevTasks.map((t) =>
//         t.task_id === updatedTask.task_id ? { ...updatedTask } : t
//       )
//     );

//     try {
//       loadingToastId = toast.loading("Editing Task");
//       const user = JSON.parse(localStorage.getItem("user"));
//       if (!user) throw new Error("User not found in local storage");

//       await axios.put(
//         `https://server-bashboard.vercel.app/apis/tasks/${updatedTask.task_id}`,
//         updatedTask
//       );
//       setIsEditingTask(false); // Close the edit dialog
//       toast.dismiss(loadingToastId);
//       toast.success("Task Edited Successfully!");
//     } catch (error) {
//       toast.dismiss(loadingToastId);
//       toast.error("Sorry Try again, could not edit Task");
//       setTasks((prevTasks) =>
//         prevTasks.map((task) =>
//           task.task_id === updatedTask.task_id ? oldTask : task
//         )
//       );
//       console.error("Error updating task:", error.message || error);
//     }
//   };

//   const handleDeleteTask = async (task) => {
//     let loadingToastId;
//     const oldtasks = tasks;
//     setTasks((prevTasks) =>
//       prevTasks.filter((t) => t.task_id !== task.task_id)
//     );
//     try {
//       loadingToastId = toast.loading("Deleting Task");
//       const user = JSON.parse(localStorage.getItem("user"));
//       if (!user) throw new Error("User not found in local storage");
//       await axios.delete(
//         `https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`
//       );
//       toast.dismiss(loadingToastId);
//       toast.success("Task Deleted Successfully!");
//     } catch (error) {
//       toast.dismiss(loadingToastId);
//       toast.error("Sorry Try again, could not delete Task");
//       setTasks(oldtasks);
//       console.error("Error deleting task:", error);
//     }
//   };

//   // View a task
//   const handleViewTask = (task) => {
//     setTaskToView(task);
//     setIsViewingTask(true);
//   };

//   // Move a task
//   const handleMoveTask = (task) => {
//     setTaskToMove(task);
//     setIsMovingTask(true);
//   };

//   // Confirm moving a task to a session
//   const handleMoveTaskConfirm = async (sessionId) => {
//     let loadingToastId;
//     setTasks((prevTask) =>
//       prevTask.filter((task) => task.task_id !== taskToMove.task_id)
//     );
//     try {
//       loadingToastId = toast.loading("Moving Task to a Session");
//       const user = JSON.parse(localStorage.getItem("user"));
//       if (!user) throw new Error("User not found in local storage");
//       const updatedTask = {
//         ...taskToMove,
//         coming_from: sessionId,
//       };
//       setIsMovingTask(false);
//       await axios.put(
//         `https://server-bashboard.vercel.app/apis/tasks/${taskToMove.task_id}`,
//         updatedTask
//       );
//       toast.dismiss(loadingToastId);
//       toast.success("Task Moved To a Session Successfully!");
//     } catch (error) {
//       toast.dismiss(loadingToastId);
//       toast.error("Sorry Try again, could not move Task");
//       setTasks((prevTasks) => [taskToMove, ...prevTasks]);
//       console.error("Error moving task:", error);
//     }
//   };

//   // Add function to separate today's tasks
//   const separateTasks = (tasks) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     return {
//       todayTasks: tasks.filter((task) => {
//         const taskDate = new Date(task.date + "T00:00:00Z");
//         return (
//           isSameDay(taskDate, today) &&
//           !task.is_complete &&
//           task.coming_from === "current-tasks"
//         );
//       }),
//       oldTasks: tasks.filter((task) => {
//         const taskDate = new Date(task.date + "T00:00:00Z");
//         return (
//           taskDate < today &&
//           !isSameDay(taskDate, today) &&
//           !task.is_complete &&
//           task.coming_from === "current-tasks"
//         );
//       }),
//       futureTasks: tasks.filter((task) => {
//         const taskDate = new Date(task.date + "T00:00:00Z");
//         return (
//           taskDate > today &&
//           !isSameDay(taskDate, today) &&
//           !task.is_complete &&
//           task.coming_from === "current-tasks"
//         );
//       }),
//     };
//   };

//   // Separate tasks before rendering
//   const { todayTasks, oldTasks, futureTasks } = separateTasks(tasks);

//   return (
//     <div className="container mx-auto max-w-4xl">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Tasks</h1>
//         {!isAddingTask && (
//           <Button onClick={() => setIsAddingTask(true)}>Add Task</Button>
//         )}
//       </div>

//       <Tabs
//         defaultValue="today"
//         className="w-full"
//         onValueChange={setActiveTab}
//       >
//         {/* Tabs List */}
//         <TabsList className="mb-4">
//           <TabsTrigger value="old">Old ({oldTasks.length})</TabsTrigger>
//           <TabsTrigger value="today">Today's ({todayTasks.length})</TabsTrigger>
//           <TabsTrigger value="future">
//             Future ({futureTasks.length})
//           </TabsTrigger>
//         </TabsList>

//         {/* Tabs Content */}
//         <TabsContent value="old">
//           <TaskList
//             tasks={oldTasks}
//             onEdit={handleEditTask}
//             onAddTag={handleAddTag}
//             onView={handleViewTask}
//             onMove={handleMoveTask}
//             onDelete={handleDeleteTask}
//           />
//         </TabsContent>
//         <TabsContent value="today">
//           <TaskList
//             tasks={todayTasks}
//             onEdit={handleEditTask}
//             onAddTag={handleAddTag}
//             onView={handleViewTask}
//             onMove={handleMoveTask}
//             onDelete={handleDeleteTask}
//           />
//         </TabsContent>
//         <TabsContent value="future">
//           <TaskList
//             tasks={futureTasks}
//             onEdit={handleEditTask}
//             onAddTag={handleAddTag}
//             onView={handleViewTask}
//             onMove={handleMoveTask}
//             onDelete={handleDeleteTask}
//           />
//         </TabsContent>
//       </Tabs>

//       {/* Add Task Dialog */}
//       <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Create a new task</DialogTitle>
//             <DialogDescription>
//               Fill in the details below to create a new task.
//             </DialogDescription>
//           </DialogHeader>
//           <TaskForm
//             onSubmit={handleAddTask}
//             onCancel={() => setIsAddingTask(false)}
//           />
//         </DialogContent>
//       </Dialog>

//       {/* Edit Task Dialog */}
//       <Dialog open={isEditingTask} onOpenChange={setIsEditingTask}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Edit Task</DialogTitle>
//             <DialogDescription>
//               Update the details of the selected task.
//             </DialogDescription>
//           </DialogHeader>
//           <TaskForm
//             task={taskToEdit}
//             onSubmit={handleSaveEdit}
//             onCancel={() => setIsEditingTask(false)}
//           />
//         </DialogContent>
//       </Dialog>

//       <Dialog open={IsAddingTag} onOpenChange={setIsAddingTag}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Add Tag</DialogTitle>
//             <DialogDescription>
//               Add Tags for the selected task.
//             </DialogDescription>
//           </DialogHeader>
//           <TagsForm
//             optionTags={tags}
//             task={taskToAddTags}
//             onSubmit={handleSaveEdit}
//             onCancel={() => setIsAddingTag(false)}
//           />
//         </DialogContent>
//       </Dialog>

//       {/* View Task Dialog */}
//       <Dialog open={isViewingTask} onOpenChange={setIsViewingTask}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Task Details</DialogTitle>
//           </DialogHeader>
//           {taskToView && (
//             <div>
//               <p>
//                 <strong>Name:</strong> {taskToView.task_name}
//               </p>
//               <p>
//                 <strong>Description:</strong> {taskToView.task_desc}
//               </p>
//               {/* <p><strong>Level:</strong> {taskToView.task_level}</p> */}
//               <p>
//                 <strong>Status:</strong>{" "}
//                 {taskToView.is_complete ? "Completed" : "Not Completed"}
//               </p>
//               <p className="mb-4">
//                 <strong>Date:</strong>{" "}
//                 {taskToView.date
//                   ? new Date(taskToView.date + "T00:00:00Z").toLocaleDateString(
//                       "en-US",
//                       {
//                         year: "numeric",
//                         month: "2-digit",
//                         day: "2-digit",
//                       }
//                     )
//                   : "No Date"}
//               </p>
//               <Button onClick={() => setIsViewingTask(false)}>OK</Button>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Move Task Dialog */}
//       <Dialog open={isMovingTask} onOpenChange={setIsMovingTask}>
//         <DialogContent className="w-[95vw] max-w-md mx-auto">
//           <DialogHeader>
//             <DialogTitle>Move Task to Session</DialogTitle>
//             <DialogDescription>
//               Select a session to move this task to.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {["dws1", "dws2", "dws3", "rws"].map((sessionId) => {
//               if (!lockStatus[sessionId]) {
//                 return (
//                   <Button
//                     key={sessionId}
//                     variant="outline"
//                     onClick={() => handleMoveTaskConfirm(sessionId)}
//                     className="w-full"
//                   >
//                     {sessionId === "dws1" && "Deep Work Session 1"}
//                     {sessionId === "dws2" && "Deep Work Session 2"}
//                     {sessionId === "dws3" && "Deep Work Session 3"}
//                     {sessionId === "rws" && "Remote Session"}
//                   </Button>
//                 );
//               }
//               return (
//                 <Button
//                   key={sessionId}
//                   variant="disabled"
//                   onClick={() => {}}
//                   className="w-full"
//                 >
//                   {sessionId === "dws1" && "Deep Work Session 1"}
//                   {sessionId === "dws2" && "Deep Work Session 2"}
//                   {sessionId === "dws3" && "Deep Work Session 3"}
//                   {sessionId === "rws" && "Remote Session"}
//                 </Button>
//               );
//             })}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// export default Tasks;
// import { useState, useEffect } from "react";
// import ProjectNavBar from "@/components/layout/ProjectNavBar";
// import TaskForm from "../components/features/tasks/TaskForm";
// import TaskList from "../components/features/tasks/TaskList";
// import TagsForm from "@/components/features/tasks/TagsForm";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { useSessionLock } from "@/hooks/useSessionLock";
// import { v4 as uuidv4 } from "uuid";
// import axios from "axios";
// import { toast } from "sonner";

// function Tasks() {
//   const [tasks, setTasks] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState(
//     localStorage.getItem("selectedProjectId") || null
//   );

//   const [isAddingTask, setIsAddingTask] = useState(false);
//   const [isEditingTask, setIsEditingTask] = useState(false);
//   const [taskToEdit, setTaskToEdit] = useState(null);
//   const [isViewingTask, setIsViewingTask] = useState(false);
//   const [taskToView, setTaskToView] = useState(null);
//   const [isMovingTask, setIsMovingTask] = useState(false);
//   const [taskToMove, setTaskToMove] = useState(null);
//   const [tags, setTags] = useState([]);
//   const [isAddingTag, setIsAddingTag] = useState(false);
//   const [taskToAddTags, setTaskToAddTags] = useState(null);

//   const lockStatus = useSessionLock();

//   //   Fetch tasks based on selected project
//   const fetchTasks = async (projectId) => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (!user || !projectId) return;

//     try {
//       const { data } = await axios.get(`http://localhost:3000/apis/tasks`, {
//         params: { userId: user.user_id, projectId },
//       });

//       const tasksWithFormattedDates = data.map((task) => ({
//         ...task,
//         date: task.date
//           ? new Date(task.date).toLocaleDateString("en-US")
//           : "No Date",
//       }));

//       setTasks(tasksWithFormattedDates);
//       setTags([
//         ...new Set(data.flatMap((task) => task.task_tags).filter(Boolean)),
//       ]);
//     } catch {
//       toast.error("Failed to fetch tasks");
//     }
//   };

//   //   Load tasks when a project is selected
//   useEffect(() => {
//     if (selectedProjectId) {
//       localStorage.setItem("selectedProjectId", selectedProjectId);
//       fetchTasks(selectedProjectId);
//     }
//   }, [selectedProjectId]);

//   //   Handle adding a new task
//   const handleAddTask = async (newTask) => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (!user || !selectedProjectId)
//       return toast.error("Missing user or project");

//     const taskData = {
//       task_id: uuidv4(),
//       ...newTask,
//       user_id: user.user_id,
//       project_id: selectedProjectId,
//     };

//     try {
//       const { data } = await axios.post(
//         "http://localhost:3000/apis/tasks",
//         taskData
//       );
//       setTasks((prev) => [data, ...prev]);
//       setIsAddingTask(false);
//       toast.success("Task added");
//     } catch {
//       toast.error("Failed to add task");
//     }
//   };

//   // ✍️ Handle task edit save
//   const handleSaveEdit = async (updatedTask) => {
//     try {
//       const { data } = await axios.put(
//         `http://localhost:3000/apis/tasks/${updatedTask.task_id}`,
//         updatedTask
//       );
//       setTasks((prev) =>
//         prev.map((t) => (t.task_id === updatedTask.task_id ? data : t))
//       );
//       setIsEditingTask(false);
//       toast.success("Task updated");
//     } catch {
//       toast.error("Failed to update task");
//     }
//   };

//   //   Handle task deletion
//   const handleDeleteTask = async (taskId) => {
//     try {
//       await axios.delete(`http://localhost:3000/apis/tasks/${taskId}`);
//       setTasks((prev) => prev.filter((t) => t.task_id !== taskId));
//       toast.success("Task deleted");
//     } catch {
//       toast.error("Failed to delete task");
//     }
//   };

//   //   Handle adding tags
//   const handleAddTag = (task) => {
//     setTaskToAddTags(task);
//     setIsAddingTag(true);
//   };

//   //   View task details
//   const handleViewTask = (task) => {
//     setTaskToView(task);
//     setIsViewingTask(true);
//   };

//   //   Move task to session
//   const handleMoveTask = (task) => {
//     setTaskToMove(task);
//     setIsMovingTask(true);
//   };

//   const handleMoveTaskConfirm = async (sessionId) => {
//     const updatedTask = { ...taskToMove, coming_from: sessionId };
//     try {
//       await axios.put(
//         `http://localhost:3000/apis/tasks/${taskToMove.task_id}`,
//         updatedTask
//       );
//       setTasks((prev) =>
//         prev.map((t) => (t.task_id === taskToMove.task_id ? updatedTask : t))
//       );
//       setIsMovingTask(false);
//       toast.success("Task moved");
//     } catch {
//       toast.error("Failed to move task");
//     }
//   };

//   const filteredTasks = tasks.filter((task) => !task.is_complete);

//   return (
//     <div className="container mx-auto max-w-4xl">
//       {/*   Project Navigation */}
//       <ProjectNavBar
//         userId={JSON.parse(localStorage.getItem("user")).user_id}
//         selectedProjectId={selectedProjectId}
//         onSelectProject={setSelectedProjectId}
//       />

//       {/*   Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Tasks</h1>
//         {!isAddingTask && (
//           <Button onClick={() => setIsAddingTask(true)}>Add Task</Button>
//         )}
//       </div>

//       {/*   Task List */}
//       {filteredTasks.length ? (
//         <TaskList
//           tasks={filteredTasks}
//           onEdit={setTaskToEdit}
//           onAddTag={handleAddTag}
//           onView={handleViewTask}
//           onMove={handleMoveTask}
//           onDelete={handleDeleteTask}
//         />
//       ) : (
//         <div className="text-center py-12 text-gray-500">No tasks.</div>
//       )}

//       {/*   Add Task Dialog */}
//       <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Create a new task</DialogTitle>
//             <DialogDescription>
//               Fill in the details to create a new task.
//             </DialogDescription>
//           </DialogHeader>
//           <TaskForm
//             onSubmit={handleAddTask}
//             onCancel={() => setIsAddingTask(false)}
//           />
//         </DialogContent>
//       </Dialog>

//       {/* ✍️ Edit Task Dialog */}
//       <Dialog open={isEditingTask} onOpenChange={setIsEditingTask}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Edit Task</DialogTitle>
//             <DialogDescription>Update task details.</DialogDescription>
//           </DialogHeader>
//           <TaskForm
//             task={taskToEdit}
//             onSubmit={handleSaveEdit}
//             onCancel={() => setIsEditingTask(false)}
//           />
//         </DialogContent>
//       </Dialog>

//       {/*   Add Tag Dialog */}
//       <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Add Tag</DialogTitle>
//             <DialogDescription>Add tags to the selected task.</DialogDescription>
//           </DialogHeader>
//           <TagsForm
//             optionTags={tags}
//             task={taskToAddTags}
//             onSubmit={handleSaveEdit}
//             onCancel={() => setIsAddingTag(false)}
//           />
//         </DialogContent>
//       </Dialog>

//       {/*   View Task Dialog */}
//       <Dialog open={isViewingTask} onOpenChange={setIsViewingTask}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Task Details</DialogTitle>
//           </DialogHeader>
//           {taskToView && (
//             <div>
//               <p>
//                 <strong>Name:</strong> {taskToView.task_name}
//               </p>
//               <p>
//                 <strong>Description:</strong> {taskToView.task_desc}
//               </p>
//               <p>
//                 <strong>Status:</strong>{" "}
//                 {taskToView.is_complete ? "Completed" : "Not Completed"}
//               </p>
//               <p className="mb-4">
//                 <strong>Date:</strong> {taskToView.date}
//               </p>
//               <Button onClick={() => setIsViewingTask(false)}>OK</Button>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/*   Move Task Dialog */}
//       <Dialog open={isMovingTask} onOpenChange={setIsMovingTask}>
//         <DialogContent className="w-[95vw] max-w-md mx-auto">
//           <DialogHeader>
//             <DialogTitle>Move Task to Session</DialogTitle>
//             <DialogDescription>Select a session to move this task.</DialogDescription>
//           </DialogHeader>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {["dws1", "dws2", "dws3", "rws"].map((sessionId) => (
//               <Button
//                 key={sessionId}
//                 variant={lockStatus[sessionId] ? "disabled" : "outline"}
//                 onClick={() =>
//                   !lockStatus[sessionId] && handleMoveTaskConfirm(sessionId)
//                 }
//                 className="w-full"
//               >
//                 {sessionId === "dws1" && "Deep Work Session 1"}
//                 {sessionId === "dws2" && "Deep Work Session 2"}
//                 {sessionId === "dws3" && "Deep Work Session 3"}
//                 {sessionId === "rws" && "Remote Session"}
//               </Button>
//             ))}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// export default Tasks;

// import { useState, useEffect } from "react";
// import ProjectNavBar from "@/components/layout/ProjectNavBar";
// import TaskForm from "../components/features/tasks/TaskForm";
// import TaskList from "../components/features/tasks/TaskList";
// import TagsForm from "@/components/features/tasks/TagsForm";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { useSessionLock } from "@/hooks/useSessionLock";
// import { v4 as uuidv4 } from "uuid";
// import axios from "axios";
// import { toast } from "sonner";

// //   Helper function to validate date
// const isValidDate = (date) => date && !isNaN(new Date(date).getTime());

// function Tasks() {
//   const [tasks, setTasks] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState(
//     localStorage.getItem("selectedProjectId") || null
//   );

//   const [isAddingTask, setIsAddingTask] = useState(false);
//   const [isEditingTask, setIsEditingTask] = useState(false);
//   const [taskToEdit, setTaskToEdit] = useState(null);
//   const [isViewingTask, setIsViewingTask] = useState(false);
//   const [taskToView, setTaskToView] = useState(null);
//   const [isMovingTask, setIsMovingTask] = useState(false);
//   const [taskToMove, setTaskToMove] = useState(null);
//   const [tags, setTags] = useState([]);
//   const [isAddingTag, setIsAddingTag] = useState(false);
//   const [taskToAddTags, setTaskToAddTags] = useState(null);

//   const lockStatus = useSessionLock();

//   const refreshTasks = async () => {
//     if (!selectedProjectId) return toast.error("Select a project.");
  
//     try {
//       await fetchTasks(selectedProjectId); // Reuse existing fetchTasks logic
//     } catch (error) {
//       console.error("Error refreshing tasks:", error);
//       toast.error("Failed to refresh tasks.");
//     }
//   };

//   //   Fetch tasks for the selected project with user from localStorage
//   const fetchTasks = async (projectId) => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (!user) {
//       toast.error("User not found. Please log in again.");
//       return;
//     }

//     if (!projectId) {
//       toast.error("Select a project to load tasks.");
//       return;
//     }

//     try {
//       const { data } = await axios.get(`http://localhost:3000/apis/tasks`, {
//         params: { userId: user.user_id, projectId },
//       });

//       const formattedTasks = data.map((task) => ({
//         ...task,
//         date: isValidDate(task.date)
//           ? new Date(task.date).toISOString().split("T")[0]
//           : null,
//       }));

//       setTasks(formattedTasks);
//       setTags([...new Set(data.flatMap((task) => task.task_tags).filter(Boolean))]);
//     } catch (error) {
//       console.error("Error fetching tasks:", error);
//       toast.error("Failed to fetch tasks.");
//     }
//   };

//   //   Fetch tasks on project selection
//   useEffect(() => {
//     if (selectedProjectId) {
//       localStorage.setItem("selectedProjectId", selectedProjectId);
//       fetchTasks(selectedProjectId);
//     }
//   }, [selectedProjectId]);


  
//   //   Add new task
//   const handleAddTask = async (newTask) => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (!user || !selectedProjectId) {
//       toast.error("User or project not found.");
//       return;
//     }

//     const taskData = {
//       task_id: uuidv4(),
//       ...newTask,
//       user_id: user.user_id,
//       project_id: selectedProjectId,
//     };

//     try {
//       const { data } = await axios.post(`http://localhost:3000/apis/tasks`, taskData);
//       await refreshTasks();
//       setTasks((prev) => [data, ...prev]);
//       setIsAddingTask(false);
//       toast.success("Task added successfully.");
//     } catch (error) {
//       console.error("Error adding task:", error);
//       toast.error("Failed to add task.");
//     }
//   };

//   // ✍️ Save edited task
//   // const handleSaveEdit = async (updatedTask) => {
//   //   try {
//   //     const { data } = await axios.put(
//   //       `http://localhost:3000/apis/tasks/${updatedTask.task_id}`,
//   //       updatedTask
//   //     );

//   //     setTasks((prev) =>
//   //       prev.map((task) => (task.task_id === updatedTask.task_id ? data : task))
//   //     );
//   //     setIsEditingTask(false);
//   //     toast.success("Task updated successfully.");
//   //   } catch (error) {
//   //     console.error("Error updating task:", error);
//   //     toast.error("Failed to update task.");
//   //   }
//   // };
//   const handleSaveEdit = async (updatedTask) => {
//     try {
//       await axios.put(
//         `http://localhost:3000/apis/tasks/${updatedTask.task_id}`,
//         { ...updatedTask, task_tags: updatedTask.task_tags ?? [] }
//       );
  
//       await refreshTasks(); // Refresh after editing
//       setIsEditingTask(false);
//       setIsAddingTag(false);
//       toast.success("Task updated.");
//     } catch (error) {
//       console.error("Error updating task:", error);
//       toast.error("Failed to update task.");
//     }
//   };

//   //   Handle adding tags
//   const handleAddTag = (task) => {
//     setTaskToAddTags(task);
//     setIsAddingTag(true);
//   };

//   // //   Delete task
//   // const handleDeleteTask = async (taskId) => {
//   //   try {
//   //     await axios.delete(`http://localhost:3000/apis/tasks/${task.task_id}`);
//   //     setTasks((prev) => prev.filter((task) => task.task_id !== taskId));
//   //     toast.success("Task deleted successfully.");
//   //   } catch (error) {
//   //     console.error("Error deleting task:", error);
//   //     toast.error("Failed to delete task.");
//   //   }
//   // };
//   const handleDeleteTask = async (task) => {
//     if (!task?.task_id) return toast.error("Invalid Task ID");
  
//     try {
//       await axios.delete(`http://localhost:3000/apis/tasks/${task.task_id}`);
//       setTasks((prev) => prev.filter((t) => t.task_id !== task.task_id));
//       toast.success("Task deleted");
//     } catch (error) {
//       toast.error("Failed to delete task");
//       console.error("Error deleting task:", error);
//     }
//   };

//   //   Add tags to task
//   // const handleAddTag = (task) => {
//   //   setTaskToAddTags(task);
//   //   setIsAddingTag(true);
//   // };

//   //   View task details
//   const handleViewTask = (task) => {
//     setTaskToView(task);
//     setIsViewingTask(true);
//   };

//   //   Move task to a session
//   const handleMoveTask = (task) => {
//     setTaskToMove(task);
//     setIsMovingTask(true);
//   };

//   // const handleMoveTaskConfirm = async (sessionId) => {
//   //   const updatedTask = { ...taskToMove, coming_from: sessionId };

//   //   try {
//   //     await axios.put(
//   //       `http://localhost:3000/apis/tasks/${taskToMove.task_id}`,
//   //       updatedTask
//   //     );

//   //     setTasks((prev) =>
//   //       prev.map((task) => (task.task_id === taskToMove.task_id ? updatedTask : task))
//   //     );
//   //     setIsMovingTask(false);
//   //     toast.success("Task moved successfully.");
//   //   } catch (error) {
//   //     console.error("Error moving task:", error);
//   //     toast.error("Failed to move task.");
//   //   }
//   // };
//   const handleMoveTaskConfirm = async (sessionId) => {
//     if (!taskToMove?.task_id) return toast.error("Invalid Task.");
  
//     const updatedTask = { ...taskToMove, coming_from: sessionId };
  
//     try {
//       await axios.put(
//         `http://localhost:3000/apis/tasks/${taskToMove.task_id}`,
//         updatedTask
//       );
  
//       await refreshTasks(); // Refresh after move
//       setIsMovingTask(false);
//       toast.success("Task moved.");
//     } catch (error) {
//       console.error("Error moving task:", error);
//       toast.error("Failed to move task.");
//     }
//   };
  

//   const filteredTasks = tasks.filter((task) => !task.is_complete);

//   return (
//     <div className="container mx-auto max-w-4xl">
//       {/*   Project Navigation */}
//       <ProjectNavBar
//         userId={JSON.parse(localStorage.getItem("user")).user_id}
//         selectedProjectId={selectedProjectId}
//         onSelectProject={setSelectedProjectId}
//       />

//       {/*   Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Tasks</h1>
//         {!isAddingTask && (
//           <Button onClick={() => setIsAddingTask(true)}>Add Task</Button>
//         )}
//       </div>

//       {/*   Task List */}
//       {filteredTasks.length ? (
//         <TaskList
//           tasks={filteredTasks}
//           onEdit={(task) => {
//             setTaskToEdit(task);
//             setIsEditingTask(true);
//           }}
//           onAddTag={handleAddTag}
//           onView={handleViewTask}
//           onMove={handleMoveTask}
//           onDelete={handleDeleteTask}
//         />
//       ) : (
//         <div className="text-center py-12 text-gray-500">No tasks available.</div>
//       )}

//       {/*   Add Task Dialog */}
//       <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Create a new task</DialogTitle>
//             <DialogDescription>
//               Fill in the details to create a new task.
//             </DialogDescription>
//           </DialogHeader>
//           <TaskForm
//             onSubmit={handleAddTask}
//             onCancel={() => setIsAddingTask(false)}
//           />
//         </DialogContent>
//       </Dialog>

//       {/* ✍️ Edit Task Dialog */}
//       <Dialog open={isEditingTask} onOpenChange={setIsEditingTask}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Edit Task</DialogTitle>
//             <DialogDescription>Update task details.</DialogDescription>
//           </DialogHeader>
//           <TaskForm
//             task={taskToEdit}
//             onSubmit={handleSaveEdit}
//             onCancel={() => setIsEditingTask(false)}
//           />
//         </DialogContent>
//       </Dialog>

//       {/*   Add Tag Dialog */}
//       <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Add Tag</DialogTitle>
//             <DialogDescription>Add tags to the selected task.</DialogDescription>
//           </DialogHeader>
//           <TagsForm
//             optionTags={tags}
//             task={taskToAddTags}
//             onSubmit={handleSaveEdit}
//             onCancel={() => setIsAddingTag(false)}
//           />
//         </DialogContent>
//       </Dialog>

//       {/*   View Task Dialog */}
//       <Dialog open={isViewingTask} onOpenChange={setIsViewingTask}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Task Details</DialogTitle>
//           </DialogHeader>
//           {taskToView && (
//             <div>
//               <p><strong>Name:</strong> {taskToView.task_name}</p>
//               <p><strong>Description:</strong> {taskToView.task_desc}</p>
//               <p><strong>Status:</strong> {taskToView.is_complete ? "Completed" : "Not Completed"}</p>
//               <p className="mb-4">
//                 <strong>Date:</strong> {taskToView.date || "No Date"}
//               </p>
//               <Button onClick={() => setIsViewingTask(false)}>OK</Button>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/*   Move Task Dialog */}
//       {/* <Dialog open={isMovingTask} onOpenChange={setIsMovingTask}>
//         <DialogContent className="w-[95vw] max-w-md mx-auto">
//           <DialogHeader>
//             <DialogTitle>Move Task to Session</DialogTitle>
//             <DialogDescription>Select a session to move this task.</DialogDescription>
//           </DialogHeader>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {["dws1", "dws2", "dws3", "rws"].map((sessionId) => (
//               <Button
//                 key={sessionId}
//                 variant={lockStatus[sessionId] ? "disabled" : "outline"}
//                 onClick={() =>
//                   !lockStatus[sessionId] && handleMoveTaskConfirm(sessionId)
//                 }
//                 className="w-full"
//               >
//                 {sessionId === "dws1" && "Deep Work Session 1"}
//                 {sessionId === "dws2" && "Deep Work Session 2"}
//                 {sessionId === "dws3" && "Deep Work Session 3"}
//                 {sessionId === "rws" && "Remote Session"}
//               </Button>
//             ))}
//           </div>
//         </DialogContent>
//       </Dialog> */}
//       {/*   Move Task Dialog */}
//       <Dialog open={isMovingTask} onOpenChange={setIsMovingTask}>
//         <DialogContent className="w-[95vw] max-w-md mx-auto">
//           <DialogHeader>
//             <DialogTitle>Move Task to Session</DialogTitle>
//             <DialogDescription>Select a session to move this task.</DialogDescription>
//           </DialogHeader>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {["dws1", "dws2", "dws3", "rws"].map((sessionId) => (
//               <Button
//                 key={sessionId}
//                 variant={lockStatus[sessionId] ? "disabled" : "outline"}
//                 onClick={() => !lockStatus[sessionId] && handleMoveTaskConfirm(sessionId)}
//                 className="w-full"
//               >
//                 {sessionId === "dws1" && "Deep Work Session 1"}
//                 {sessionId === "dws2" && "Deep Work Session 2"}
//                 {sessionId === "dws3" && "Deep Work Session 3"}
//                 {sessionId === "rws" && "Remote Session"}
//               </Button>
//             ))}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// export default Tasks;

import { useState, useEffect } from "react";
import ProjectNavBar from "@/components/layout/ProjectNavBar";
import TaskForm from "../components/features/tasks/TaskForm";
import TaskList from "../components/features/tasks/TaskList";
import TagsForm from "@/components/features/tasks/TagsForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSessionLock } from "@/hooks/useSessionLock";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { toast } from "sonner";

//   Validate date
const isValidDate = (date) => date && !isNaN(new Date(date).getTime());

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(localStorage.getItem("selectedProjectId") || null);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isViewingTask, setIsViewingTask] = useState(false);
  const [taskToView, setTaskToView] = useState(null);
  const [isMovingTask, setIsMovingTask] = useState(false);
  const [taskToMove, setTaskToMove] = useState(null);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [taskToAddTags, setTaskToAddTags] = useState(null);

  const lockStatus = useSessionLock();

  //  Fetch tasks
  const fetchTasks = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !selectedProjectId) return toast.error("User or project not found.");

    try {
      const { data } = await axios.get(`http://localhost:3000/apis/tasks`, {
        params: { userId: user.user_id, projectId: selectedProjectId },
      });

      const formattedTasks = data.map((task) => ({
        ...task,
        date: isValidDate(task.date) ? new Date(task.date).toISOString().split("T")[0] : null,
      }));

      setTasks(formattedTasks);
      setTags([...new Set(data.flatMap((task) => task.task_tags || []))]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks.");
    }
  };

  //  Refresh tasks
  const refreshTasks = async () => {
    if (!selectedProjectId) return toast.error("Select a project.");
    await fetchTasks();
  };

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem("selectedProjectId", selectedProjectId);
      fetchTasks();
    }
  }, [selectedProjectId]);

  //  Add task
  const handleAddTask = async (newTask) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !selectedProjectId) return toast.error("User or project not found.");

    const taskData = { task_id: uuidv4(), ...newTask, user_id: user.user_id, project_id: selectedProjectId };

    try {
      await axios.post(`http://localhost:3000/apis/tasks`, taskData);
      await refreshTasks();
      setIsAddingTask(false);
      toast.success("Task added.");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task.");
    }
  };

  // // ✏️ Save edit or tag changes
  // const handleSaveEdit = async (updatedTask) => {
  //   try {
  //     await axios.put(`http://localhost:3000/apis/tasks/${updatedTask.task_id}`, {
  //       ...updatedTask,
  //       task_tags: updatedTask.task_tags ?? [],
  //     });

  //     await refreshTasks();
  //     setIsEditingTask(false);
  //     setIsAddingTag(false);
  //     toast.success("Task updated.");
  //   } catch (error) {
  //     console.error("Error updating task:", error);
  //     toast.error("Failed to update task.");
  //   }
  // };

  //   Save edited task (including tags & session moves)
const handleSaveEdit = async (updatedTask) => {
  const payload = {
    ...updatedTask,
    task_tags: updatedTask.task_tags ?? [],
    moved_to: updatedTask.moved_to ?? null,
    coming_from: updatedTask.coming_from ?? null,
  };

  try {
    const { data } = await axios.put(
      `http://localhost:3000/apis/tasks/${updatedTask.task_id}`,
      payload
    );

    setTasks((prev) =>
      prev.map((task) => (task.task_id === data.task_id ? data : task))
    );

    setIsEditingTask(false);
    toast.success("Task updated successfully.");
  } catch (err) {
    console.error("Error updating task:", err);
    toast.error("Failed to update task.");
  }
};


  //  Delete task
  const handleDeleteTask = async (task) => {
    if (!task?.task_id) return toast.error("Invalid Task ID");

    try {
      await axios.delete(`http://localhost:3000/apis/tasks/${task.task_id}`);
      await refreshTasks();
      toast.success("Task deleted.");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    }
  };

  //  Move task to session
  // const handleMoveTaskConfirm = async (sessionId) => {
  //   if (!taskToMove?.task_id) return toast.error("Invalid Task.");

  //   try {
  //     await axios.put(`http://localhost:3000/apis/tasks/${taskToMove.task_id}`, {
  //       ...taskToMove,
  //       coming_from: sessionId,
  //     });

  //     await refreshTasks();
  //     setIsMovingTask(false);
  //     toast.success("Task moved.");
  //   } catch (error) {
  //     console.error("Error moving task:", error);
  //     toast.error("Failed to move task.");
  //   }
  // };

  const handleMoveTaskConfirm = async (sessionId) => {
    const updatedTask = {
      ...taskToMove,
      coming_from: taskToMove.coming_from ?? "current-tasks",
      moved_to: sessionId,
    };
  
    try {
      const { data } = await axios.put(
        `http://localhost:3000/apis/tasks/${taskToMove.task_id}`,
        updatedTask
      );
  
      console.log("API Response Data:", data); // Debug log
  
      setTasks((prev) =>
        [...prev.filter((task) => task.task_id !== data.task_id), data]
      );
  
      await refreshTasks();  // Optional but recommended
      setIsMovingTask(false);
      toast.success("Task moved.");
    } catch (err) {
      console.error("Move error:", err);
      toast.error("Failed to move task.");
    }
  };
  
  

  // Handlers for dialogs
  const handleViewTask = (task) => {
    setTaskToView(task);
    setIsViewingTask(true);
  };

  const handleAddTag = (task) => {
    setTaskToAddTags(task);
    setIsAddingTag(true);
  };

  const filteredTasks = tasks.filter((task) => !task.is_complete);

  return (
    <div className="container mx-auto max-w-4xl">
  {/*  Project Navigation */}
  <ProjectNavBar
    userId={JSON.parse(localStorage.getItem("user")).user_id}
    selectedProjectId={selectedProjectId}
    onSelectProject={setSelectedProjectId}
  />

  {/*  Header */}
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold">Tasks</h1>
    <Button onClick={() => setIsAddingTask(true)}>Add Task</Button>
  </div>

  {/*  Task List */}
  {filteredTasks.length ? (
    <TaskList
      tasks={filteredTasks}
      onEdit={(task) => {
        setTaskToEdit(task);
        setIsEditingTask(true);
      }}
      onAddTag={handleAddTag}
      onView={handleViewTask}
      onMove={(task) => {
        setTaskToMove(task);
        setIsMovingTask(true);
      }}
      onDelete={handleDeleteTask}
    />
  ) : (
    <div className="text-center py-12 text-gray-500">No tasks available.</div>
  )}

  {/* Add Task Dialog */}
  <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Create a new task</DialogTitle>
        <DialogDescription>Fill in the details to create a new task.</DialogDescription>
      </DialogHeader>
      <TaskForm onSubmit={handleAddTask} onCancel={() => setIsAddingTask(false)} />
    </DialogContent>
  </Dialog>

  {/* ✏️ Edit Task Dialog */}
  <Dialog open={isEditingTask} onOpenChange={setIsEditingTask}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogDescription>Update task details.</DialogDescription>
      </DialogHeader>
      <TaskForm task={taskToEdit} onSubmit={handleSaveEdit} onCancel={() => setIsEditingTask(false)} />
    </DialogContent>
  </Dialog>

  {/*  Add Tag Dialog */}
  <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Add Tag</DialogTitle>
        <DialogDescription>Add tags to the selected task.</DialogDescription>
      </DialogHeader>
      <TagsForm optionTags={tags} task={taskToAddTags} onSubmit={handleSaveEdit} onCancel={() => setIsAddingTag(false)} />
    </DialogContent>
  </Dialog>

  {/*  View Task Dialog */}
  <Dialog open={isViewingTask} onOpenChange={setIsViewingTask}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Task Details</DialogTitle>
      </DialogHeader>
      {taskToView && (
        <div>
          <p><strong>Name:</strong> {taskToView.task_name}</p>
          <p><strong>Description:</strong> {taskToView.task_desc}</p>
          <p><strong>Status:</strong> {taskToView.is_complete ? "Completed" : "Not Completed"}</p>
          <p><strong>Date:</strong> {taskToView.date || "No Date"}</p>
          <Button onClick={() => setIsViewingTask(false)}>OK</Button>
        </div>
      )}
    </DialogContent>
  </Dialog>

  {/*  Move Task Dialog */}
  <Dialog open={isMovingTask} onOpenChange={setIsMovingTask}>
    <DialogContent className="w-[95vw] max-w-md mx-auto">
      <DialogHeader>
        <DialogTitle>Move Task to Session</DialogTitle>
        <DialogDescription>Select a session to move this task.</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {["dws1", "dws2", "dws3", "rws"].map((sessionId) => (
          <Button
            key={sessionId}
            variant={lockStatus[sessionId] ? "disabled" : "outline"}
            onClick={() => !lockStatus[sessionId] && handleMoveTaskConfirm(sessionId)}
            className="w-full"
          >
            {sessionId === "dws1" && "Deep Work Session 1"}
            {sessionId === "dws2" && "Deep Work Session 2"}
            {sessionId === "dws3" && "Deep Work Session 3"}
            {sessionId === "rws" && "Remote Session"}
          </Button>
        ))}
      </div>
    </DialogContent>
  </Dialog>
</div>

  );
}

export default Tasks;
