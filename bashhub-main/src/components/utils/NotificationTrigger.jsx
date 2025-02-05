import { useEffect } from 'react';
import { useSessionLock } from '@/hooks/useSessionLock';
import NotificationService from '@/utils/NotificationService';
import { SESSION_TIMES, isWithin5MinutesBefore } from '@/lib/utils';

export function NotificationTrigger() {
  useEffect(() => {
    // Initialize notifications
    const initNotifications = async () => {
      await NotificationService.requestPermission();
      await NotificationService.registerServiceWorker();
    };

    initNotifications();

    // Check for upcoming locks every minute
    const checkUpcomingLocks = () => {
      Object.entries(SESSION_TIMES).forEach(([session, time]) => {
        if (session !== 'ALL_UNLOCK' && isWithin5MinutesBefore(time)) {
          const sessionName = session.split('_')[0];
          NotificationService.sendNotification(
            `${sessionName} will be locked in 5 minutes. Please complete your tasks or move them to another session.`
          );
        }
      });
    };

    const interval = setInterval(checkUpcomingLocks, 60000); // Check every minute
    checkUpcomingLocks(); // Initial check

    return () => clearInterval(interval);
  }, []);

  // This is a background component, so it doesn't render anything
  return null;
}
