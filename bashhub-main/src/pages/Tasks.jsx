import React, { useState, useEffect } from 'react';
import TaskForm from '../components/features/tasks/TaskForm';
import TaskList from '../components/features/tasks/TaskList';
import { Button } from '@/components/ui/button';
import { useSessionLock } from '@/hooks/useSessionLock';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { isSameDay } from '@/lib/utils';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isViewingTask, setIsViewingTask] = useState(false);
  const [taskToView, setTaskToView] = useState(null);
  const [isMovingTask, setIsMovingTask] = useState(false);
  const [taskToMove, setTaskToMove] = useState(null);
  const lockStatus = useSessionLock();

  // Load tasks from the database on component mount
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
        if (!user) throw new Error('User not found in local storage');
      fetchTasks(user.user_id);
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  }, []);

  // Fetch all tasks from the database
  // const fetchTasks = async (userId) => {
  //   try {
  //     // const response = await axios.get('https://server-bashboard.vercel.app/apis/tasks',{userId: userId});
  //     const response = await axios.get('http://localhost:3000/apis/tasks',{userId: userId});
  //     console.log(response.data)
  //     setTasks(response.data);
  //   } catch (error) {
  //     console.error('Error fetching tasks:', error);
  //   }
  // };

  const fetchTasks = async (userId) => {
    try {
      const response = await axios.get(`https://server-bashboard.vercel.app/apis/tasks?userId=${userId}`);
      // const response = await axios.get(`http://localhost:3000/apis/tasks?userId=${userId}`);
      console.log(response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Add a new task to the database
  const handleAddTask = async (newTask) => {
    try {
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('User not found in local storage');
      const taskData = {
        task_id: uuidv4(),
        task_name: newTask.task_name,
        // task_description: newTask.task_description,
        task_time: localDate,
        // task_time: "2025-02-02 08:30:15.26",
        // task_level: newTask.task_level,
        coming_from: 'current-tasks',
        moved_to: '',
        is_in_progress: false,
        is_complete: false,
        user_id: user.user_id,
        // user_id: "7ebd7234-6bc0-4a26-a334-484d110f13d0",
      };
      await axios.post('https://server-bashboard.vercel.app/apis/tasks', taskData);
      // await axios.post('http://localhost:3000/apis/tasks', taskData);
      setIsAddingTask(false);
      fetchTasks(user.user_id);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Edit a task
  const handleEditTask = async (task) => {
    setIsEditingTask(true);
    setTaskToEdit(task);
  };

  // Save edited task
  const handleSaveEdit = async (updatedTask) => {
    console.log(updatedTask);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('User not found in local storage');
      await axios.put(
        `https://server-bashboard.vercel.app/apis/tasks/${updatedTask.task_id}`,
        // `http://localhost:3000/apis/tasks/${updatedTask.task_id}`,
        updatedTask
      );
      setIsEditingTask(false); // Close the edit dialog
      fetchTasks(user.user_id); // Refresh the task list
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Delete a task from the database
  const handleDeleteTask = async (task) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('User not found in local storage');
      await axios.delete(`https://server-bashboard.vercel.app/apis/tasks/${task.task_id}`);
      // await axios.delete(`http://localhost:3000/apis/tasks/${task.task_id}`);
      fetchTasks(user.user_id);
    } catch (error) {
      console.error('Error deleting task:', error);
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
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('User not found in local storage');
      const updatedTask = {
        ...taskToMove,
        coming_from: sessionId,
        task_time: new Date().toISOString() // Set to today's date when moving
      };
      await axios.put(
        `https://server-bashboard.vercel.app/apis/tasks/${taskToMove.task_id}`,
        // `http://localhost:3000/apis/tasks/${taskToMove.task_id}`,
        updatedTask
      );
      setIsMovingTask(false); // Close the move dialog
      fetchTasks(user.user_id); // Refresh the task list
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  // Add function to separate today's tasks
  const separateTasks = (tasks) => {
    // console.log("enterd separateTasks");
    // console.log(tasks);
    const today = new Date();
    return {
      todayTasks: tasks.filter(task => isSameDay(new Date(task.task_time), today) && !task.is_complete && task.coming_from == "current-tasks"),
      olderTasks: tasks.filter(task => !isSameDay(new Date(task.task_time), today) && !task.is_complete && task.coming_from == "current-tasks")
    };
  };

  // Separate tasks before rendering
  const { todayTasks, olderTasks } = separateTasks(tasks);

  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        {!isAddingTask && (
          <Button onClick={() => setIsAddingTask(true)}>Add Task</Button>
        )}
      </div>

      {/* Today's Tasks */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Today's Tasks</h2>
        <TaskList
          tasks={todayTasks}
          onEdit={handleEditTask}
          onView={handleViewTask}
          onMove={handleMoveTask}
          onDelete={handleDeleteTask}
        />
      </div>

      {/* Previous Tasks */}
      {olderTasks.length > 0 && (
        <div className="mt-8 pt-8 border-t-2 border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Previous Tasks</h2>
          <TaskList
            tasks={olderTasks}
            onEdit={handleEditTask}
            onView={handleViewTask}
            onMove={handleMoveTask}
            onDelete={handleDeleteTask}
          />
        </div>
      )}

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
              <p className="mb-4"><strong>Status:</strong> {taskToView.is_complete ? 'Completed' : 'Not Completed'}</p>
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
            {['dws1', 'dws2', 'dws3', 'rws'].map((sessionId) => {
              if(!lockStatus[sessionId]){
                return <Button
                key={sessionId}
                variant="outline"
                onClick={() => handleMoveTaskConfirm(sessionId)}
                className="w-full"
              >
                {sessionId === 'dws1' && 'Deep Work Session 1'}
                {sessionId === 'dws2' && 'Deep Work Session 2'}
                {sessionId === 'dws3' && 'Deep Work Session 3'}
                {sessionId === 'rws' && 'Remote Session'}
              </Button>
              }
              return <Button
                key={sessionId}
                variant="disabled"
                onClick={()=>{}}
                className="w-full"
              >
                {sessionId === 'dws1' && 'Deep Work Session 1'}
                {sessionId === 'dws2' && 'Deep Work Session 2'}
                {sessionId === 'dws3' && 'Deep Work Session 3'}
                {sessionId === 'rws' && 'Remote Session'}
              </Button>
})}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Tasks;