"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader, UserPlus, X, MapPin, Navigation } from 'lucide-react';

import Link from 'next/link';
import { authAPI } from '@/services/api';

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

/**
 * Register Page Component
 * 
 * Allows users to create a new account with profile image upload and location selection
 */
export default function Register() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [locationData, setLocationData] = useState<LocationData>({
    address: '',
    latitude: 0,
    longitude: 0
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLocationOptions, setShowLocationOptions] = useState(false);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image exceeds the maximum file size of 5MB');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setErrorMessage(null);
    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setProfileImage(null);
    setPreviewUrl(null);
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setErrorMessage(null);

    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by this browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address from coordinates
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY`
          );
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const address = data.results[0].formatted;
            setLocationData({
              address,
              latitude,
              longitude
            });
          } else {
            setLocationData({
              address: `${latitude}, ${longitude}`,
              latitude,
              longitude
            });
          }
        } catch (error) {
          console.error('Error getting address:', error);
          setLocationData({
            address: `${latitude}, ${longitude}`,
            latitude,
            longitude
          });
        }
        
        setIsGettingLocation(false);
        setShowLocationOptions(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setErrorMessage('Unable to get your current location. Please enter manually.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleManualLocationInput = (address: string) => {
    setLocationData(prev => ({
      ...prev,
      address
    }));
  };

  const handleCoordinatesInput = (lat: string, lng: string) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (!isNaN(latitude) && !isNaN(longitude)) {
      setLocationData({
        address: `${latitude}, ${longitude}`,
        latitude,
        longitude
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long');
        return;
    }

    if (!locationData.address) {
      setErrorMessage('Please provide your location');
      return;
    }

    setIsSubmitting(true);

    const dealerData = {
      name,
      email,
      password,
      phone,
      whatsapp,
      location: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      profileImage: profileImage || undefined
    };

    try {
      await authAPI.register(dealerData);
      router.push('/login?registered=true');
    } catch (error: any) {
      console.error('Registration failed:', error);
      setErrorMessage(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-secondary-light">
          Join our community of car enthusiasts and dealers
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-md">
                {errorMessage}
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-secondary">
                  Full Name / Dealership Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-secondary">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
                <p className="mt-1 text-xs text-secondary-light">
                  Must be at least 8 characters long
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-secondary">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-secondary">
                  WhatsApp
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              {/* Enhanced Location Section */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Business Location
                </label>
                
                {!showLocationOptions && !locationData.address && (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="w-full flex justify-center items-center py-2 px-4 border border-primary text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Getting location...
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4 mr-2" />
                          Use Current Location
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowLocationOptions(true)}
                      className="w-full flex justify-center items-center py-2 px-4 border border-neutral-300 text-secondary hover:bg-neutral-50 rounded-md transition-colors"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Enter Manually
                    </button>
                  </div>
                )}

                {showLocationOptions && (
                  <div className="space-y-4 p-4 border border-neutral-200 rounded-md bg-neutral-50">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your business address"
                        value={locationData.address}
                        onChange={(e) => handleManualLocationInput(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g., -1.286389"
                          onChange={(e) => handleCoordinatesInput(e.target.value, locationData.longitude.toString())}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g., 36.817223"
                          onChange={(e) => handleCoordinatesInput(locationData.latitude.toString(), e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowLocationOptions(false)}
                        className="flex-1 py-2 px-4 border border-neutral-300 text-secondary rounded-md hover:bg-neutral-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="flex-1 py-2 px-4 bg-primary text-black rounded-md hover:bg-primary-hover transition-colors"
                      >
                        Use GPS
                      </button>
                    </div>
                  </div>
                )}

                {locationData.address && (
                  <div className="mt-3 p-3 bg-success/10 border border-success/20 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-success">Location Set</p>
                        <p className="text-xs text-secondary mt-1">{locationData.address}</p>
                        {locationData.latitude !== 0 && locationData.longitude !== 0 && (
                          <p className="text-xs text-secondary-light">
                            {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLocationData({ address: '', latitude: 0, longitude: 0 });
                          setShowLocationOptions(false);
                        }}
                        className="text-secondary-light hover:text-secondary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                <p className="mt-2 text-xs text-secondary-light">
                  Your location will be displayed to customers on a map to help them find your dealership.
                </p>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="profileImage" className="block text-sm font-medium text-secondary">
                  Profile Image
                </label>
                <div className="mt-2 flex items-center gap-4">
                  {previewUrl ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 p-1 bg-danger text-white rounded-full hover:bg-danger-hover"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <Camera className="w-8 h-8 text-neutral-500" />
                      <span className="mt-2 text-xs text-neutral-500">Add Image</span>
                      <input
                        id="profileImage"
                        name="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="mt-2 text-xs text-secondary-light">Upload one image. Max 5MB. Supported formats: JPEG, PNG, GIF.</p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-secondary">
                I agree to the{' '}
                <a href="#" className="font-medium text-primary hover:text-primary-hover">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-primary hover:text-primary-hover">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create account
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-secondary-light">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}