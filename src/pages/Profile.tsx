import { useState } from 'react';
import { UserCircle, Mail, MapPin, Phone, Save, Camera } from 'lucide-react';

interface DealerProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
}

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<DealerProfile>(() => {
    // Try to load from localStorage, otherwise use default values
    const savedProfile = localStorage.getItem('dealerProfile');
    return savedProfile ? JSON.parse(savedProfile) : {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+254 712 345 678',
      location: 'Nairobi, Kenya',
      bio: 'Experienced car dealer specializing in luxury and high-end vehicles. Over 10 years in the automotive industry with a passion for connecting people with their dream cars.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    };
  });

  const [formData, setFormData] = useState<DealerProfile>(profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setProfile(formData);
      localStorage.setItem('dealerProfile', JSON.stringify(formData));
      setIsEditing(false);
      setIsSaving(false);
    }, 800);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dealer Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-secondary to-gray-700 h-32 relative">
          {isEditing ? (
            <button className="absolute right-4 bottom-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          ) : null}
        </div>

        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-white">
                <img 
                  src={formData.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing ? (
                <button className="absolute bottom-0 right-0 bg-primary text-black p-2 rounded-full hover:bg-primary-hover transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              ) : null}
            </div>
            
            <div className="flex-1">
              {!isEditing ? (
                <h2 className="text-2xl font-bold">{profile.name}</h2>
              ) : null}
              
              <div className="flex flex-wrap gap-4 mt-2">
                {!isEditing && (
                  <>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="sm:ml-auto">
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

          <div className="mt-10">
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  ></textarea>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-primary" />
                  About
                </h3>
                <p className="text-gray-600">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
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
