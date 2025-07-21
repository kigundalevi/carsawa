"use client";

import { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader, UserPlus, X, MapPin, Navigation, ExternalLink, Map } from 'lucide-react';

import Link from 'next/link';
import { authAPI } from '@/services/api';

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

/**
 * Register Page Component
 * 
 * Allows users to create a new account with profile image upload and location selection
 */
export default function Register() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showMapSelection, setShowMapSelection] = useState(false);

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

  // Load Google Maps API
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsMapLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setErrorMessage('Failed to load map. Please try refreshing the page.');
      };
      
      document.head.appendChild(script);
    } else if (window.google) {
      setIsMapLoaded(true);
    }
  }, []);

  // Initialize map when map selection is shown
  useEffect(() => {
    if (showMapSelection && isMapLoaded && mapRef.current && !mapInstance.current) {
      initializeMap();
    }
  }, [showMapSelection, isMapLoaded]);

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    // Default location (Nairobi, Kenya)
    const defaultLocation = { lat: -1.286389, lng: 36.817223 };
    
    // Create map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Create marker
    markerInstance.current = new window.google.maps.Marker({
      position: defaultLocation,
      map: mapInstance.current,
      draggable: true,
      title: 'Your Business Location'
    });

    // Handle marker drag
    markerInstance.current.addListener('dragend', (event: any) => {
      const position = event.latLng;
      updateLocationFromCoords(position.lat(), position.lng());
    });

    // Handle map click
    mapInstance.current.addListener('click', (event: any) => {
      const position = event.latLng;
      markerInstance.current.setPosition(position);
      updateLocationFromCoords(position.lat(), position.lng());
    });

    // Add places autocomplete
    const searchBox = document.getElementById('mapSearch') as HTMLInputElement;
    if (searchBox) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchBox);
      autocomplete.bindTo('bounds', mapInstance.current);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const location = place.geometry.location;
          mapInstance.current.setCenter(location);
          mapInstance.current.setZoom(15);
          markerInstance.current.setPosition(location);
          
          setLocationData({
            address: place.formatted_address || place.name || '',
            latitude: location.lat(),
            longitude: location.lng()
          });
        }
      });
    }
  };

  const updateLocationFromCoords = async (lat: number, lng: number) => {
    try {
      // Use Google's Geocoding service to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
        if (status === 'OK' && results[0]) {
          setLocationData({
            address: results[0].formatted_address,
            latitude: lat,
            longitude: lng
          });
        } else {
          setLocationData({
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            latitude: lat,
            longitude: lng
          });
        }
      });
    } catch (error) {
      console.error('Error getting address:', error);
      setLocationData({
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latitude: lat,
        longitude: lng
      });
    }
  };

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
        
        setLocationData({
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          latitude,
          longitude
        });

        // If map is loaded, update map position
        if (mapInstance.current && markerInstance.current) {
          const newPosition = { lat: latitude, lng: longitude };
          mapInstance.current.setCenter(newPosition);
          mapInstance.current.setZoom(15);
          markerInstance.current.setPosition(newPosition);
          updateLocationFromCoords(latitude, longitude);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setErrorMessage('Unable to get your current location. Please select on the map.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
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
              
              {/* Enhanced Location Section with Embedded Map */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Business Location
                </label>
                
                {!showMapSelection && !locationData.address && (
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
                      onClick={() => setShowMapSelection(true)}
                      disabled={!isMapLoaded}
                      className="w-full flex justify-center items-center py-2 px-4 border border-neutral-300 text-secondary hover:bg-neutral-50 rounded-md transition-colors disabled:opacity-50"
                    >
                      <Map className="w-4 h-4 mr-2" />
                      {isMapLoaded ? 'Select on Map' : 'Loading Map...'}
                    </button>
                  </div>
                )}

                {/* Map Selection Interface */}
                {showMapSelection && (
                  <div className="space-y-4 p-4 border border-neutral-200 rounded-md bg-white">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-secondary">Select Your Business Location</h3>
                      <button
                        type="button"
                        onClick={() => setShowMapSelection(false)}
                        className="text-secondary-light hover:text-secondary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Search Box */}
                    <div>
                      <input
                        id="mapSearch"
                        type="text"
                        placeholder="Search for your business address..."
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      />
                      <p className="text-xs text-secondary-light mt-1">
                        Search for an address or click/drag the marker on the map
                      </p>
                    </div>
                    
                    {/* Map Container */}
                    <div 
                      ref={mapRef}
                      className="w-full h-64 border border-neutral-300 rounded-md"
                      style={{ minHeight: '256px' }}
                    />
                    
                    {/* Current Selection Display */}
                    {locationData.address && (
                      <div className="p-3 bg-success/10 border border-success/20 rounded-md">
                        <p className="text-sm font-medium text-success">Selected Location:</p>
                        <p className="text-xs text-secondary mt-1">{locationData.address}</p>
                        <p className="text-xs text-secondary-light">
                          {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                        </p>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowMapSelection(false)}
                        className="flex-1 py-2 px-4 border border-neutral-300 text-secondary rounded-md hover:bg-neutral-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="flex-1 py-2 px-4 border border-primary text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                      >
                        {isGettingLocation ? 'Getting...' : 'Use GPS'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMapSelection(false)}
                        disabled={!locationData.address}
                        className="flex-1 py-2 px-4 bg-primary text-black rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50"
                      >
                        Confirm Location
                      </button>
                    </div>
                  </div>
                )}

                {/* Location Confirmation */}
                {locationData.address && !showMapSelection && (
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
                          setShowMapSelection(false);
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