import { useState, useEffect } from "react";

const StudyTimer = ({ stopped, resetKey }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Reset when resetKey changes (restart pressed)
  useEffect(() => {
    setElapsedSeconds(0);
  }, [resetKey]);

  // Tick unless stopped
  useEffect(() => {
    if (stopped) return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [stopped, resetKey]);

  const m = Math.floor(elapsedSeconds / 60).toString().padStart(2, "0");
  const s = (elapsedSeconds % 60).toString().padStart(2, "0");
  return <>{m}:{s}</>;
};

export default StudyTimer;
