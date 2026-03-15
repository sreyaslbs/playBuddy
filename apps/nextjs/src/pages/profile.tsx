import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  User, 
  Mail, 
  MapPin, 
  Shield, 
  CreditCard, 
  Bell, 
  Settings, 
  ChevronRight,
  Save
} from 'lucide-react';
import { useAuth } from '@playbuddy/shared';
import { Colors, Spacing, Typography, Card, Button, Input } from '@playbuddy/ui';

export default function WebProfile() {
  const { user, role, metadata, updateUserData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(metadata?.displayName || user?.displayName || '');
  const [city, setCity] = useState(metadata?.defaultCity || '');
  const [state, setState] = useState(metadata?.defaultState || '');
  const [isSaving, setIsSaving] = useState(false);

  if (authLoading) return <div className="loading">Loading Profile...</div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserData({
        displayName: displayName.trim(),
        defaultCity: city.trim(),
        defaultState: state.trim()
      });
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const ProfileSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="profile-section">
      <h3 className="section-title">{title}</h3>
      <Card className="section-card">
        {children}
      </Card>
      <style jsx>{`
        .profile-section {
          margin-bottom: 32px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: ${Colors.secondary};
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        :global(.section-card) {
          padding: 0 !important;
          overflow: hidden;
        }
      `}</style>
    </div>
  );

  const ProfileItem = ({ icon: Icon, label, value, onClick }: any) => (
    <div className="profile-item" onClick={onClick}>
      <div className="item-left">
        <div className="icon-box">
          <Icon size={20} color={Colors.primary} />
        </div>
        <div className="item-info">
          <span className="item-label">{label}</span>
          {value && <span className="item-value">{value}</span>}
        </div>
      </div>
      {onClick && <ChevronRight size={20} color={Colors.border} />}
      <style jsx>{`
        .profile-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid ${Colors.background};
          cursor: ${onClick ? 'pointer' : 'default'};
          transition: background 0.2s;
        }
        .profile-item:last-child {
          border-bottom: none;
        }
        .profile-item:hover {
          background-color: ${onClick ? Colors.background + '50' : 'transparent'};
        }
        .item-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background-color: ${Colors.primary}15;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-info {
          display: flex;
          flex-direction: column;
        }
        .item-label {
          font-size: 15px;
          font-weight: 600;
          color: ${Colors.secondary};
        }
        .item-value {
          font-size: 13px;
          color: ${Colors.muted};
        }
      `}</style>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <Card>
          <div className="header-content">
            <div className="avatar-section">
              <div className="avatar">
                <User size={48} color={Colors.muted} />
              </div>
              <div className="user-info">
                <h1>{metadata?.displayName || user?.displayName || 'Sports Enthusiast'}</h1>
                <p className="email">{user?.email}</p>
                <div className="badges">
                  <span className="role-badge">{role === 'manager' ? 'Court Manager' : 'Player'}</span>
                  {metadata?.defaultCity && (
                    <span className="location-badge">
                      <MapPin size={12} /> {metadata.defaultCity}, {metadata.defaultState}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!isEditing && (
              <Button 
                title="Edit Profile" 
                variant="outline" 
                onPress={() => setIsEditing(true)} 
              />
            )}
          </div>
        </Card>
      </div>

      <div className="profile-content-grid">
        <div className="main-column">
          {isEditing ? (
            <ProfileSection title="Edit Personal Information">
              <div className="edit-form">
                <Input 
                  label="Full Name" 
                  value={displayName} 
                  onChangeText={setDisplayName} 
                  placeholder="Enter your name"
                />
                <div className="form-row">
                  <Input 
                    label="City" 
                    value={city} 
                    onChangeText={setCity} 
                    placeholder="e.g. Mumbai"
                  />
                  <Input 
                    label="State" 
                    value={state} 
                    onChangeText={setState} 
                    placeholder="e.g. MH"
                  />
                </div>
                <div className="form-actions">
                  <Button 
                    title="Cancel" 
                    variant="ghost" 
                    onPress={() => setIsEditing(false)} 
                  />
                  <Button 
                    title={isSaving ? "Saving..." : "Save Changes"} 
                    onPress={handleSave}
                    loading={isSaving}
                    icon={<Save size={18} />}
                  />
                </div>
              </div>
            </ProfileSection>
          ) : (
            <ProfileSection title="Account Settings">
              <ProfileItem icon={User} label="Personal Information" value="Name, location, and contact details" onClick={() => setIsEditing(true)} />
              <ProfileItem icon={Shield} label="Security" value="Password and authentication" />
              <ProfileItem icon={CreditCard} label="Payment Methods" value="Manage your cards and billing" />
            </ProfileSection>
          )}

          <ProfileSection title="Preferences">
            <ProfileItem icon={Bell} label="Notifications" value="Email and push notification settings" />
            <ProfileItem icon={Settings} label="App Settings" value="Language, theme, and more" />
          </ProfileSection>
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 900px;
          margin: 0 auto;
        }
        .profile-header-card {
          margin-bottom: 32px;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
        }
        .avatar-section {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background-color: ${Colors.background};
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid ${Colors.background};
        }
        .user-info h1 {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 4px;
          color: ${Colors.secondary};
        }
        .email {
          color: ${Colors.muted};
          margin: 0 0 16px;
          font-size: 16px;
        }
        .badges {
          display: flex;
          gap: 12px;
        }
        .role-badge {
          background-color: ${Colors.primary}20;
          color: ${Colors.primary};
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .location-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          color: ${Colors.muted};
          font-size: 13px;
        }
        .edit-form {
          padding: 24px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 12px;
        }
      `}</style>
    </div>
  );
}
