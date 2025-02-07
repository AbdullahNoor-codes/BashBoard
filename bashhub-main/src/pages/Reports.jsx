import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReportCard from '../components/features/reports/ReportCards';
import { isSameDay } from '@/lib/utils';
import { useSessionLock } from '@/hooks/useSessionLock';
import { toast } from 'sonner';

function Reports() {
  const [reportData, setReportData] = useState(null);
  const lockStatus = useSessionLock();

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
      generateReport(responseData); 
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

    console.log("All fetched tasks:", tasks);
      const tasksForDate = tasks.filter(task =>
        isSameDay(new Date(task.date), today)
      );


      if (tasksForDate.length > 0 && !reportDate) {
        reportDate = today;
        reportTasks = tasksForDate;
      }

    if (!reportDate || !reportTasks) {
      console.warn("No Tasks Today");
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
        } 
      }
    });

    const filteredSections = {};

    ['dws1', 'dws2', 'dws3'].forEach(section => {
      if (lockStatus[section]) {
        filteredSections[section] = organizedTasks[section].completed;
      }
    });
    if(['dws1', 'dws2', 'dws3'].every(session=> lockStatus[session] )){
      filteredSections['rws'] = organizedTasks['rws'].completed;
        filteredSections['current-tasks'] = organizedTasks['current-tasks'];
    }

    // If all sessions are blocked except rws, create blocks of all sessions
    // if (allBlocked && !lockStatus['rws']) {
    //   ['dws1', 'dws2', 'dws3', 'rws'].forEach(section => {
    //     filteredSections[section] = organizedTasks[section].completed;
    //   });
    // }

    // Add current-tasks session if all sessions are blocked
    // if (allBlocked) {
    //   filteredSections['current-tasks'] = organizedTasks['current-tasks'];
    // }

    console.log("Filtered sections:", filteredSections);

    setReportData({
      date: reportDate.toLocaleDateString('en-GB'),
      sections: filteredSections
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Daily Reports</h1>
      <div className="flex flex-col gap-4">
        {reportData ? (
          <>
            <ReportCard data={reportData} />
          </>
        ) : (
          <p className="text-gray-500 italic">No tasks available for the report.</p>
        )}
      </div>
    </div>
  );
}

export default Reports;