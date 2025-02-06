import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReportCard from '../components/features/reports/ReportCards';
import { isSameDay } from '@/lib/utils';
import sendReportToSlack from '../services/slackService';
import { toast } from 'sonner';

function Reports() {
  const [tasks, setTasks] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('User not found in local storage');
      fetchTasks(user.user_id);
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  }, []);

  const fetchTasks = async (userId) => {
    console.log("entered fetchTasks");
    let loadingToastId;
    try {
      loadingToastId = toast.loading('Loading Tasks');
      const response = await axios.get(
        `http://localhost:3000/apis/tasks?userId=${userId}`
      );
      const responseData = Array.isArray(response.data) ? response.data : [];
      console.log(responseData);
      toast.dismiss(loadingToastId);
      setTasks(responseData); // Ensure tasks is always an array
      generateReport(responseData); // Generate the report after fetching tasks
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Sorry, try again. Could not load tasks.");
      console.error("Error fetching tasks:", error);
    }
  };

  
  const generateReport = (tasks) => {
    const today = new Date();
    let reportDate = null;
    let reportTasks = null;
  
    console.log("All fetched tasks:", tasks); // Log all tasks
  
    for (let i = 7; i >= 0; i--) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
  
      const tasksForDate = tasks.filter(task =>
        isSameDay(new Date(task.date), checkDate)
      );
  
      console.log(`Tasks for ${checkDate.toISOString().split('T')[0]}:`, tasksForDate); // Log tasks for each date
  
      if (tasksForDate.length > 0 && !reportDate) {
        reportDate = checkDate;
        reportTasks = tasksForDate;
      }
    }
  
    if (!reportDate || !reportTasks) {
      console.warn("No matching tasks found for the past 7 days.");
      return;
    }
  
    // Organize tasks by section
    const organizedTasks = {
      'current-tasks': [],
      'dws1': { completed: [], inProgress: [] },
      'dws2': { completed: [], inProgress: [] },
      'dws3': { completed: [], inProgress: [] },
      'rws': { completed: [], inProgress: [] }
    };
  
    reportTasks.forEach(task => {
      const section = task.coming_from;
      const taskDetails = {
        task_name: task.task_name,
        task_tags: task.task_tags,
        task_desc: task.task_desc,
        date: task.date,
        coming_from: task.coming_from,
        is_in_progress: task.is_in_progress,
        is_complete: task.is_complete
      };
  
      if (section === 'current-tasks') {
        if (task.is_in_progress) {
          organizedTasks['current-tasks'].push(taskDetails);
        }
      } else if (section) {
        if (task.is_complete) {
          organizedTasks[section].completed.push(taskDetails);
        } else if (task.is_in_progress) {
          organizedTasks[section].inProgress.push(taskDetails);
        }
      }
    });
  
    console.log("Organized tasks:", organizedTasks); // Log organized tasks
  
    setReportData({
      date: reportDate.toLocaleDateString('en-GB'),
      sections: {
        'current-tasks': organizedTasks['current-tasks'],
        'dws1': [
          ...organizedTasks.dws1.completed,
          ...organizedTasks.dws1.inProgress
        ],
        'dws2': [
          ...organizedTasks.dws2.completed,
          ...organizedTasks.dws2.inProgress
        ],
        'dws3': [
          ...organizedTasks.dws3.completed,
          ...organizedTasks.dws3.inProgress
        ],
        'rws': [
          ...organizedTasks.rws.completed,
          ...organizedTasks.rws.inProgress
        ]
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Daily Reports</h1>
      <div className="flex flex-col gap-4">
        {reportData ? (
          <>
            <ReportCard data={reportData} />
            <div className="text-sm text-gray-500 mt-2">
              Report generated by: {userEmail}
            </div>
          </>
        ) : (
          <p className="text-gray-500 italic">No tasks available for the report.</p>
        )}
      </div>
    </div>
  );
}

export default Reports;