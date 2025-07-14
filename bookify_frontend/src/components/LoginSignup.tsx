

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { log } from 'console';

interface LoginSignupProps {
  onLogin: () => void;
}

const LoginSignup: React.FC<LoginSignupProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingVerificationCode, setIsSendingVerificationCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    onlineBooking: false,
    verificationSent: false,
    verificationCode: '',
    isVerified: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data in localStorage
        console.log("data", data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        navigate('/');
        
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${data.user.firstName}!`,
        });

        onLogin();
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive"
      });
      console.error('Login error:', error);
    }
  };

  const handleRegister = async () => {
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          businessName: formData.businessName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          website: formData.website,
          description: formData.description,
          onlineBooking: formData.onlineBooking
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Registration Successful!",
          description: "Your account has been created. Please login.",
        });
        
        // Switch to login form
        setIsLogin(true);
        
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          businessName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          address: '',
          website: '',
          description: '',
          onlineBooking: false,
          verificationSent: false,
          verificationCode: '',
          isVerified: false
        });
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Unable to create account",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive"
      });
      console.error('Registration error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    setIsSendingVerificationCode(true);
  try {
    const response = await fetch('http://localhost:3000/api/verification-code/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      toast({
        title: "Verification Code Sent",
        description: "Please check your email for the verification code.",
      });
      setIsSendingVerificationCode(false);
      setFormData({
        ...formData,
        verificationSent: true,
      });
      setIsRegistering(false);
    } else {
      toast({
        title: "Failed to Send Verification Code",
        description: data.message || "Unable to send verification code",
        variant: "destructive",
      });
      setIsSendingVerificationCode(false);
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Unable to connect to server. Please try again.",
      variant: "destructive",
    });
    console.error('Verification code error:', error);
    setIsSendingVerificationCode(false);
  }
  }

  const handleVerifyCode = async () => {
    setIsVerifyingCode(true);

    try {
      console.log(formData.email, formData.verificationCode);
      const response = await fetch('http://localhost:3000/api/verification-code/verify', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code: formData.verificationCode,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Verification Code Verified",
          description: "Please fill in your details to create your account.",
        });
        setIsVerifyingCode(false);
        setIsRegistering(true);
        setFormData({
          ...formData,
          isVerified: true,
        });
      }
      else {
        toast({
          title: "Verification Code Failed",
          description: data.message || "Unable to verify verification code",
          variant: "destructive",
        });
        setIsVerifyingCode(false);
        setIsRegistering(true);
      }
    } catch (error) {
      toast({
        title: "Error",   
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      });
      console.error('Verification code error:', error);
      setIsVerifyingCode(false);
      setIsRegistering(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md m-10  ">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">Bookify</span>
          </div>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Welcome back to your business dashboard' : 'Start growing your business today'}
          </p>
        </div>

        {/* Form Card */}
        <div
          className={`bg-white rounded-lg shadow-lg p-8 transition-all duration-200 ${
            !isLogin ? 'w-[480px] max-w-2xl' : ''
          }`}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-gray-600 text-sm">
              {isLogin
                ? 'Enter your credentials to access your dashboard'
                : 'Fill in your details to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isRegistering}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
               {!formData.verificationSent && <Button
                  type="button"
                  onClick={handleSendVerificationCode}
                  className="mt-4 mx-auto block"
                  disabled={isSendingVerificationCode || isRegistering}
                >
                  {isSendingVerificationCode ? 'Sending...' : isRegistering ? 'Registering...' : 'Send Verification Code'}
                </Button>}  

                {formData.verificationSent && !formData.isVerified && (
                  <div className="mt-4">
                    <Label htmlFor="verificationCode">
                      Verification Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="verificationCode"
                      name="verificationCode"
                      type="text"
                      required
                      value={formData.verificationCode}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    {!formData.isVerified && <div className="flex space-x-4 mt-4">
                      <Button
                        type="button"
                        onClick={handleVerifyCode}
                        className="mt-4"
                        disabled={isVerifyingCode || isRegistering}
                      >
                        {isVerifyingCode ? 'Verifying...' : isRegistering ? 'Registering...' : 'Verify Code'}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSendVerificationCode}
                        className="mt-4 border-2 border-black bg-transparent text-black hover:bg-black hover:text-white"
                        disabled={isSendingVerificationCode || isRegistering}
                      >
                        {isSendingVerificationCode ? 'Resending...' : isRegistering ? 'Registering...' : 'Resend Code'}
                      </Button>
                    </div>}
                  </div>
                )}

                {formData.isVerified && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="firstName">
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="businessName">
                        Business Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="+977-9801234567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">
                        Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">
                        Website (Optional)
                      </Label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="https://yourbusiness.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">
                        Business Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="Describe your business..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="onlineBooking">
                        Online Meeting Available?
                      </Label>
                      <div className="flex items-center gap-4 mt-1">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="onlineBookingYes"
                            name="onlineBooking"
                            value="true"
                            checked={formData.onlineBooking === true}
                            onChange={() => handleInputChange({ target: { name: 'onlineBooking', value: true } })}
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="onlineBookingNo"
                            name="onlineBooking"
                            value="false"
                            checked={formData.onlineBooking === false}
                            onChange={() => handleInputChange({ target: { name: 'onlineBooking', value: false } })}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="password">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {isLogin  && <div>
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>  }

            {isLogin && <div>
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>}

            {formData.isVerified && <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2.5 mt-6"
            >
              {isLoading ? 'Please wait...' : 'Create Account'}
            </Button>}

            {isLogin && <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2.5 mt-6"
            >
              {isLoading ? 'Please wait...' :  'Sign In' }
            </Button>}
          </form>

          {/* Toggle between login/signup */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
