import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Clock } from 'lucide-react';
import { log } from 'console';

const DashboardOverview = () => {

  const [statsCards, setStatsCards] = useState([{
    title: 'Total Bookings',
    value: '',
    change: '',
    changeType: '',
    icon: Calendar,
    color: 'purple'
  },
  ])
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [business, setBusiness] = useState<any>(null);
  const [bookingsLength,setBookingsLength] = useState()

  const [hosts, setHosts] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const businessId = userData ? JSON.parse(userData).id : null;

    if (!businessId) {
      setBookingsError('Business ID not found.');
      setLoadingBookings(false);
      return;
    }

    fetch(`http://localhost:3000/api/business/${businessId}`)
      .then(res => res.json())
      .then(data => {
        setBusiness(data.business || null);
      })
      .catch(err => {
        console.error('Failed to fetch business data:', err);
      });

    setLoadingBookings(true);
    fetch(`http://localhost:3000/api/booking/${businessId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch bookings');
        return res.json();
      })
      .then(data => {

        setStatsCards(prevCards => {
          const updatedCards = [...prevCards]; // Copy the array
          updatedCards[0] = {
            ...updatedCards[0],                // Copy the original object
            value: data.bookings.length,                      // Update the value
            change: '',                     // Update other fields if needed
            changeType: 'increase'
          };
          return updatedCards;
        })
        setBookingsLength(data.bookings.length)
        // Optionally sort or limit to most recent bookings
        const bookings = Array.isArray(data.bookings) ? data.bookings : [];
        // Sort by createdAt or date descending, fallback to _id
        bookings.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return 0;
        });
        setRecentBookings(bookings.slice(0, 5)); // Show only 5 most recent
        setLoadingBookings(false);
      })
      .catch(err => {
        setBookingsError(err.message || 'Error loading bookings');
        setLoadingBookings(false);
      });
  }, []);

  // Fetch host details for each booking
  useEffect(() => {
    if (!recentBookings.length) return;

    const fetchHostDetails = async () => {
      try {
        const hostPromises = recentBookings.map(booking =>{
          return fetch(`http://localhost:3000/api/practitioner/get/${booking.host}`)
            .then(res => res.json())
        });

        const hostResponses = await Promise.all(hostPromises);

        console.log("Host responses:", hostResponses);
        
        setRecentBookings(prevBookings => 
          prevBookings.map((booking, index) => ({
            ...booking,
            hostName: hostResponses[index].practitioner?.name || 'Unknown',
          }))
        );
      } catch (err) {
        console.error('Failed to fetch host details:', err);
      }
    };

    fetchHostDetails();
  }, [recentBookings.length]);
  

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Bookify</h1>
          <p className="text-gray-600">
            Manage your appointments and grow your business with ease
          </p>
        </div>
        

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          const isIncrease = card.changeType === 'increase';
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  card.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  <Icon size={24} className={
                    card.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                  } />
                </div>
                <div className="flex items-center space-x-1">
                  <h3 className="text-5xl font-bold text-gray-700 mb-1">{card.value}</h3>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{card.title}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>This Week</option>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Client</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Host</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Time</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {booking.firstName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{booking.firstName + booking.lastName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{booking.hostName}</td>
                  <td className="py-4 px-6 text-gray-600">{booking.timeSlot}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{booking.date.split("T")[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
