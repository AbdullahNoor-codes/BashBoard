import { useState, useEffect, useRef } from 'react';
import { SESSION_TIMES, getSessionLockStatus, isWithin5MinutesBefore } from '@/lib/utils';
import NotificationService from '@/utils/NotificationService';

export function useSessionLock() {
  const [lockStatus, setLockStatus] = useState(getSessionLockStatus());
  const notifiedSessions = useRef(new Set());

  // Function to check and update lock status
  const checkLockStatus = () => {
    const newLockStatus = getSessionLockStatus();
    setLockStatus(newLockStatus);

    // Check for upcoming locks and send notifications
    Object.entries(SESSION_TIMES).forEach(([session, time]) => {
      if (session === 'ALL_UNLOCK') return; // Skip ALL_UNLOCK

      if (isWithin5MinutesBefore(time) && !notifiedSessions.current.has(session)) {
        const sessionName = session.split('_')[0].toUpperCase(); // Extract session name
        NotificationService.sendNotification(
          'Session Lock Warning',
          {
            body: `${sessionName} will be locked in 5 minutes. Please complete your current tasks.`,
            tag: session, // Prevent duplicate notifications
            requireInteraction: true, // Notification persists until user interacts
          }
        );
        notifiedSessions.current.add(session); // Mark session as notified
      }
    });

    // Reset notifications at midnight
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      notifiedSessions.current.clear(); // Clear all notifications for the new day
    }
  };

  useEffect(() => {
    // Request permission and register service worker for notifications
    NotificationService.requestPermission();
    NotificationService.registerServiceWorker();

    // Initial check and interval setup
    checkLockStatus(); // Perform an initial check
    const interval = setInterval(checkLockStatus, 200); // Check every minute

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return lockStatus;
}