import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardOverview from '../components/DashboardOverview';
import BookingsPage from '../components/BookingsPage';
import SchedulePage from '../components/SchedulePage';
import ProfilePage from '../components/ProfilePage';
import ApiDocsPage from '../components/ApiDocsPage';
import ContactPage from '../components/ContactPage';
import LoginSignup from '../components/LoginSignup';
import { AddPractitionerModal } from '../components/AddPractitionerModal';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
    } else {
      navigate('/login');
    }
    
    setIsLoading(false);
  }, [navigate]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Clear stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    navigate('/login');
  };

  const handleNewBooking = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const { id: businessId } = JSON.parse(userData);
      navigate(`/business/${businessId}/new-booking`);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'bookings':
        return <BookingsPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'profile':
        return <ProfilePage />;
      case 'api-docs':
        return <ApiDocsPage onTestBooking={handleNewBooking} />;
      case 'contact':
        return <ContactPage />;
      case 'holders':
        return <AddPractitionerModal isOpen={true} onClose={() => {}} />;
      default:
        return <DashboardOverview />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 ml-64 transition-all duration-300 ease-in-out">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;