
import React, { useState } from 'react';
import { X, Plus, Trash2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { log } from 'console';

interface TimeSlot {
  id: string;
  time: string;
  isBooked: boolean;
}

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  timeSlots: TimeSlot[];
  onAddTimeSlot: (time: string) => void;
  onRemoveTimeSlot: (id: string) => void;
}

const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  timeSlots,
  onAddTimeSlot,
  onRemoveTimeSlot,
}) => {
  const [newTime, setNewTime] = useState('');

  const handleAddTimeSlot = () => {
    if (newTime && !timeSlots.find(slot => slot.time === newTime)) {
      onAddTimeSlot(newTime);
      // Post the new time slot to the backend schedule API
      const postTimeSlot = async () => {
        if (!selectedDate) return;
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const businessId = userData ? JSON.parse(userData).id : null;
        if (!businessId) return;

        console.log(selectedDate);

        try {

          // timeSlots should be an array of objects, not a single object
          const payload = {
            business: businessId,
            date: selectedDate,
            timeSlots: [{ time: newTime }]
          };

          const response = await fetch(`http://localhost:3000/api/schedule/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to add time slot');
          }
          // Optionally, you could refresh the schedule here or handle the response
        } catch (error) {
          console.error('Error posting time slot:', error);
        }
      };
      postTimeSlot();
      setNewTime('');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock size={20} />
            <span>Manage Time Slots</span>
          </DialogTitle>  
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            {formatDate(selectedDate)}
          </div>

          {/* Add New Time Slot */}
          <div className="flex space-x-2">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleAddTimeSlot}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Time Slots List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {timeSlots.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No time slots available</p>
            ) : (
              timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    slot.isBooked
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{slot.time}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        slot.isBooked
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {slot.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveTimeSlot(slot.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeSlotModal;
