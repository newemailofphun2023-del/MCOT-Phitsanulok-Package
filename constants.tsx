
import React from 'react';

export const TIME_SLOTS = [
  { period: 'ช่วงเช้า (08:00-10:00)', slots: ['08:00-08:30', '08:30-09:00', '09:00-09:30', '09:30-10:00'] },
  { period: 'ช่วงสาย (10:00-12:00)', slots: ['10:00-10:30', '10:30-11:00', '11:00-11:30', '11:30-12:00'] },
  { period: 'ช่วงเที่ยง (12:00-14:00)', slots: ['12:00-12:30', '12:30-13:00', '13:00-13:30', '13:30-14:00'] },
  { period: 'ช่วงบ่าย (14:00-16:00)', slots: ['14:00-14:30', '14:30-15:00', '15:00-15:30', '15:30-16:00'] },
  { period: 'ช่วงเย็น (16:00-18:00)', slots: ['16:00-16:30', '16:30-17:00', '17:00-17:30', '17:30-18:00'] }
];

export const WEEKDAYS = [
  { label: 'อา', value: 0 },
  { label: 'จ', value: 1 },
  { label: 'อ', value: 2 },
  { label: 'พ', value: 3 },
  { label: 'พฤ', value: 4 },
  { label: 'ศ', value: 5 },
  { label: 'ส', value: 6 }
];

export const MCOT_BLUE_GRADIENT = "bg-gradient-to-br from-[#0d3b66] to-[#1c5bb8]";
export const GOLD_ACCENT = "#f9a826";
