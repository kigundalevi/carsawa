import { useState, useEffect, ChangeEvent } from 'react';
import { Mail, MapPin, Phone, Save, Camera, X } from 'lucide-react';
import { authAPI } from '../services/api';

interface DealerProfile {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  profileImage: string;
}

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [formData, setFormData] = useState<DealerProfile>({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    location: '',
    profileImage: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        const profileData: DealerProfile = {
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          whatsapp: userData.whatsapp || '',
          location: userData.location || '',
          profileImage: userData.profileImage || '',
        };
        setProfile(profileData);
        setFormData(profileData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image exceeds the maximum file size of 5MB');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('whatsapp', formData.whatsapp);
      formDataToSend.append('location', formData.location);
      if (selectedImage) {
        formDataToSend.append('profileImage', selectedImage);
      }

      const updatedProfile = await authAPI.updateProfile(formDataToSend);
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setSelectedImage(null);
      setPreviewUrl(null);
      setIsEditing(false);
      
      // Notify other components that profile has been updated using a custom event
      const profileUpdateEvent = new CustomEvent('profileUpdated', { 
        detail: { timestamp: Date.now(), profileImage: updatedProfile.profileImage } 
      });
      window.dispatchEvent(profileUpdateEvent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || formData);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
    setIsEditing(false);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dealer Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="relative w-32 h-32">
            {isEditing ? (
              <label className="cursor-pointer block w-full h-full">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={previewUrl || formData.profileImage || '/default-avatar.png'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow">
                  <Camera className="w-5 h-5 text-gray-600" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                <img
                  src={profile.profileImage || '/default-avatar.png'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {previewUrl && isEditing && (
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex-1">
            {!isEditing && (
              <>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{profile.whatsapp}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium mb-1">WhatsApp</label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}