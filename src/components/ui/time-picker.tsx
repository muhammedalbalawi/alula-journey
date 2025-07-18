
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const { language, t } = useLanguage();
  
  // Parse current time
  const parseTime = (timeStr: string) => {
    if (timeStr.includes(' - ')) {
      const [start] = timeStr.split(' - ');
      return start;
    }
    return timeStr;
  };

  const currentTime = parseTime(value);
  const [hour, minute] = currentTime.split(':');
  const hourNum = parseInt(hour);
  const is24Hour = hourNum > 12 || (hourNum === 0);
  
  const hour12 = is24Hour ? (hourNum > 12 ? hourNum - 12 : (hourNum === 0 ? 12 : hourNum)) : hourNum;
  const period = hourNum >= 12 ? 'PM' : 'AM';

  const updateTime = (newHour: string, newMinute: string, newPeriod: string) => {
    let hour24 = parseInt(newHour);
    if (newPeriod === 'PM' && hour24 !== 12) hour24 += 12;
    if (newPeriod === 'AM' && hour24 === 12) hour24 = 0;
    
    const timeStr = `${hour24.toString().padStart(2, '0')}:${newMinute}`;
    
    // If original had range, maintain it with 3-hour duration
    if (value.includes(' - ')) {
      const endHour = (hour24 + 3) % 24;
      const endTimeStr = `${endHour.toString().padStart(2, '0')}:${newMinute}`;
      onChange(`${timeStr} - ${endTimeStr}`);
    } else {
      onChange(timeStr);
    }
  };

  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <Select
        value={hour12.toString()}
        onValueChange={(h) => updateTime(h, minute, period)}
      >
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <SelectItem key={h} value={h.toString()}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <span>:</span>
      
      <Select
        value={minute}
        onValueChange={(m) => updateTime(hour12.toString(), m, period)}
      >
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['00', '15', '30', '45'].map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={period}
        onValueChange={(p) => updateTime(hour12.toString(), minute, p)}
      >
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">
            {language === 'ar' ? 'صباح' : 'AM'}
          </SelectItem>
          <SelectItem value="PM">
            {language === 'ar' ? 'مساء' : 'PM'}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
