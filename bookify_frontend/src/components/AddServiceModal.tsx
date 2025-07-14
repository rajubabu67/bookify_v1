import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { log } from 'console';

interface Service {
  id: string;
  name: string;
  description: string;
}

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onAddService: (serviceName: string) => void;
  onDeleteService: (serviceName: string) => void;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({ isOpen, onClose, services, onAddService, onDeleteService }) => {
  const [newServiceName, setNewServiceName] = useState('');

  const handleDeleteService = async (serviceName: string) => {
    try {
      const userData = localStorage.getItem('user');
      const user = JSON.parse(userData || '{}');
      const businessId = user.id;

      const response = await fetch('http://localhost:3000/api/service/delete', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: businessId,
          serviceName: serviceName
        }),
      });

      console.log(response);

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      console.log('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
    }
    onDeleteService(serviceName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newServiceName.trim()) return;

    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData || '{}');
    const businessId = user.id;
    console.log("businessId", businessId);
    if (!businessId) {
      console.error('No business ID found');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/service/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: businessId,
          serviceNames: [newServiceName.trim()],
        }),
      });

      console.log(response);

      if (!response.ok) {
        throw new Error('Failed to add service');
      }

      const data = await response.json();
      console.log('Service added successfully:', data);
      onClose();
    } catch (error) {
      console.error('Error adding service:', error);
    }
    if (newServiceName.trim()) {
      onAddService(newServiceName.trim());
      setNewServiceName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manage Services</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="Enter new service name"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Service</span>
            </button>
          </div>
        </form>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {services.map((service,i) => (
            <div
              key={i}
              className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 flex items-center justify-between"
            >
              <span className="text-purple-700 font-medium">{service}</span>
              <button
                onClick={() => handleDeleteService(service)}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;






