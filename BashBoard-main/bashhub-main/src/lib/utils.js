import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Time constants for sessions
export const SESSION_TIMES = {
  DWS1_LOCK: '13:31',  // 1:30 PM
  DWS2_LOCK: '16:01',    // 4:00 PM
  DWS3_LOCK: '18:01',    // 6:00 PM
  ALL_UNLOCK: '23:01',   // 11:00 PM
  
};

// Check if the current time is past the specified time
export const isPastTime = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const compareTime = new Date(now);
  compareTime.setHours(hours, minutes, 0, 0); // Set to the specified time today
  return now >= compareTime;
};

// Check if the current time is within 5 minutes before the specified time
export const isWithin5MinutesBefore = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const compareTime = new Date(now);
  compareTime.setHours(hours, minutes, 0, 0); // Set to the specified time today
  const fiveMinutesBefore = new Date(compareTime.getTime() - 5 * 60000); // Subtract 5 minutes
  return now >= fiveMinutesBefore && now < compareTime;
};

// Get session lock status
export const getSessionLockStatus = () => {
  const isUnlockTime = isPastTime(SESSION_TIMES.ALL_UNLOCK) || 
                       !isPastTime(SESSION_TIMES.DWS1_LOCK);

  return {
    dws1: !isUnlockTime && isPastTime(SESSION_TIMES.DWS1_LOCK),
    dws2: !isUnlockTime && isPastTime(SESSION_TIMES.DWS2_LOCK),
    dws3: !isUnlockTime && isPastTime(SESSION_TIMES.DWS3_LOCK),
    rws: false, // Remote session is never locked
    'current-tasks': false, // Current tasks are never locked
  };
};





// Add new utility functions for date handling
export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();
};

export const isTaskFromToday = (task) => {
  return isSameDay(new Date(task.task_time), new Date());
};

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatReportForSlack = (reportData, userEmail) => {
  if (!reportData) return '';

  const sections = [
    { id: 'dws1', title: 'Deep Work Session 1' },
    { id: 'dws2', title: 'Deep Work Session 2' },
    { id: 'dws3', title: 'Deep Work Session 3' },
    { id: 'rws', title: 'Remote Sessions' },
    { id: 'current-tasks', title: 'Current Tasks' }
  ];

  let message = `*Daily Report for ${reportData.date}*\n\n`;

  sections.forEach(section => {
    message += `*${section.title}*\n`;
    if (reportData.sections[section.id]?.length > 0) {
      reportData.sections[section.id].forEach(task => {
        message += `• ${task}\n`;
      });
    } else {
      message += `_No tasks for this section._\n`;
    }
    message += '\n';
  });

  message += `\nReport generated by: ${userEmail}`;
  return message;
};
export const getCurrentLocalDate = ()=>{
  const now = new Date();
  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  ).toISOString();
  return localDate.split("T")[0];
}