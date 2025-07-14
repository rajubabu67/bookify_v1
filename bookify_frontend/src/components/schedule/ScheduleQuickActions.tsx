
import React from 'react';
import { Plus, Save, Edit3 } from 'lucide-react';

interface ScheduleQuickActionsProps {
  hasChanges: boolean;
  loading: boolean;
  onOpenTimeSlotModal: () => void;
  onSaveSchedule: () => void;
}

const ScheduleQuickActions: React.FC<ScheduleQuickActionsProps> = ({
  hasChanges,
  loading,
  onOpenTimeSlotModal,
  onSaveSchedule
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
        <Edit3 size={20} />
        <span>Quick Actions</span>
      </h3>
      <div className="space-y-3">
        <button
          onClick={onOpenTimeSlotModal}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
        >
          <Plus size={16} />
          <span>Add Time Slot</span>
        </button>
        {hasChanges && (
          <button
            onClick={onSaveSchedule}
            disabled={loading}
            className="w-full bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{loading ? 'Saving...' : 'Save Schedule'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ScheduleQuickActions;
