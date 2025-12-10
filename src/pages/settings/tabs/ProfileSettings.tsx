import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useSettingsStore } from "@/state/settings.store";

const timezones = [
  { value: "America/New_York", label: "Eastern" },
  { value: "America/Chicago", label: "Central" },
  { value: "America/Denver", label: "Mountain" },
  { value: "America/Los_Angeles", label: "Pacific" }
];

const ProfileSettings = () => {
  const { profile, updateProfile, statusMessage } = useSettingsStore();
  const [localProfile, setLocalProfile] = useState(profile);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onSave = (event: React.FormEvent) => {
    event.preventDefault();
    updateProfile(localProfile);
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLocalProfile((prev) => ({ ...prev, profileImage: previewUrl }));
    }
  };

  return (
    <form className="settings-panel" onSubmit={onSave} aria-label="Profile settings">
      <header>
        <h2>Personal settings</h2>
        <p>Update your name, phone, timezone, and avatar.</p>
      </header>

      <div className="settings-grid">
        <Input
          label="First name"
          value={localProfile.firstName}
          onChange={(e) => setLocalProfile({ ...localProfile, firstName: e.target.value })}
          required
        />
        <Input
          label="Last name"
          value={localProfile.lastName}
          onChange={(e) => setLocalProfile({ ...localProfile, lastName: e.target.value })}
          required
        />
        <Input
          label="Phone"
          value={localProfile.phone}
          onChange={(e) => setLocalProfile({ ...localProfile, phone: e.target.value })}
        />
        <Select
          label="Timezone"
          value={localProfile.timezone}
          onChange={(e) => setLocalProfile({ ...localProfile, timezone: e.target.value })}
          options={timezones}
        />
      </div>

      <div className="avatar-upload">
        <div>
          <p className="ui-field__label">Profile image</p>
          {localProfile.profileImage && (
            <img src={localProfile.profileImage} alt="Profile preview" className="avatar-preview" />
          )}
        </div>
        <div className="avatar-actions">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={onFileChange}
            aria-label="Upload profile image"
          />
        </div>
      </div>

      <div className="settings-actions">
        <Button type="submit">Save changes</Button>
        {statusMessage && <span role="status">{statusMessage}</span>}
      </div>
    </form>
  );
};

export default ProfileSettings;
