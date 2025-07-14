import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Phone, Mail, Plus, Edit3, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  _id: string;
  firstName: string;
  lastName: string;
  service: string;
  date: string;
  timeSlot: string;
  phone: string;
  email: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  host: string;
}

interface Host {
  name: string;
  experience: number | string;
}

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hosts, setHosts] = useState<Record<string, Host>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User not authenticated');
      }
      const { id: businessId } = JSON.parse(userData);
      const response = await fetch(`http://localhost:3000/api/business/${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business data');
      }
      const data = await response.json();
      setBusiness(data.business);
    } catch (err) {
      setBusiness(null);
    }
  };

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User not authenticated');
      }
      
      const { id: businessId } = JSON.parse(userData);
      
      const response = await fetch(`http://localhost:3000/api/booking/${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data.bookings);

      const hostPromises = data.bookings.map((booking: Booking) =>
        fetch(`http://localhost:3000/api/practitioner/get/${booking.host}`).then(res => res.json())
      );
      const hostResponses = await Promise.all(hostPromises);
      const hostMap = hostResponses.reduce((acc, response, index) => {
        acc[data.bookings[index].host] = response.practitioner || { name: 'Unknown', experience: 'N/A' };
        return acc;
      }, {} as Record<string, Host>);
      setHosts(hostMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewBooking = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const { id: businessId } = JSON.parse(userData);
      navigate(`/business/${businessId}/new-booking`);
    }
  };

  const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-100 p-4 lg:p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-5">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl animate-pulse-once">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent drop-shadow-md">
            All Your Bookings 
          </h1>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
            Seamlessly manage your appointments with real-time insights and stunning visuals
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-100 hover:bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{confirmedBookings.length}</p>
                <p className="text-gray-600 font-semibold">Confirmed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-100 hover:bg-gradient-to-r from-yellow-50 to-orange-50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingBookings.length}</p>
                <p className="text-gray-600 font-semibold">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-100 hover:bg-gradient-to-r from-purple-50 to-blue-50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                <p className="text-gray-600 font-semibold">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-700 to-blue-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">Upcoming Appointments</h2>
              </div>
              <button 
                onClick={handleNewBooking}
                className="bg-white/20 text-white px-5 py-2 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus size={18} />
                <span className="font-semibold text-base">New Appointment</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-purple-700 animate-spin mb-4 drop-shadow-md" />
                <p className="text-gray-700 text-lg font-medium">Loading appointments...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <AlertCircle size={56} className="mx-auto text-red-600 mb-6 drop-shadow-md" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Error</h3>
                <p className="text-gray-700 text-base mb-6">{error}</p>
                <button 
                  onClick={fetchBookings}
                  className="bg-gradient-to-r from-purple-700 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-purple-800 hover:to-blue-800 transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
                >
                  <RefreshCw size={18} />
                  <span className="font-semibold">Retry Now</span>
                </button>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar size={56} className="mx-auto text-gray-400 mb-6 drop-shadow-md" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Appointments</h3>
                <p className="text-gray-700 text-base mb-6">Kick off with your first booking today!</p>
                <button 
                  onClick={handleNewBooking}
                  className="bg-gradient-to-r from-purple-700 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-purple-800 hover:to-blue-800 transition-all duration-300 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
                >
                  <Plus size={18} />
                  <span className="font-semibold">Create Now</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => {
                  const host = hosts[booking.host] || { name: 'Unknown', experience: 'N/A' };
                  return (
                    <div
                      key={booking._id}
                      className={`border-2 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                        booking.status === 'confirmed'
                          ? 'border-green-200 bg-gradient-to-tr from-green-50 to-white hover:border-green-300'
                          : 'border-yellow-200 bg-gradient-to-tr from-yellow-50 to-white hover:border-yellow-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-4">
                          {/* Client and Host Info */}
                          <div className="flex items-center space-x-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                              booking.status === 'confirmed'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                : 'bg-gradient-to-r from-yellow-500 to-orange-600'
                            }`}>
                              <User size={24} className="text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{`${booking.firstName} ${booking.lastName}`}</h3>
                              <p className="text-sm text-gray-700 font-medium">{booking.service}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-700">
                            <User size={18} className="text-purple-600" />
                            <span className="font-medium">Host: {host.name} <span className="text-xs text-gray-500">({host.bio} )</span></span>
                          </div>

                          {/* Booking Details */}
                          <div className="flex space-x-6 text-sm text-gray-700">
                            <div className="flex items-center space-x-2">
                              <Calendar size={18} className="text-blue-600" />
                              <span className="font-medium">{format(new Date(booking.date), "EEEE, MMMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock size={18} className="text-purple-600" />
                              <span className="font-medium">{booking.timeSlot}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col items-end space-y-4 ml-6">
                          <div className="flex items-center space-x-2">
                            {booking.status === 'confirmed' ? (
                              <CheckCircle size={18} className="text-green-600" />
                            ) : (
                              <AlertCircle size={18} className="text-yellow-600" />
                            )}
                            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase shadow-sm ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                         {booking.status === 'pending' && <button
                            onClick={() => setDropdownOpenId(dropdownOpenId === booking._id ? null : booking._id)}
                            className="flex items-center space-x-1.5 text-purple-700 hover:text-purple-900 font-semibold text-sm px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>}
                          {dropdownOpenId === booking._id && booking.status === 'pending' && (
                            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                              {['pending', 'confirmed', 'cancelled'].map((statusOption) => (
                                <button
                                  key={statusOption}
                                  onClick={async () => {
                                    setDropdownOpenId(null);
                                    if (booking.status !== statusOption) {
                                      try {
                                        const response = await fetch(`http://localhost:3000/api/booking/${booking._id}/status`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ status: statusOption, business: business?._id }),
                                        });
                                        if (!response.ok) throw new Error('Failed to update status');
                                        fetchBookings();
                                      } catch (err) {
                                        toast({ title: "Error", description: "Failed to update booking status", variant: "destructive" });
                                      }
                                    }
                                  }}
                                  className={`block w-full text-left px-4 py-2 text-sm rounded-md ${
                                    booking.status === statusOption
                                      ? 'bg-purple-100 text-purple-800 font-semibold'
                                      : 'hover:bg-purple-50'
                                  } transition-all duration-200`}
                                >
                                  {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;