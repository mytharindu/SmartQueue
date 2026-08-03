// Time Slots Configuration
export const timeSlots = [
  { id: 1, serviceId: 'passport', startTime: '09:00', endTime: '12:00', slotsPerHour: 4, maxDaily: 40 },
  { id: 2, serviceId: 'license', startTime: '09:00', endTime: '16:00', slotsPerHour: 3, maxDaily: 35 },
  { id: 3, serviceId: 'nic', startTime: '08:00', endTime: '17:00', slotsPerHour: 6, maxDaily: 50 },
  { id: 4, serviceId: 'birth', startTime: '09:00', endTime: '15:00', slotsPerHour: 5, maxDaily: 30 },
  { id: 5, serviceId: 'land', startTime: '10:00', endTime: '16:00', slotsPerHour: 2, maxDaily: 20 },
  { id: 6, serviceId: 'business', startTime: '09:00', endTime: '14:00', slotsPerHour: 3, maxDaily: 25 },
];

// Counter Appointment Settings
export const counterSettings = [
  { id: 'C-01', maxAppointments: 25, dailyTarget: 20, peakHourCapacity: 5 },
  { id: 'C-02', maxAppointments: 30, dailyTarget: 25, peakHourCapacity: 6 },
  { id: 'C-03', maxAppointments: 20, dailyTarget: 18, peakHourCapacity: 4 },
  { id: 'C-04', maxAppointments: 28, dailyTarget: 22, peakHourCapacity: 5 },
];

// Appointment Booking History
export const appointmentHistory = [
  { id: 1, counter: 'C-01', date: '2026-07-18', time: '09:00', duration: 25, citizen: 'Nimal Rajapaksa', status: 'completed' },
  { id: 2, counter: 'C-02', date: '2026-07-18', time: '09:15', duration: 30, citizen: 'Kamala De Silva', status: 'completed' },
  { id: 3, counter: 'C-03', date: '2026-07-18', time: '09:30', duration: 15, citizen: 'Sunil Mendis', status: 'in-progress' },
  { id: 4, counter: 'C-01', date: '2026-07-18', time: '09:30', duration: 25, citizen: 'Anjali Perera', status: 'scheduled' },
  { id: 5, counter: 'C-04', date: '2026-07-18', time: '10:00', duration: 20, citizen: 'Rohan Fernando', status: 'scheduled' },
];

// Helper function to get total capacity from time slots
export function getTotalTimeSlotCapacity(timeSlotList) {
  if (!timeSlotList || timeSlotList.length === 0) return 0;
  return timeSlotList.reduce((max, slot) => Math.max(max, slot.maxDaily), 0);
}