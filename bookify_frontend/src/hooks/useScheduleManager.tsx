
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface TimeSlot {
  time: string;
  isBooked: boolean;
  practitionerId?: string;
  serviceIds?: string[];
}

interface Schedule {
  _id?: string;
  business: string;
  date: Date;
  timeSlots: TimeSlot[];
}

export const useScheduleManager = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // API base URL - adjust this to match your backend
  const API_BASE_URL = 'http://localhost:5000/api'; // Update this to your backend URL

  // Get business ID from localStorage
  const getBusinessId = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData).id : null;
  };

  // Create schedule
  const createSchedule = async (scheduleData: Omit<Schedule, '_id'>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheduleData)
      });
      
      if (!response.ok) throw new Error('Failed to create schedule');
      return await response.json();
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  };

  // Get schedule by business and date
  const getScheduleByBusinessAndDate = async (businessId: string, date: Date) => {
    try {
      const token = localStorage.getItem('token');
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(`${API_BASE_URL}/schedules/${businessId}/${dateStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch schedule');
      return await response.json();
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return null;
    }
  };

  // Update schedule
  const updateSchedule = async (scheduleId: string, scheduleData: Partial<Schedule>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheduleData)
      });
      
      if (!response.ok) throw new Error('Failed to update schedule');
      return await response.json();
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  };

  // Delete schedule
  const deleteSchedule = async (scheduleId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete schedule');
      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  };

  // Load schedule for selected date
  const loadScheduleForDate = async (date: Date) => {
    const businessId = getBusinessId();
    if (!businessId) return;

    setLoading(true);
    try {
      const schedule = await getScheduleByBusinessAndDate(businessId, date);
      setCurrentSchedule(schedule);
      setTimeSlots(schedule?.timeSlots || []);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save current schedule
  const handleSaveSchedule = async () => {
    const businessId = getBusinessId();
    if (!businessId || !selectedDate) return;

    setLoading(true);
    try {
      if (currentSchedule?._id) {
        // Update existing schedule
        await updateSchedule(currentSchedule._id, { timeSlots });
      } else {
        // Create new schedule
        const newSchedule = await createSchedule({
          business: businessId,
          date: selectedDate,
          timeSlots
        });
        setCurrentSchedule(newSchedule);
      }
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete current schedule
  const handleDeleteSchedule = async () => {
    if (!currentSchedule?._id) return;

    if (window.confirm('Are you sure you want to delete this schedule?')) {
      setLoading(true);
      try {
        await deleteSchedule(currentSchedule._id);
        setCurrentSchedule(null);
        setTimeSlots([]);
        setHasChanges(false);
      } catch (error) {
        console.error('Error deleting schedule:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Add time slot
  const handleAddTimeSlot = (time: string) => {
    const newSlot: TimeSlot = { time, isBooked: false };
    const updatedSlots = [...timeSlots, newSlot].sort((a, b) => a.time.localeCompare(b.time));
    setTimeSlots(updatedSlots);
    setHasChanges(true);
  };

  // Remove time slot
  const handleRemoveTimeSlot = (index: number) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedSlots);
    setHasChanges(true);
  };

  // Load schedule when date changes
  useEffect(() => {
    if (selectedDate) {
      loadScheduleForDate(selectedDate);
    }
  }, [selectedDate]);

  return {
    selectedDate,
    setSelectedDate,
    currentSchedule,
    timeSlots,
    loading,
    hasChanges,
    handleSaveSchedule,
    handleDeleteSchedule,
    handleAddTimeSlot,
    handleRemoveTimeSlot,
    availableSlots: timeSlots.filter(slot => !slot.isBooked),
    bookedSlots: timeSlots.filter(slot => slot.isBooked)
  };
};
