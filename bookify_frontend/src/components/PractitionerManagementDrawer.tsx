import React, { useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DayPicker } from 'react-day-picker';
import { 
  User, 
  Calendar as CalendarIcon,
  Clock,
  Link
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import 'react-day-picker/dist/style.css';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

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

interface WeeklySchedule {
  _id?: string;
  businessId: string;
  practitionerId: string;
  schedule: {
    sunday: TimeSlot[];
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
  };
}

interface PractitionerManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  practitioners: Practitioner[];
  services: Service[];
  weeklySchedules: WeeklySchedule[];
  onDrawerClose?: () => {onClose};
}

const PractitionerManagementDrawer: React.FC<PractitionerManagementDrawerProps> = ({
  isOpen,
  onClose,
  practitioners,
  services,
  weeklySchedules,
  onDrawerClose
}) => {
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>('');
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  // Available time slots (you can customize these)
  const availableTimeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00'
  ];
  

  const handleSaveWeeklySchedule = async () => {
    if (!selectedPractitioner || !selectedDayOfWeek || !selectedStartTime || !selectedEndTime) {
      return;
    }

    const [startTime, endTime] = [selectedStartTime, selectedEndTime];

    // Fetch existing schedule for the practitioner
    const existingScheduleResponse = await fetch(`http://localhost:3000/api/weekly-schedule/get/practitioner/${selectedPractitioner}`);
    const response1 = await existingScheduleResponse.json();
    console.log("Existing schedule data:", response1);
    let existingScheduleData = null;

    if (response1.schedules.length !== 0) {
      existingScheduleData = response1.schedules[0].schedule

    // If there's an existing schedule, merge the new time slot with it
      if (existingScheduleData?.schedule) {
        const existingDaySchedule = existingScheduleData.schedule[selectedDayOfWeek.toLowerCase()] || [];
        existingDaySchedule.push({ startTime, endTime });
        
        // Sort time slots by start time
        existingDaySchedule.sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        // Update the schedule with merged slots
        existingScheduleData.schedule[selectedDayOfWeek.toLowerCase()] = existingDaySchedule;
        return existingScheduleData;
      }
    }
      
    
    const newSchedule: Omit<WeeklySchedule, '_id'> = {
      businessId: practitioners[0].businessId, // Assuming all practitioners have same businessId
      practitionerId: selectedPractitioner,
      schedule: {
        ...existingScheduleData,
        [selectedDayOfWeek.toLowerCase()]: [
          ...(existingScheduleData?.[selectedDayOfWeek.toLowerCase()] || []),
          { startTime, endTime }
        ]
      }
    };

    console.log(newSchedule);

    // Make API call to save weekly schedule
    const response = await fetch('http://localhost:3000/api/weekly-schedule/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSchedule)
    })

    const data = await response.json();
    console.log(data);

    setSelectedPractitioner('');
    setSelectedDayOfWeek('');
    setSelectedStartTime('');
    setSelectedEndTime('');
    onDrawerClose();
    onClose();
  };


  const selectedPractitionerData = practitioners.find(p => p._id === selectedPractitioner);

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] max-w-5xl mx-auto">
        <DrawerHeader className="px-8 pt-8 flex flex-col items-center text-center">
          <DrawerTitle className="flex items-center space-x-3 text-2xl justify-center">
            <Link className="h-7 w-7 text-blue-600" />
            <span>Link Host to Time Slot</span>
          </DrawerTitle>
          <DrawerDescription className="text-lg mt-2">
            Select a host, day of week, and time slot to create a booking link
          </DrawerDescription>
        </DrawerHeader> 

        <div className="px-8 py-6 flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-8">
            
            {/* Practitioner Selection */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <User className="h-6 w-6 text-blue-600" />
                  <span>Select Host</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {practitioners.map((practitioner) => (
                    <div
                      key={practitioner._id}
                      onClick={() => setSelectedPractitioner(practitioner._id)}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                        selectedPractitioner === practitioner._id
                          ? "border-blue-500 bg-blue-100 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                            <User size={24} className="text-white" />
                          </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{practitioner.name}</h3>
                          <p className="text-gray-600 text-sm">{practitioner.bio.slice(0, 50)}...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Day of Week Selection */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                  <span>Select Day of Week</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-3">
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, idx) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDayOfWeek(day.toLowerCase())}
                      className={
                        "px-4 py-2 rounded-full font-medium transition-all duration-200 border " +
                        (selectedDayOfWeek === day.toLowerCase()
                          ? "bg-blue-200 border-blue-400 text-blue-900 shadow"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-blue-100")
                      }
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {selectedDayOfWeek && (
                  <div className="mt-4 p-4 bg-blue-100 rounded-xl border border-blue-200">
                    <p className="text-blue-800 font-medium text-center">
                      Selected: {selectedDayOfWeek.charAt(0).toUpperCase() + selectedDayOfWeek.slice(1)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date Selection */}
            {/* <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <CalendarIcon className="h-6 w-6 text-green-600" />
                  <span>Select Date</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="mx-auto scale-110"
                    styles={{
                      caption: { color: '#374151', fontWeight: 'bold', fontSize: '1.4rem', marginBottom: '1rem' },
                      day: { 
                        margin: '6px', 
                        borderRadius: '12px',
                        width: '3rem',
                        height: '3rem',
                        fontSize: '1.1rem'
                      },
                      months: { display: 'flex', justifyContent: 'center' },
                      month: { margin: '0 auto' },
                      nav: { marginBottom: '1rem' },
                      nav_button: { padding: '0.5rem' },
                      head_cell: { fontSize: '1.1rem', padding: '0.5rem' }
                    }}
                    disabled={{ before: new Date(new Date().setHours(0,0,0,0)) }}
                  />
                </div>
                {selectedDate && (
                  <div className="mt-4 p-4 bg-green-100 rounded-xl border border-green-200">
                    <p className="text-green-800 font-medium text-center">
                      Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card> */}

            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <Clock className="h-6 w-6 text-blue-600" />
                  <span>Set Available Time Range</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex flex-col items-center">
                    <label className="text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={selectedStartTime || ""}
                      onChange={e => setSelectedStartTime(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <span className="mx-2 text-gray-500 font-semibold">to</span>
                  <div className="flex flex-col items-center">
                    <label className="text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={selectedEndTime || ""}
                      onChange={e => setSelectedEndTime(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>
                {(selectedStartTime && selectedEndTime) && (
                  <div className="mt-4 p-3 bg-blue-100 rounded-xl border border-blue-200 text-center">
                    <span className="text-blue-800 font-medium">
                      Available from {selectedStartTime} to {selectedEndTime}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time Slot Selection */}
            {/* <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <Clock className="h-6 w-6 text-purple-600" />
                  <span>Select Time Slot</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {availableTimeSlots.map((timeSlot) => (
                    <Button
                      key={timeSlot}
                      variant={selectedTimeSlot === timeSlot ? "default" : "outline"}
                      onClick={() => setSelectedTimeSlot(timeSlot)}
                      className={cn(
                        "h-12 text-base font-medium transition-all duration-200",
                        selectedTimeSlot === timeSlot
                          ? "bg-purple-600 hover:bg-purple-700 shadow-md"
                          : "border-2 hover:border-purple-300 hover:bg-purple-50"
                      )}
                    >
                      {timeSlot}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            {/* Summary */}
            {selectedPractitioner  && selectedTimeSlot && (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-amber-800">Booking Summary</h3>
                    <p className="text-amber-700">
                      <span className="font-medium">{selectedPractitionerData?.name}</span> will be available on{' '}
                      <span className="font-medium">{selectedTimeSlot}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DrawerFooter className="px-8 pb-8">
          <div className="flex space-x-4 max-w-2xl mx-auto w-full">
            <Button
              onClick={handleSaveWeeklySchedule}
              disabled={!selectedPractitioner || !selectedStartTime || !selectedEndTime || !selectedDayOfWeek}
              className="flex-1 h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Link className="h-5 w-5 mr-2" />
              Link Host
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="h-12 px-8 text-lg">
                Cancel
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default PractitionerManagementDrawer;