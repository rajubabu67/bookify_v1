import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, User, Mail, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PractitionerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPractitionerModal = ({ isOpen, onClose }: PractitionerDrawerProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    businessId: "",
    name: "",
    bio: "",
    email: "",
    phone: "",
    linkedServices: [] as string[],
    active: true,
  });

  const [services, setServices] = useState([]);

  const fetchServices = async () => {
    try {
      const userData = localStorage.getItem('user');
      const user = JSON.parse(userData || '{}');
      const businessId = user.id;

      const response = await fetch(`http://localhost:3000/api/service/get/${businessId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setServices(data[0].serviceNames || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleServiceToggle = (service: string) => {
        console.log(service);

    setFormData(prev => {
      const isServiceLinked = prev.linkedServices.includes(service);
      console.log(prev.linkedServices);
      if (isServiceLinked) {
        // Unset/remove the service
        return {
          ...prev,
          linkedServices: prev.linkedServices.filter(s => s !== service)
        };
      } else {
        // Set/add the service
        return {
          ...prev,
          linkedServices: [...prev.linkedServices, service]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting practitioner data:", formData);

    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData || '{}');
    const businessId = user.id;

    const response = await fetch('http://localhost:3000/api/practitioner/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({...formData, businessId}),
    });

    if (!response.ok) {
      throw new Error('Failed to add practitioner');
    }

    const data = await response.json();
    console.log(data);
    
    toast({
      title: "Practitioner Added",
      description: "The practitioner has been successfully added to the system.",
      duration: 3000,
    });
    setFormData({
      businessId: businessId,
      name: "",
      bio: "",
      email: "",
      phone: "",
      linkedServices: [] as string[],
      active: true,
    });
    onClose();
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Add hosts</h2>
        <p className="text-gray-600 text-base">
          Fill out the form below to add a new host to your business. Hosts can be assigned to services and will appear in your schedule.
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white rounded-3xl shadow border border-gray-100 space-y-8">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 rounded-full p-2">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>   
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-600">Basic details about the host</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20">

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter host's full name"
                className="hover:border-purple-300 min-h-[50px]  focus:border-purple-500 transition-colors duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
              Biography <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about the host's background and expertise"
              className="hover:border-purple-300 focus:border-purple-500 transition-colors duration-200 min-h-[100px]"
              required
            />
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              <p className="text-sm text-gray-600">How clients can reach the host</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="host@example.com"
                className="hover:border-purple-300 focus:border-purple-500 transition-colors duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <Input
              
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="9873498433"
                className=" hover:border-purple-300 focus:border-purple-500 transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Service Selection Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 rounded-full p-2">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Service Selection</h3>
              <p className="text-sm text-gray-600">Choose the services this host offers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service,i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  formData.linkedServices.includes(service)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => handleServiceToggle(service)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded border-2 transition-colors duration-200 ${
                      formData.linkedServices.includes(service)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {formData.linkedServices.includes(service) && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-gray-700">{service}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t">
          <Button
            type="submit"
            className="w-full h-70 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 text-lg transition-all duration-300 transform hover:scale-[1.02]"
          >
            Add Practitioner
          </Button>
        </div>
      </form>
    </div>
  );
};
