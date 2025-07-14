
import React, { useState } from 'react';
import TimeSlotModal from './TimeSlotModal';
import ScheduleHeader from './schedule/ScheduleHeader';
import ScheduleCalendar from './schedule/ScheduleCalendar';
import ScheduleTimeSlots from './schedule/ScheduleTimeSlots';
import ScheduleQuickActions from './schedule/ScheduleQuickActions';
import WeeklyScheduleView from './schedule/WeeklyScheduleView';
import { useScheduleManager } from '../hooks/useScheduleManager';
import { CalendarDays, Calendar } from 'lucide-react';

interface SchedulePageProps {
  onNavigateToWeeklySchedule?: () => void;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ onNavigateToWeeklySchedule }) => {
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  
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

  // Mock data - in real app, this would come from your backend
  const mockPractitioners = [
    {
      _id: '1',
      businessId: 'business1',
      name: 'Dr. Sarah Johnson',
      bio: 'Experienced therapist specializing in anxiety and depression',
      photoUrl: '',
      email: 'sarah@example.com',
      linkedServiceIds: ['service1', 'service2'],
      active: true
    },
    {
      _id: '2',
      businessId: 'business1',
      name: 'Dr. Mike Chen',
      bio: 'Licensed counselor with expertise in family therapy',
      photoUrl: '',
      email: 'mike@example.com',
      linkedServiceIds: ['service2', 'service3'],
      active: true
    }
  ];

  const mockServices = [
    {
      _id: 'service1',
      businessId: 'business1',
      serviceNames: ['Individual Therapy', 'Consultation']
    },
    {
      _id: 'service2',
      businessId: 'business1',
      serviceNames: ['Group Therapy', 'Workshop']
    },
    {
      _id: 'service3',
      businessId: 'business1',
      serviceNames: ['Family Counseling', 'Couples Therapy']
    }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <ScheduleHeader onNavigateToWeeklySchedule={onNavigateToWeeklySchedule} />

        {/* View Toggle */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <div className="flex space-x-1">
              <button
                onClick={() => setViewMode('daily')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                  viewMode === 'daily'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar size={18} />
                <span className="font-medium">Daily View</span>
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                  viewMode === 'weekly'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CalendarDays size={18} />
                <span className="font-medium">Weekly View</span>
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'daily' ? (
          /* Daily View - Main Content Grid */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Calendar Section */}
            <div className="xl:col-span-2">
              <ScheduleCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                currentSchedule={currentSchedule}
                availableSlots={availableSlots}
                bookedSlots={bookedSlots}
                hasChanges={hasChanges}
                loading={loading}
                onSaveSchedule={handleSaveSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                onOpenTimeSlotModal={() => setIsTimeSlotModalOpen(true)}
              />
            </div>

            {/* Time Slots Overview */}
            <div className="space-y-6">
              <ScheduleTimeSlots 
                availableSlots={availableSlots}
                bookedSlots={bookedSlots}
              />

              {/* Quick Actions Card */}
              <ScheduleQuickActions
                hasChanges={hasChanges}
                loading={loading}
                onOpenTimeSlotModal={() => setIsTimeSlotModalOpen(true)}
                onSaveSchedule={handleSaveSchedule}
              />
            </div>
          </div>
        ) : (
          /* Weekly View */
          <WeeklyScheduleView
            practitioners={mockPractitioners}
            services={mockServices}
            weeklySchedules={mockWeeklySchedules}
            onEditSchedule={handleEditSchedule}
          />
        )}

        {/* Time Slot Management Modal */}
        <TimeSlotModal
          isOpen={isTimeSlotModalOpen}
          onClose={() => setIsTimeSlotModalOpen(false)}
          selectedDate={selectedDate || null}
          timeSlots={timeSlots.map((slot, index) => ({ ...slot, id: index.toString() }))}
          onAddTimeSlot={handleAddTimeSlot}
          onRemoveTimeSlot={handleRemoveTimeSlot}
        />
      </div>
    </div>
  );
};

export default SchedulePage;
