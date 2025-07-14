import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, User, Mail, Phone, MessageSquare, Home, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<any>(null);
  const [hostData, setHostData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hostLoading, setHostLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!bookingId) {
          throw new Error('Missing required parameters');
        }
        const response = await fetch(`http://localhost:3000/api/booking/get/${bookingId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        const data = await response.json();
        setBookingData(data.booking);

        // Fetch host details if host ID is available
        if (data.booking.host) {
          const hostResponse = await fetch(`http://localhost:3000/api/practitioner/get/${data.booking.host}`);
          if (!hostResponse.ok) {
            throw new Error('Failed to fetch host details');
          }
          const hostData = await hostResponse.json();
          setHostData(hostData.practitioner); // Adjust based on API response structure
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to load booking or host details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setHostLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  if (isLoading || hostLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Booking not found</h2>
          <Button
            onClick={() => navigate('/')}
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className=" min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6 lg:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-scale-in">
              <CheckCircle size={60} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles size={20} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl mb-10 font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            🎉 Your appointment with <strong>{hostData?.name || 'Your Host'}</strong> has been successfully scheduled. We're excited to work with you!
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Booking Details Card */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <Calendar className="w-6 h-6" />
                  <span>Booking Details</span>
                </h2>
              </div>
              
              <div className="p-8 space-y-6">
                {/* Booking Reference */}
                <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Star size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Booking Reference</p>
                    <p className="text-2xl font-bold text-gray-800">{bookingId}</p>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {bookingData.firstName} {bookingData.lastName}
                    </p>
                    <p className="text-green-600 font-semibold">Primary Contact</p>
                  </div>
                </div>

                {/* Contact Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4 p-6 bg-blue-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Mail size={20} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-lg font-bold text-gray-800 break-words truncate md:whitespace-normal md:break-all" style={{ wordBreak: 'break-all' }}>
                        {bookingData.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-6 bg-purple-50 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <Phone size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                      <p className="text-lg font-bold text-gray-800">{bookingData.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Practitioner Information */}
                {hostData && (
                  <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border-2 border-teal-200">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <User size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Your Host</p>
                      <p className="text-2xl font-bold text-gray-800">{hostData.name}</p>
                      <p className="text-md text-gray-600">{hostData.bio || 'Not specified'} </p>
                    </div>
                  </div>
                )}
                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                      <Calendar size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Date</p>
                      <p className="text-lg font-bold text-gray-800">
                        {bookingData.date ? format(new Date(bookingData.date), "EEEE, MMMM d, yyyy") : 'Date not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
                      <Clock size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Time</p>
                      <p className="text-3xl font-black text-pink-600">{bookingData.timeSlot}</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {bookingData.message && (
                  <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center mt-1">
                      <MessageSquare size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Additional Message</p>
                      <p className="text-gray-700 leading-relaxed">{bookingData.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next Steps Sidebar */}
          <div className="space-y-6">
            {/* Next Steps Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Sparkles size={20} />
                  <span>What's Next?</span>
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Email Confirmation</p>
                      <p className="text-sm text-gray-600">Sent to your inbox immediately</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <Phone size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Team Contact</p>
                      <p className="text-sm text-gray-600">Within 24 hours via phone or email</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                      <Calendar size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Calendar Invite</p>
                      <p className="text-sm text-gray-600">Sent 48 hours before meeting</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => navigate('/')}
              className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <Home size={20} />
              <span>Back to Business</span>
            </Button>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-gray-700 font-medium">Thank you for choosing us for your business needs!</span>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;