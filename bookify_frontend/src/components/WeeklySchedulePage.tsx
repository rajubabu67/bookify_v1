import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TimeSlotModal from './TimeSlotModal';
import ScheduleHeader from './schedule/ScheduleHeader';
import WeeklyScheduleView from './schedule/WeeklyScheduleView';
import { useScheduleManager } from '../hooks/useScheduleManager';
import { ArrowLeft } from 'lucide-react';

interface SchedulePageProps {
  onNavigateToWeeklySchedule?: () => void;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ onNavigateToWeeklySchedule }) => {
  const navigate = useNavigate();

  const {
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
    availableSlots,
    bookedSlots
  } = useScheduleManager();

  const [practitioners, setPractitioners] = useState([]);
  const [services, setServices] = useState([]);
  const [drawerWasOpen, setDrawerWasOpen] = useState(false);

  const fetchPractitioners = async () => {
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData || '{}');
    const businessId = user.id;

    console.log(businessId);

    const response = await fetch(`http://localhost:3000/api/practitioner/get/business/${businessId}`);
    const data = await response.json();
    console.log(data);
    setPractitioners(data.practitioners);
  };

  useEffect(() => {
    fetchPractitioners();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData || '{}');
    const businessId = user.id;

    const response = await fetch(`http://localhost:3000/api/service/get/${businessId}`);
    const data = await response.json();
    console.log(data);
    setServices(data[0].serviceNames);
  };
  
  const mockWeeklySchedules = [
    {
      _id: 'ws1',
      businessId: 'business1',
      practitionerId: '1',
      dayOfWeek: 'monday' as const,
      slots: [
        { startTime: '09:00', endTime: '12:00' },
        { startTime: '14:00', endTime: '17:00' }
      ]
    },
    {
      _id: 'ws2',
      businessId: 'business1',
      practitionerId: '1',
      dayOfWeek: 'wednesday' as const,
      slots: [
        { startTime: '10:00', endTime: '15:00' }
      ]
    },
    {
      _id: 'ws3',
      businessId: 'business1',
      practitionerId: '2',
      dayOfWeek: 'tuesday' as const,
      slots: [
        { startTime: '08:00', endTime: '12:00' },
        { startTime: '13:00', endTime: '16:00' }
      ]
    }
  ];

  const handleEditSchedule = (practitionerId: string, dayOfWeek: string) => {
    console.log('Edit schedule for practitioner:', practitionerId, 'on', dayOfWeek);
    // This would open a modal or navigate to edit view
  };

  // Pass this to your PractitionerManagementDrawer
  const handleDrawerClose = () => {
    setDrawerWasOpen(true);
    // ...any other close logic
  };

  // Refetch data when drawer closes
  useEffect(() => {
    if (drawerWasOpen) {
      fetchPractitioners();
      fetchServices();
      setDrawerWasOpen(false);
    }
  }, [drawerWasOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back to Home Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </button>
        </div>
        {/* Header Section */}
        <ScheduleHeader onNavigateToWeeklySchedule={onNavigateToWeeklySchedule} />
        {/* Only Weekly View */}
        <WeeklyScheduleView
          practitioners={practitioners}
          services={services}
          weeklySchedules={mockWeeklySchedules}
          onEditSchedule={handleEditSchedule}
          onDrawerClose={handleDrawerClose}
        />
      </div>
    </div>
  );
};

export default SchedulePage;
