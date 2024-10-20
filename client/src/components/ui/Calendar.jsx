// src/components/ui/Calendar.jsx
import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const Calendar = ({ mode, selected, onSelect, initialFocus }) => {
  return <DayPicker mode={mode} selected={selected} onSelect={onSelect} initialFocus={initialFocus} />;
};

export default Calendar;