import React, { useState, useEffect } from 'react';
import { Save, Edit, Camera, MapPin, Phone, Mail, Clock, Globe, User, Building2, FileText, Calendar, Star, Shield, Heart, Briefcase, Plus, Pencil } from 'lucide-react';
import AddServiceModal from './addServiceModal';
import { log } from 'console';

interface BusinessProfile {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  createdAt?: string;
  updatedAt?: string; 
  onlineBooking: boolean;
}

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<BusinessProfile>({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    onlineBooking: false
  });
  
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [services, setServices] = useState([]);

  
  const getTheServices = async () => {
    const userData = localStorage.getItem('user');
    let businessId = null;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        businessId = user.id || user._id;
      } catch (e) {
        console.error('Error parsing user data:', e);
        return;
      }
    }

    if (!businessId) {
      console.error('Missing businessId');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/service/get/${businessId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      
      setServices(data[0].serviceNames || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  
  useEffect(() => {
    // Load profile data from localStorage (user data stored during login)

    getTheServices()

    const userData = localStorage.getItem('user');
    // Fetch business details from backend rather than localStorage
    const token = localStorage.getItem('token');
    let businessId = null;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        businessId = user.id || user._id;
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
      }
    }
    if (businessId && token) {
      fetch(`http://localhost:3000/api/business/${businessId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.business) {
            setProfileData({
              firstName: data.business.firstName || '',
              lastName: data.business.lastName || '',
              businessName: data.business.businessName || '',
              email: data.business.email || '',
              phone: data.business.phone || '',
              address: data.business.address || '',
              website: data.business.website || '',
              description: data.business.description || '',
              onlineBooking: data.business.onlineBooking || false
            });
          }
        })
        .catch(err => {
          console.error('Error fetching business details:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    setIsLoading(false);
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/business/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BusinessProfile, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header with floating elements */}
      <div className="relative mb-12">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-3 flex-1">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Business Profile
                </h1>
                <p className="text-gray-600 mt-1 flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Manage your business information securely</span>
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsAddServiceModalOpen(true)}
            className="mr-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-2"
          >
            <Pencil size={18} className="text-white" /> 
            <span>Edit Services</span>
          </button>
          
          <div className="flex space-x-4">
            {isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-md"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-2"
              >
                <Edit size={18} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Avatar Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-center">
              <div className="relative inline-block group">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto shadow-2xl transform transition-all duration-300 group-hover:scale-110">
                  {profileData.businessName ? profileData.businessName.charAt(0).toUpperCase() : 'B'}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 bg-white rounded-full p-3 shadow-lg border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-110">
                    <Camera size={18} className="text-gray-600" />
                  </button>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-2">{profileData.businessName}</h2>
              <p className="text-gray-600 mb-4">{profileData.firstName} {profileData.lastName}</p>
              
              <div className="flex justify-center space-x-2">
                <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>{profileData.onlineBooking ? 'Offline/Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Our Services</h3>
            </div>
            {services.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {services.map((service,i) => (
                <div
                  key={i}
                  className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-purple-50 to-blue-100"
                >
                  <span className="text-1xl font-semibold text-purple-700 tracking-wide">
                    {service}
                  </span>
                </div>
              ))}
            </div> : <p className="text-gray-600">No services added yet</p>}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Business Information Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Business Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Building2 size={16} className="text-purple-600" />
                  <span>Business Name</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profileData.businessName}</p>
                )}
              </div>

              {/* Owner Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <User size={16} className="text-blue-600" />
                  <span>Owner Name</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                      />
                    </>
                  ) : (
                    <p className="col-span-2 text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profileData.firstName} {profileData.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Mail size={16} className="text-red-600" />
                  <span>Email Address</span>
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profileData.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Phone size={16} className="text-green-600" />
                  <span>Phone Number</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profileData.phone || 'Not provided'}</p>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Globe size={16} className="text-indigo-600" />
                  <span>Website</span>
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profileData.website || 'Not provided'}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <MapPin size={16} className="text-pink-600" />
                  <span>Business Address</span>
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                  />
                ) : (
                  <p className="text-gray-800 font-medium px-4 py-3 bg-gray-50 rounded-xl">{profileData.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Description */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Business Description</h3>
            </div>
            {isEditing ? (
              <textarea
                value={profileData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                placeholder="Tell us about your business..."
              />
            ) : (
              <p className="text-gray-700 leading-relaxed px-4 py-3 bg-gray-50 rounded-xl">{profileData.description || 'No description provided'}</p>
            )}

            <AddServiceModal
              isOpen={isAddServiceModalOpen}
              onClose={() => setIsAddServiceModalOpen(false)}
              services={services}
              onAddService={(serviceName: string)=>{
                setIsAddServiceModalOpen(false);
                setServices([...services, serviceName]);
              }}
              onDeleteService={(serviceName: string)=>{
                setIsAddServiceModalOpen(false);
                setServices(services.filter(service => service !== serviceName));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;