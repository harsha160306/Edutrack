import React, { useState } from 'react';
import { DatePicker } from '@/components/ui/date-picker';

export function DatePickerDemo() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  return (
    <DatePicker
      label="Select Date"
      value={selectedDate}
      onChange={setSelectedDate}
      placeholder="Choose a date"
    />
  );
}

