import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SessionCard from '../components/features/objectives/SessionCard';
import SessionTasksList from '../components/features/objectives/SessionTasksList';
// import TaskForm from '../components/features/objectives/TaskForm';
import TaskForm from '../components/features/tasks/TaskForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTaskAutoMove } from '@/hooks/useTaskAutoMove';
import { isTaskFromToday, isSameDay } from '@/lib/utils';
import { useSessionLock } from '@/hooks/useSessionLock';

function Objectives() {
  const [activeTab, setActiveTab] = useState('current-tasks');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isViewingTask, setIsViewingTask] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToView, setTaskToView] = useState(null);
  const lockStatus = useSessionLock();

  const sessions = [
    { id: 'current-tasks', title: 'Current Task' },
    { id: 'dws1', title: 'Deep Work Session 1' },
    { id: 'dws2', title: 'Deep Work Session 2' },
    { id: 'dws3', title: 'Deep Work Session 3' },
    { id: 'rws', title: 'Remote Session' },
  ];

  // Fetch all tasks when the component mounts
  useEffect(() => {
    try{
    const user = JSON.parse(localStorage.getItem('user'));
        if (!user) throw new Error('User not found in local storage');
      fetchTasks(user.user_id);
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  }, []);

  // const fetchTasks = async (userId) => {
  //   try {
  //     // const response = await axios.get('https://server-bashboard.vercel.app/apis/tasks');
  //     const response = await axios.get('http://localhost:3000/apis/tasks',{userId});
  //     const fetchedTasks = response.data;
  //     console.log("fetchedTasks");
  //     console.log(fetchedTasks);
  //     // Add a fallback `task_id` if not provided by the backend
  //     const tasksWithIds = fetchedTasks.map((task) => ({
  //       ...task,
  //       task_id: task.task_id || crypto.randomUUID(),
  //     }));

  //     console.log("tasksWithIds");
  //     console.log(tasksWithIds);

  //     setTasks(tasksWithIds);
  //   } catch (error) {
  //     console.error('Error fetching tasks:', error);
  //   }
  // };

  const fetchTasks = async (userId) => {
    try {
      const response = await axios.get(`https://server-bashboard.vercel.app/apis/tasks?userId=${userId}`);
      // const response = await axios.get(`http://localhost:3000/apis/tasks?userId=${userId}`);
      console.log(response.data);
      const fetchedTasks = response.data;
      const tasksWithIds = fetchedTasks.map((task) => ({
        ...task,
        task_id: task.task_id || crypto.randomUUID(),
      }));

      setTasks(tasksWithIds);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Add a new task
  const handleAddTask = async (newTask) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('User not found in local storage');
      const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const taskData = {
        task_id: crypto.randomUUID(), // Ensure a unique ID is generated
        task_name: newTask.task_name,
        task_time: localDate, // Ensure we use current date
        coming_from: selectedSessionId,
        moved_to: '',
        is_in_progress: false,
        is_complete: false,
        user_id: user.user_id,
        // user_id: "7ebd7234-6bc0-4a26-a334-484d110f13d0",
      };
      // await axios.post('https://server-bashboard.vercel.app/apis/tasks', taskData);
      await axios.post('http://localhost:3000/apis/tasks', taskData);
      setIsAddingTask(false);
      fetchTasks(user.user_id); // Refresh the task list
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Mark a task as complete
  const handleMarkComplete = async (task) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('User not found in local storage');
      const updatedTask = {
        ...task,
        is_complete: true,
        is_in_progress: false, // Reset in-progress state when completing task
        task_id: task.task_id,
        task_name: task.task_name,
        task_time: task.task_time,
        coming_from: task.coming_from,
        moved_to: task.moved_to,
        user_id: task.user_id
      };
      // await axios.put(`https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`, updatedTask);
      await axios.put(`http://localhost:3000/apis/tasks/${task.task_id}`, updatedTask);
      fetchTasks(user.user_id); // Refresh the task list
    } catch (error) {
      console.error('Error marking task as complete:', error);
    }
  };

  // Add new handler for marking task as uncomplete
  const handleMarkUncomplete = async (task) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('User not found in local storage');
      const updatedTask = {
        ...task,
        is_complete: false,
        task_id: task.task_id,
        task_name: task.task_name,
        task_time: task.task_time,
        coming_from: task.coming_from,
        moved_to: task.moved_to,
        is_in_progress: task.is_in_progress,
        user_id: task.user_id
      };
      // await axios.put(`https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`, updatedTask);
      await axios.put(`http://localhost:3000/apis/tasks/${task.task_id}`, updatedTask);
      fetchTasks(user.user_id);
    } catch (error) {
      console.error('Error marking task as uncomplete:', error);
    }
  };

  // Edit a task
  const handleEditTask = (task) => {
    console.log('Editing Task:', task); // Debugging: Check if the task includes task_id
    setTaskToEdit(task); // Set the full task object, including task_id
    setIsEditingTask(true);
  };

  // Save edited task
  const handleSaveEdit = async (updatedTaskData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('User not found in local storage');
      const updatedTask = {
        ...taskToEdit, // Spread all existing task properties
        ...updatedTaskData, // Override with new values
        task_id: taskToEdit.task_id,
        task_time: taskToEdit.task_time,
        coming_from: taskToEdit.coming_from,
        moved_to: taskToEdit.moved_to,
        is_in_progress: taskToEdit.is_in_progress,
        is_complete: taskToEdit.is_complete,
        user_id: taskToEdit.user_id
      };
      // await axios.put(`https://server-bashboard.vercel.app/apis/tasks/${updatedTask.task_id}`, updatedTask);
      await axios.put(`http://localhost:3000/apis/tasks/${updatedTask.task_id}`, updatedTask);
      setIsEditingTask(false);
      fetchTasks(user.user_id);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Delete a task
  const handleDeleteTask = async (task) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('User not found in local storage');
      // await axios.delete(`https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`);
      await axios.delete(`http://localhost:3000/apis/tasks/${task.task_id}`);
      fetchTasks(user.user_id); // Refresh the task list
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // View a task
  const handleViewTask = (task) => {
    setTaskToView(task);
    setIsViewingTask(true);
  };

  // Add new function to handle task movement
  const handleTaskMove = async (taskId, targetSession) => {
    // if(targetSession)
    const newTasks = tasks.map(t => {
      if(t.task_id !== taskId) return t
      return {
        ...t,
        coming_from: targetSession,
        task_time: t.task_time
      }
    })
    setTasks(newTasks);
    const task = tasks.find(t => t.task_id === taskId);
    if (!task) return;
    console.log(task.task_time);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('User not found in local storage');
      const updatedTask = {
        ...task,
        coming_from: targetSession,
        task_time: task.task_time
      };
      console.log(updatedTask.task_time);
      // await axios.put(`https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`, updatedTask);
      await axios.put(`http://localhost:3000/apis/tasks/${task.task_id}`, updatedTask);
      fetchTasks(user.user_id);
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  // Add new handler function after handleTaskMove
  const handleSetInProgress = async (task) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('User not found in local storage');
      const updatedTask = {
        ...task,
        is_in_progress: true
      };
      // await axios.put(`https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`, updatedTask);
      await axios.put(`http://localhost:3000/apis/tasks/${task.task_id}`, updatedTask);
      fetchTasks(user.user_id);
    } catch (error) {
      console.error('Error setting task in progress:', error);
    }
  };

  const handleTasksUpdated = (updatedTasks) => {
    setTasks(updatedTasks); // Update the tasks state
  };

  // Add the auto-move hook
  useTaskAutoMove(tasks, ()=>{
    try{
      const user = JSON.parse(localStorage.getItem('user'));
          if (!user) throw new Error('User not found in local storage');
        fetchTasks(user.user_id);
      } catch (error) {
        console.error('Error Moving task:', error);
      }
  });

  // Modify the task filtering to only show today's tasks
  // const filterTodaysTasks = (sessionId) => {
  //   console.log("Enterd filterTodaysTasks");
  //   console.log(tasks);
    
  //   const today = new Date();
  //   return tasks.filter(task => {
  //     const taskDate = new Date(task.task_time);
  //     return task.coming_from === sessionId && 
  //            isSameDay(taskDate, today);
  //   });
  // };

  const filterTodaysTasks = (sessionId) => {
    console.log("Enterd filterTodaysTasks");
    console.log(tasks);
    
    return tasks.filter(task => {
      return task.coming_from === sessionId
    });
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
                  <TabsTrigger key={session.id} value={session.id} className="whitespace-nowrap">
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
                  tasks={filterTodaysTasks(session.id)}
                  onAddTask={(sessionId) => {
                    setSelectedSessionId(sessionId);
                    setIsAddingTask(true);
                  }}
                  onTaskMove={handleTaskMove}
                  handleTasksUpdated={handleTasksUpdated}
                >
                  <SessionTasksList
                    tasks={filterTodaysTasks(session.id)}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={handleEditTask}
                    onViewTask={handleViewTask}
                    onMarkComplete={handleMarkComplete}
                    onSetInProgress={handleSetInProgress}
                    onMarkUncomplete={handleMarkUncomplete}
                    showCompleteButton={session.id !== 'current-tasks'} // Disable for current-tasks
                    showInProgressOption={session.id !== 'current-tasks'}
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
              tasks={filterTodaysTasks(session.id)}
              className="min-w-[400px] max-w-[400px]"
              onAddTask={(sessionId) => {
                setSelectedSessionId(sessionId);
                setIsAddingTask(true);
              }}
              onTaskMove={handleTaskMove}
              handleTasksUpdated={handleTasksUpdated}
            >
              <SessionTasksList
                tasks={filterTodaysTasks(session.id)}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                onViewTask={handleViewTask}
                onMarkComplete={handleMarkComplete}
                onSetInProgress={handleSetInProgress}
                onMarkUncomplete={handleMarkUncomplete}
                showCompleteButton={session.id !== 'current-tasks'} // Disable for current-tasks
                showInProgressOption={session.id !== 'current-tasks'}
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
            </DialogHeader>
            {taskToEdit && (
              <TaskForm
                initialData={taskToEdit} // Pass the full task object, including task_id
                onSubmit={handleSaveEdit}
                onCancel={() => setIsEditingTask(false)}
              />
            )}
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
                <p><strong>Name:</strong> {taskToView.task_name}</p>
                {/* <p><strong>Description:</strong> {taskToView.task_description}</p>
                <p><strong>Level:</strong> {taskToView.task_level}</p> */}
                <p><strong>Created At:</strong> {new Date(taskToView.task_time).toLocaleString()}</p>
                <p><strong>Status:</strong> {taskToView.is_complete ? 'Completed' : 'Not Completed'}</p>
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