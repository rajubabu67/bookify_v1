import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, Clock, Briefcase, ToggleLeft, Book, Trash2 } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { Button } from '../ui/button';
import PractitionerManagementDrawer from '../PractitionerManagementDrawer';
import { log } from 'console';

interface Service {
  _id: string;
  businessId: string;
  serviceNames: string[];
}

interface Practitioner {
  _id: string;
  businessId: string;
  name: string;
  bio: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  linkedServices: string[];
  active: boolean;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface WeeklySchedule {
  _id: string;
  businessId: string;
  practitionerId: string;
  dayOfWeek: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  slots: TimeSlot[];
}

interface WeeklyScheduleViewProps {
  practitioners: Practitioner[];
  services: Service[];
  weeklySchedules: WeeklySchedule[];
  onEditSchedule?: (practitionerId: string, dayOfWeek: string) => void;
  onDrawerClose?: () => {onClose};
}

const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  practitioners,
  services,
  weeklySchedules,
  onEditSchedule,
  onDrawerClose
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [schedule, setSchedule] = useState<TimeSlot[] | null>(null);
  const [practitionerSchedules, setPractitionerSchedules] = useState({});

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Start from Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayAbbreviations = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const getServicesForPractitioner = (practitionerId: string) => {
    const practitioner = practitioners.find(p => p._id === practitionerId);
    if (!practitioner) return [];
    
    return services.filter(service => 
      practitioner.linkedServices.includes(service)
    );
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  const getStatusColor = (slots: TimeSlot[]) => {
    if (slots.length === 0) return 'bg-gray-100 text-gray-500';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(direction === 'prev' ? subWeeks(currentWeek, 1) : addWeeks(currentWeek, 1));
  };

  const [isPractitionerDrawerOpen, setIsPractitionerDrawerOpen] = useState(false);
  const [isAddPractitionerModalOpen, setIsAddPractitionerModalOpen] = useState(false);
  
  const fetchSchedules = async () => {
    const results = await Promise.all(
      practitioners.map(async (practitioner) => {
        const response = await fetch(`http://localhost:3000/api/weekly-schedule/get/practitioner/${practitioner._id}`);
        const data = await response.json();
        return { practitionerId: practitioner._id, schedule: data };
      })
    );
    // Convert array to object: { [practitionerId]: schedule }
    const scheduleMap = {};
    results.forEach(({ practitionerId, schedule }) => {
      scheduleMap[practitionerId] = schedule;
    });
    setPractitionerSchedules(scheduleMap);
  };
  
  useEffect(() => {

    if (practitioners.length > 0) {
      fetchSchedules();
    }
  }, [practitioners]);

  const handleDeleteTimeSlot = async (weeklyScheduleId: string, dayName: string, startTime: string, endTime: string) => {
    console.log("Deleting time slot:", weeklyScheduleId, dayName, startTime, endTime);

    
    const response = await fetch(`http://localhost:3000/api/weekly-schedule/delete-time-slot`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ scheduleId: weeklyScheduleId, dayName: dayName.toLowerCase(), startTime, endTime })
    });
    const data = await response.json();
    console.log("Deleted time slot:", data);
    fetchSchedules();
  };

  const handleBookTimeSlot = async (weeklyScheduleId: string, dayName: string, startTime: string, endTime: string) => {
    console.log("Booking time slot:", weeklyScheduleId, dayName, startTime, endTime);

    const response = await fetch(`http://localhost:3000/api/weekly-schedule/change-is-booked`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ scheduleId: weeklyScheduleId, dayName: dayName.toLowerCase(), startTime, endTime })
    });
    const data = await response.json();
    console.log("Booked time slot:", data);
    fetchSchedules();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Calendar size={24} />
              <span>Weekly Schedule Overview</span>
            </h2>
            <p className="text-purple-100 mt-1">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setIsPractitionerDrawerOpen(true)}
              className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-all duration-200"
              >
              <User className="h-4 w-4 mr-2" />
              Link Hosts
            </Button>
            <button
              onClick={() => navigateWeek('prev')}
              className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-all duration-200"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 text-sm font-medium"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-all duration-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-8 gap-2">
          {/* Header Row */}
          <div className="font-semibold text-gray-700 p-4 text-center">
            Meeting Holders
          </div>
          {dayAbbreviations.map((day, index) => (
            <div key={day} className="font-semibold text-gray-700 p-4 text-center">
              <div className="text-sm">{day}</div>
              <div className="text-lg font-bold text-purple-600">
                {format(weekDays[index], 'd')}
              </div>
            </div>
          ))}

          {/* Time Slots Grid */}
          {practitioners.filter(p => p.active).map((practitioner) => (
            <React.Fragment key={practitioner._id}>
              {/* Practitioner Info Column */}
              <div className="border-r border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{practitioner.name}</h3>
                  </div>
                </div>
                
                {/* Services */}
                <div className="space-y-1">
                  {/* <div className="flex items-center space-x-1 text-xs text-gray-600">
                    <Briefcase size={12} />
                    <span>Services:</span>
                  </div> */}
                  <div className="flex flex-wrap gap-1">
                    {getServicesForPractitioner(practitioner._id).slice(0, 2).map((service, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                    {getServicesForPractitioner(practitioner._id).length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{getServicesForPractitioner(practitioner._id).length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Daily Schedule Columns */}
              {weekDays.map((day, dayIndex) => {
                const dayName = dayNames[dayIndex].toLowerCase();
                const weeklySchedule = practitionerSchedules[practitioner._id];
                const schedule = weeklySchedule?.schedules?.[0];
                const slots = schedule?.schedule?.[dayName] || [];
                // console.log("Slots:", weeklySchedule?.schedules?.[0]);

                return (
                <div
              key={`${practitioner._id}-${dayIndex}`}
              className="border-r border-gray-200 p-2 min-h-32 hover:bg-gray-50 transition-colors cursor-pointer relative group"
              onClick={() => onEditSchedule?.(practitioner._id, dayName)}
            >
              <div className="space-y-2">
                {slots.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-xs text-gray-400 mb-1">No availability</div>
                    <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                  </div>
                ) : (
                  slots.map((slot, slotIndex) => (
                    <div
                      key={slotIndex}
                      className={`p-2 rounded-lg border ${slot.isBooked ? 'bg-red-100' : 'bg-green-100'} transition-all duration-300 hover:shadow-md relative overflow-hidden group`}
                    >
                      {/* Dark overlay - appears on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                      
                      {/* Action Icons - Slide in from left */}
                      <div className="absolute left-0 top-0 bottom-0 flex items-center gap-1 pl-1 pr-2 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-20">
                        {!slot.isBooked && <button 
                          className="p-1.5 mr-2 bg-white rounded-full shadow-md hover:bg-blue-50 text-blue-600 hover:scale-110 transition-transform"
                          onClick={(e) => {
                            handleBookTimeSlot(schedule._id, dayName.toLowerCase(), slot.startTime, slot.endTime);
                            e.stopPropagation();
                            // Handle book action
                          }}
                          title="Book"
                        >
                          <Book size={14} />
                        </button>}
                        {!slot.isBooked && <button 
                          className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 text-red-600 hover:scale-110 transition-transform"
                          onClick={(e) => {
                            handleDeleteTimeSlot(schedule._id, dayName.toLowerCase(), slot.startTime, slot.endTime);
                            e.stopPropagation();
                            // Handle delete action
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>}
                        
                      </div>
                      
                      {/* Content - becomes white when overlay appears */}
                      <div className={`relative z-0 transition-all duration-300 ${slot.isBooked ? 'text-red-600' : 'text-green-600 group-hover:text-green-300'}`}>
                        <div className="flex items-center space-x-1 text-xs">
                          <Clock size={12} />
                          <span className={`font-medium ${!slot.isBooked && 'group-hover:text-white'}`}>
                            {formatTimeRange(slot.startTime, slot.endTime)}
                          </span>
                        </div>
                          <div className={`text-xs mt-1 font-medium ${slot.isBooked ? 'text-red-600' : `text-green-600 ${!slot.isBooked && 'group-hover:text-white'}`}`}>
                            {slot.isBooked ? 'Booked' : 'Available'}
                          </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>)
            })}
            </React.Fragment>
          ))}
        </div>



        <PractitionerManagementDrawer
          isOpen={isPractitionerDrawerOpen}
          onClose={() => setIsPractitionerDrawerOpen(false)}
          practitioners={practitioners}
          services={services}
          weeklySchedules={weeklySchedules}
          onDrawerClose={onDrawerClose}
        />

      </div>
    </div>
  );
};

export default WeeklyScheduleView;
