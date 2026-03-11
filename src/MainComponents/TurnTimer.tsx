import { useEffect, useRef, useState } from "react";
import "./turnTimer.css";

interface TurnTimerProps {
  canPlay: boolean;
  leaveRoom: () => void;
  resetTimer: boolean;
  continueTimer? : boolean
}

const TOTAL_TIME = 80;
const WARNING_TIME = 40;

const TurnTimer = ({ canPlay, leaveRoom, resetTimer , continueTimer = false }: TurnTimerProps) => {
  // Read sessionStorage ONCE at init so the canPlay effect can use it
  const savedTime = sessionStorage.getItem("timeleft");
  const initialTime = savedTime ? Number(savedTime) : TOTAL_TIME;
  if (savedTime){ 
    setTimeout(() => sessionStorage.removeItem("timeleft"),1000);
  }

  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [warning, setWarning]   = useState(false);
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef   = useRef<number>(initialTime); // declared before any effect

  // Keep ref in sync with timeLeft so beforeunload can read latest value
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Save to sessionStorage on page unload — register ONCE only
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("timeleft", timeLeftRef.current.toString());
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Main timer effect
  useEffect(() => {
    if (!canPlay && !continueTimer) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(TOTAL_TIME);
      setWarning(false);
      return;
    }

    // If we have a saved time (page refreshed mid-turn), resume from it
    const resumeFrom = timeLeftRef.current > 0 ? timeLeftRef.current : TOTAL_TIME;
    setTimeLeft(resumeFrom);
    setWarning(resumeFrom <= WARNING_TIME);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === WARNING_TIME) setWarning(true);

        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          leaveRoom();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [canPlay]);

  // External reset (e.g. new round)
  useEffect(() => {
     const savedTiming = sessionStorage.getItem("timeleft")
    if (resetTimer && (savedTiming === null || savedTiming === undefined)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(TOTAL_TIME);
      setWarning(false);
    }
  }, [resetTimer]);

  const getColorClass = () => {
    if (!canPlay && !continueTimer) return "timer-blue";
    if (warning)  return "timer-red";
    return "timer-green";
  };

  return (
    <div className="turn-timer-wrapper">
      <div className={`turn-timer ${getColorClass()}`}>
        {canPlay ? `Time Left: ${timeLeft} seconds` : (continueTimer ? `Time Left: ${timeLeft} seconds` : "It's not your turn")}
      </div>
    </div>
  );
};

export default TurnTimer;
