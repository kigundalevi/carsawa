import { useState, useEffect, ChangeEvent } from 'react';
import { Mail, MapPin, Phone, Save } from 'lucide-react';
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
    if (name === 'location') {
      setFormData(prev => ({
        ...prev,
        location: value,
      }));
    } else{
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const updatedProfile = await authAPI.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        location: formData.location,
        profileImage: formData.profileImage,
      });
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || formData);
    setError(null);
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
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
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
            <img
              src={profile.profileImage || '/default-avatar.png'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
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
            <div>
              <label htmlFor="profileImage" className="block text-sm font-medium mb-1">Profile Image URL</label>
              <input
                id="profileImage"
                name="profileImage"
                type="text"
                value={formData.profileImage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Listings</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Sales</span>
              <span className="font-semibold">47</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Bids</span>
              <span className="font-semibold">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Member Since</span>
              <span className="font-semibold">March 2023</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                className="h-4 w-4 text-primary rounded focus:ring-primary"
                defaultChecked
              />
              <label htmlFor="emailNotifications" className="ml-2 text-gray-600">
                Email Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smsNotifications"
                className="h-4 w-4 text-primary rounded focus:ring-primary"
                defaultChecked
              />
              <label htmlFor="smsNotifications" className="ml-2 text-gray-600">
                SMS Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="marketingEmails"
                className="h-4 w-4 text-primary rounded focus:ring-primary"
              />
              <label htmlFor="marketingEmails" className="ml-2 text-gray-600">
                Marketing Emails
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="publicProfile"
                className="h-4 w-4 text-primary rounded focus:ring-primary"
                defaultChecked
              />
              <label htmlFor="publicProfile" className="ml-2 text-gray-600">
                Public Profile
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}