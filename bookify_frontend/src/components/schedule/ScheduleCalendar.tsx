
import React from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Save, Settings, Trash2 } from 'lucide-react';
import 'react-day-picker/dist/style.css';

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

interface ScheduleCalendarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  currentSchedule: Schedule | null;
  availableSlots: TimeSlot[];
  bookedSlots: TimeSlot[];
  hasChanges: boolean;
  loading: boolean;
  onSaveSchedule: () => void;
  onDeleteSchedule: () => void;
  onOpenTimeSlotModal: () => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  selectedDate,
  onSelectDate,
  currentSchedule,
  availableSlots,
  bookedSlots,
  hasChanges,
  loading,
  onSaveSchedule,
  onDeleteSchedule,
  onOpenTimeSlotModal
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Calendar View</h2>
          <div className="flex space-x-3">
            {hasChanges && (
              <button
                onClick={onSaveSchedule}
                disabled={loading}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save size={16} />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            )}
            <button
              onClick={onOpenTimeSlotModal}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
            >
              <Settings size={16} />
              <span>Manage Slots</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          className="mx-auto"
          styles={{
            caption: { color: '#374151', fontWeight: 'bold', fontSize: '1.2rem' },
            day: { margin: '4px', borderRadius: '12px' },
          }}
        />

        {selectedDate && (
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
            <h3 className="font-bold text-gray-800 mb-3 text-lg">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">{availableSlots.length} available slots</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">{bookedSlots.length} booked slots</span>
              </div>
            </div>
            {currentSchedule && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={onDeleteSchedule}
                  disabled={loading}
                  className="text-red-600 hover:text-red-800 flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  <span>Delete Schedule</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleCalendar;