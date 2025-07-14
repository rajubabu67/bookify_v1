import React from 'react';
import { Clock, Calendar } from 'lucide-react';

interface TimeSlot {
  time: string;
  isBooked: boolean;
  practitionerId?: string;
  serviceIds?: string[];
}

interface ScheduleTimeSlotsProps {
  availableSlots: TimeSlot[];
  bookedSlots: TimeSlot[];
}

const ScheduleTimeSlots: React.FC<ScheduleTimeSlotsProps> = ({
  availableSlots,
  bookedSlots
}) => {
  return (
    <div className="space-y-6">
      {/* Available Slots Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-105 transition-transform duration-200">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Clock size={20} />
            <span>Available Slots</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No available slots</p>
              </div>
            ) : (
              availableSlots.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 hover:bg-green-100 transition-colors"
                >
                  <span className="font-semibold text-lg">{slot.time}</span>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Available
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Booked Slots Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-105 transition-transform duration-200">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Calendar size={20} />
            <span>Booked Slots</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {bookedSlots.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No bookings today</p>
              </div>
            ) : (
              bookedSlots.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 hover:bg-red-100 transition-colors"
                >
                  <span className="font-semibold text-lg">{slot.time}</span>
                  <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    Booked
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTimeSlots;