import { useState, useEffect } from "react";

function useUserActivity(timeout = 10000) {
  // Default timeout to 15 seconds
  const [isActive, setIsActiveState] = useState(false);
  let timeoutId;

  const setActivity = () => {
    setIsActiveState(true);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => setIsActiveState(false), timeout);
  };

  useEffect(() => {
    // Consider adding event listeners here to detect activity like mousemove or keydown
    // window.addEventListener('mousemove', setActivity);
    // window.addEventListener('keydown', setActivity);

    return () => {
      clearTimeout(timeoutId);
      // Cleanup event listeners here
      // window.removeEventListener('mousemove', setActivity);
      // window.removeEventListener('keydown', setActivity);
    };
  }, [timeout]);

  // Expose setActivity instead of setIsActive directly to reset the timeout on call
  const setIsActive = () => setActivity();

  return { isActive, setIsActive };
}

export default useUserActivity;
