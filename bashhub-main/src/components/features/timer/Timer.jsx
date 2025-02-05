import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

function Timer() {
  const [duration, setDuration] = useState(25); // Default 25 minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleDurationChange = (newValue) => {
    setDuration(newValue);
    setTimeLeft(newValue * 60);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(duration * 60);
    setIsRunning(false);
  };

  const calculateProgress = () => {
    return ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Timer Display */}
      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-blue-600"
            strokeDasharray="100 100"
            strokeDashoffset={100 - calculateProgress()}
            style={{ transition: 'stroke-dashoffset 0.5s' }}
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="text-4xl font-bold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Duration Slider */}
      <div className="w-full max-w-md">
        <div className="flex justify-between mb-2">
          <span>Duration: {duration} minutes</span>
        </div>
        <Slider
          value={[duration]}
          onValueChange={(value) => handleDurationChange(value[0])}
          min={5}
          max={60}
          step={5}
          disabled={isRunning}
        />
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <Button onClick={toggleTimer} size="lg">
          {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={resetTimer} variant="outline" size="lg">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}

export default Timer;