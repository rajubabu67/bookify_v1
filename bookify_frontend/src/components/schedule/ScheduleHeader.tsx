import React from 'react';
import { Calendar, CalendarDays } from 'lucide-react';

interface ScheduleHeaderProps {
  onNavigateToWeeklySchedule?: () => void;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ onNavigateToWeeklySchedule }) => {
  return (
    <div className="text-center space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
        <Calendar className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Schedule Manager
      </h1>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
        Manage your availability and appointment slots with ease
      </p>
      
      {/* Weekly Schedule Button */}
      {onNavigateToWeeklySchedule && (
        <div className="mt-6">
          <button
            onClick={onNavigateToWeeklySchedule}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg"
          >
            <CalendarDays size={20} />
            <span>Setup Weekly Schedule</span>
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Create recurring schedules, manage practitioners & services
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduleHeader;