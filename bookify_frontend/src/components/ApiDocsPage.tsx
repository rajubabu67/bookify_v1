import React, { useState } from 'react';
import { Copy, ExternalLink, MapPin, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface ApiDocsPageProps {
  onTestBooking?: () => void;
}

const ApiDocsPage: React.FC<ApiDocsPageProps> = ({ onTestBooking }) => {
  const [businessId, setBusinessId] = useState('your-business-id');
  const [copiedItem, setCopiedItem] = useState('');
  const { toast } = useToast();

  // Fetch businessId from localStorage if available
  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.id) {
          setBusinessId(parsed.id);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  const bookingUrl = `http://localhost:8080/business/${businessId}/new-booking`;

  const copyToClipboard = (text: string, item: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    toast({
      title: "Copied!",
      description: `${item} copied to clipboard`,
    });
    setTimeout(() => setCopiedItem(''), 2000);
  };

  const CopyButton = ({ text, item }: { text: string; item: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(text, item)}
      className="ml-2"
    >
      {copiedItem === item ? (
        <CheckCircle2 size={16} className="text-green-600" />
      ) : (
        <Copy size={16} />
      )}
    </Button>
  );

  return (
    <div className="p-8 animate-fade-in max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Easy Booking Integration
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Connect your business with customers in just 2 simple steps. No coding experience required!
        </p>
      </div>

      <Tabs defaultValue="setup" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="website">Website Integration</TabsTrigger>
          <TabsTrigger value="google-maps">Google Maps</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span>Get Your Business ID</span>
              </CardTitle>
              <CardDescription>
                Your unique business identifier that customers will use to book with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Business ID
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      disabled
                      type="text"
                      value={businessId}
                      onChange={(e) => setBusinessId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your business ID"
                    />
                    <CopyButton text={businessId} item="Business ID" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    This ID is provided when you create your Bookify account
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span>Your Booking URL</span>
              </CardTitle>
              <CardDescription>
                This is the direct link customers will use to book appointments with your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-800 break-all">
                    {bookingUrl}
                  </code>
                  <CopyButton text={bookingUrl} item="Booking URL" />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <ExternalLink size={16} className="text-blue-600" />
                <button
                  onClick={onTestBooking}
                  className="text-blue-600 hover:underline text-sm cursor-pointer"
                >
                  Test your booking flow
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="text-blue-600" size={24} />
                <span>Add to Your Website</span>
              </CardTitle>
              <CardDescription>
                Simple ways to add booking functionality to your existing website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Option 1: Direct Link Button</h3>
                <p className="text-gray-600 mb-3">Add a "Book Now" button that links directly to your booking page:</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <code className="text-sm text-gray-700 block mb-2">
                    {`<a href="${bookingUrl}" target="_blank" class="book-now-btn">`}<br/>
                    &nbsp;&nbsp;Book Appointment<br/>
                    {`</a>`}
                  </code>
                  <CopyButton text={`<a href="${bookingUrl}" target="_blank" class="book-now-btn">Book Appointment</a>`} item="HTML Button Code" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Option 2: Embedded Booking Widget</h3>
                <p className="text-gray-600 mb-3">Embed the booking form directly on your page:</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <code className="text-sm text-gray-700 block mb-2">
                    {`<iframe src="${bookingUrl}" width="100%" height="600" frameborder="0"></iframe>`}
                  </code>
                  <CopyButton text={`<iframe src="${bookingUrl}" width="100%" height="600" frameborder="0"></iframe>`} item="Embed Code" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tip</h4>
                <p className="text-blue-700 text-sm">
                  Send your web developer this URL and ask them to add a "Book Now" button that opens this link. 
                  That's all they need to know!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google-maps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="text-red-600" size={24} />
                <span>Google Maps Integration</span>
              </CardTitle>
              <CardDescription>
                Let customers book directly from your Google Business listing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Step-by-Step Instructions:</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      <span>Go to your Google Business Profile</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <span>Click "Add action button"</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                      <span>Select "Make an appointment"</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                      <span>Paste your booking URL</span>
                    </li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Your Booking URL:</h3>
                  <div className="bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-300">
                    <code className="text-sm font-mono text-gray-800 break-all block mb-2">
                      {bookingUrl}
                    </code>
                    <CopyButton text={bookingUrl} item="Google Maps URL" />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center space-x-2">
                  <CheckCircle2 size={18} />
                  <span>What happens next?</span>
                </h4>
                <p className="text-green-700 text-sm">
                  Once set up, customers will see a "Book Appointment" button on your Google Maps listing. 
                  When they click it, they'll be taken directly to your Bookify booking page!
                </p>
              </div>

          
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocsPage;
