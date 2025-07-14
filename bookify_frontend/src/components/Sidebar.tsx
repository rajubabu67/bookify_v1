
import React from 'react';
import { Calendar, Users, BookOpen, FileText, MessageCircle, LogOut, Zap, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Users },
    { id: 'bookings', label: 'Customer Bookings', icon: BookOpen },
    { id: 'schedule', label: 'Manage Schedule', icon: Calendar },
    { id: 'holders', label: 'Add Hosts', icon: Users },
    { id: 'profile', label: 'Business Profile', icon: User },
    { id: 'api-docs', label: 'Developer Tools', icon: FileText },
    { id: 'contact', label: 'Help & Support', icon: MessageCircle },
  ];

  const navigate = useNavigate()

  return (
    <div className="fixed left-0 top-0 w-64 bg-white shadow-lg h-full flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
            <img src="../../../favicon.ico" className='w-15 h-10' alt="" />
          <span className="text-xl font-bold text-gray-800">Bookify</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.label === "Manage Schedule" ? navigate('/weekly-schedule') 
                  : setActiveTab(item.id)}
                }
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

       
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
