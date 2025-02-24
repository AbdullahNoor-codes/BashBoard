import { useState } from "react";

// A simple custom hook for showing toast notifications
export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = (options) => {
    setToast(options);
    setTimeout(() => {
      setToast(null);
    }, options.duration || 3000); // Toast disappears after default 3 seconds
  };

  return {
    toast,
    showToast,
  };
};
