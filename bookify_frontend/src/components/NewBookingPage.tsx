import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import 'react-day-picker/dist/style.css';

const NewBookingPage = () => {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [business, setBusiness] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date: undefined,
    timeSlot: '',
    message: '',
    onlineBooking: false,
    host: ''
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [hosts, setHosts] = useState([]);

  const fetchHosts = async () => {
    const response = await fetch(`http://localhost:3000/api/practitioner/get/business/${businessId}`);
    const data = await response.json();
    setHosts(data.practitioners);
  };

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        if (!businessId) {
          throw new Error('Business ID not provided');
        }
        const response = await fetch(`http://localhost:3000/api/business/${businessId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch business data');
        }
        const data = await response.json();
        setBusiness(data.business);
      } catch (err) {
        setBusiness(null);
        toast({
          title: "Error",
          description: "Failed to load business information",
          variant: "destructive"
        });
      }
    };

    fetchHosts();
    fetchBusiness();
  }, [businessId]);

  
const fetchTimeSlotsBasedOnDayAndHost = async () => {
  if (!formData.date || !formData.host) {
    setAvailableTimeSlots([]);
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/weekly-schedule/get/time-slots/bydayandhost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date: formData.date, hostId: formData.host })
    });
    const data = await response.json();
    console.log("Data:", data.slots);
    // Ensure data is an array, default to empty array if not
    setAvailableTimeSlots(Array.isArray(data.slots) ? data.slots : []);
  } catch (err) {
    console.error('Error fetching time slots:', err);
    setAvailableTimeSlots([]); // Set to empty array on error
  }
};

useEffect(() => {
  if (formData.date && formData.host) {
    fetchTimeSlotsBasedOnDayAndHost();
  } else {
    setAvailableTimeSlots([]); // Reset when date or host is cleared
  }
}, [formData.date, formData.host]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'host') {
      setFormData(prev => ({ ...prev, service: '', date: undefined, timeSlot: '' }));
      setAvailableTimeSlots([]);
    }
    

    if (field === 'timeSlot') {
      
        setFormData(prev => ({
          ...prev,
          timeSlot: value
        }));
      
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    if (!businessId) {
      setError('Business ID not provided');
      setIsLoading(false);
      return;
    }
  
    const currentDate = new Date(); // Current date and time
    const selectedDate = formData.date ? new Date(formData.date) : null;
    if (selectedDate && selectedDate <= currentDate) {
      setError('Please select a future date and time.');
      setIsLoading(false);
      return;
    }

    const bookingData = {
      ...formData,
      date: formData.date ? new Date(new Date(formData.date).setDate(new Date(formData.date).getDate() + 1)) : undefined,
      host: formData.host
    };

    console.log("Booking data:", bookingData);
  
    try {
      const response = await fetch(`http://localhost:3000/api/booking/create/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Booking failed');
      }
  
      if (formData.date && formData.timeSlot) {
        const selectedSlot = availableTimeSlots.find(slot => slot.time === formData.timeSlot);
        if (selectedSlot && selectedSlot._id) {
          await fetch(`http://localhost:3000/api/schedule/update-timeslot-status/${selectedSlot._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessId: business?._id,
              timeSlotId: selectedSlot._id,
              isBooked: true
            }),
          });
        }
      }
  
      const result = await response.json();
      toast({
        title: "Booking Successful!",
        description: "Your appointment has been scheduled.",
      });
      navigate(`/business/booking-confirmation/${result.booking._id}`);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      toast({
        title: "Booking Failed",
        description: err.message || 'Something went wrong',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 lg:p-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </Button>
          </div>
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6 shadow-xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Book Your Appointment with <br /> <span className='text-purple-600 font-family-cursive'> {business?.businessName.toUpperCase()}</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Fill in your details to schedule a personalized consultation with our team
            </p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Calendar className="w-6 h-6" />
              <span>Booking Information</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                  <p className="text-gray-600">Tell us about yourself</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    First Name *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Last Name *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className="h-12 pl-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="h-12 pl-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {business?.onlineBooking && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Meeting Type *
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
                        formData.onlineBooking === true
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-600 shadow-lg scale-105"
                          : "bg-white text-gray-800 border-gray-200 hover:border-purple-400"
                      }`}
                      onClick={() => handleInputChange('onlineBooking', true)}
                    >
                      Online
                    </button>
                    <button
                      type="button"
                      className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
                        formData.onlineBooking === false
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-600 shadow-lg scale-105"
                          : "bg-white text-gray-800 border-gray-200 hover:border-purple-400"
                      }`}
                      onClick={() => handleInputChange('onlineBooking', false)}
                    >
                      Offline
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Select Host</h3>
                  <p className="text-gray-600">Choose your preferred host for the service</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select Host *
                  </label>
                  <Select 
                    value={formData.host} 
                    onValueChange={(value) => handleInputChange('host', value)}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300">
                      <SelectValue placeholder="Choose a host" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      {hosts?.map((host) => (
                        <SelectItem key={host._id} value={host._id} className="py-3">
                          {host.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.host && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Available Services
                    </label>
                    <div className="min-h-12 p-3 border-2 border-gray-200 rounded-xl">
                      {hosts
                        ?.find(host => host._id === formData.host)
                        ?.linkedServices?.map((service, index) => (
                          <span 
                            key={index} 
                            className="inline-block m-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {service}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {formData.host && (
                <div className="mb-6 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    About {hosts?.find(h => h._id === formData.host)?.name}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {hosts?.find(h => h._id === formData.host)?.bio || 'No bio available for this host.'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Schedule</h3>
                  <p className="text-gray-600">Pick your preferred date and time</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select Date *
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal border-2 border-gray-200 hover:border-purple-500 rounded-xl transition-all duration-300",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 rounded-xl border-2" align="start">
                      <DayPicker
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => handleInputChange('date', date)}
                        disabled={{ before: new Date() }}
                        className="rounded-2xl"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse",
                          head_row: "flex",
                          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-purple-100 rounded",
                          day_selected: "bg-purple-600 text-white hover:bg-purple-700",
                          day_today: "bg-purple-100 text-purple-900",
                          day_disabled: "text-muted-foreground opacity-50"
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select Time *
                  </label>
                  <Select 
                    value={formData.timeSlot} 
                    onValueChange={(value) => handleInputChange('timeSlot', value)}
                    disabled={!formData.date || !formData.host}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300">
                      <Clock className="mr-3 h-5 w-5" />
                      <SelectValue placeholder={formData.date && formData.host ? "Choose time slot" : "Select host and date first"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 max-h-60 overflow-y-auto bg-white text-gray-800">
                      {Array.isArray(availableTimeSlots) ? (
                        availableTimeSlots.length > 0 ? (
                          availableTimeSlots.map((slot, index) => (
                            <SelectItem key={index} value={`${slot.startTime} - ${slot.endTime}`} className="py-3 hover:bg-purple-100">
                              <span className="font-semibold">{slot.startTime} - {slot.endTime}</span>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="py-3 px-4 text-gray-500">
                            {formData.date && formData.host 
                              ? "No available time slots for this date"
                              : "Please select a host and date first"}
                          </div>
                        )
                      ) : (
                        <div className="py-3 px-4 text-red-500">
                          Error: availableTimeSlots is not an array. Check API response.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <MessageSquare size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Additional Information</h3>
                  <p className="text-gray-600">Any special requests or notes</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Message (Optional)
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Tell us about your goals, specific needs, or any questions you have..."
                  rows={4}
                  className="border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300 resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 bg-red-100 border border-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center space-x-2 text-purple-700 font-medium">
                <svg className="animate-spin h-5 w-5 text-purple-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Submitting booking...
              </div>
            )}

            <div className="pt-6">
            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-bold rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
              disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.host || !formData.date || !formData.timeSlot}
            >
                <Calendar className="mr-3 h-6 w-6" />
                Confirm Your Booking
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewBookingPage;