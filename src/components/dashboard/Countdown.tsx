'use client';

import { useEffect, useState } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CountdownProps {
  weddingDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (date: Date): TimeLeft | null => {
  const now = new Date();
  if (date <= now) return null; // Wedding has passed or is now

  let timeLeftSeconds = differenceInSeconds(date, now);

  const days = Math.floor(timeLeftSeconds / (60 * 60 * 24));
  timeLeftSeconds -= days * (60 * 60 * 24);

  const hours = Math.floor(timeLeftSeconds / (60 * 60));
  timeLeftSeconds -= hours * (60 * 60);

  const minutes = Math.floor(timeLeftSeconds / 60);
  timeLeftSeconds -= minutes * 60;
  
  const seconds = timeLeftSeconds;

  return { days, hours, minutes, seconds };
};

export function Countdown({ weddingDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(weddingDate));

  useEffect(() => {
    if (weddingDate <= new Date()) {
      setTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(weddingDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  if (!timeLeft) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center font-headline text-2xl text-primary">The Big Day is Here (or Past)!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg">Congratulations!</p>
        </CardContent>
      </Card>
    );
  }

  const CountdownItem = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center p-2 sm:p-4 bg-primary/10 rounded-lg shadow-inner min-w-[60px] sm:min-w-[80px]">
      <span className="text-2xl sm:text-4xl font-bold text-primary">{value.toString().padStart(2, '0')}</span>
      <span className="text-xs sm:text-sm text-primary/80 uppercase">{label}</span>
    </div>
  );

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-center font-headline text-2xl sm:text-3xl text-primary">Counting Down to "I Do!"</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around items-center space-x-2 sm:space-x-4">
          <CountdownItem value={timeLeft.days} label="Days" />
          <CountdownItem value={timeLeft.hours} label="Hours" />
          <CountdownItem value={timeLeft.minutes} label="Mins" />
          <CountdownItem value={timeLeft.seconds} label="Secs" />
        </div>
      </CardContent>
    </Card>
  );
}
