import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useSettingsStore } from "@/state/settings.store";
import UserDetailsFields from "../components/UserDetailsFields";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_AVATAR_DIMENSION = 256;

const ProfileSettings = () => {
  const { user } = useAuth();
  const { profile, fetchProfile, saveProfile, statusMessage, isLoadingProfile } = useSettingsStore();
  const [localProfile, setLocalProfile] = useState(profile);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  const onSave = (event: React.FormEvent) => {
    event.preventDefault();
    saveProfile(localProfile);
  };

  const loadImage = (file: File) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Unable to read image."));
        image.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("Unable to read file."));
      reader.readAsDataURL(file);
    });

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_AVATAR_SIZE_BYTES) {
        setAvatarError("Avatar must be under 2MB.");
        return;
      }
      try {
        const image = await loadImage(file);
        const squareSize = Math.min(image.width, image.height);
        const cropX = (image.width - squareSize) / 2;
        const cropY = (image.height - squareSize) / 2;
        const outputSize = Math.min(squareSize, MAX_AVATAR_DIMENSION);
        const canvas = document.createElement("canvas");
        canvas.width = outputSize;
        canvas.height = outputSize;
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Unable to prepare image preview.");
        }
        context.drawImage(image, cropX, cropY, squareSize, squareSize, 0, 0, outputSize, outputSize);
        const previewUrl = canvas.toDataURL("image/png");
        setLocalProfile((prev) => ({ ...prev, profileImage: previewUrl }));
        setAvatarError(null);
      } catch (error) {
        console.error(error);
        setAvatarError("Unable to process that image. Please try a different file.");
      }
    }
  };

  return (
    <form className="settings-panel" onSubmit={onSave} aria-label="Profile settings">
      <header>
        <h2>My profile</h2>
        <p>Update your name, phone, and avatar. OAuth connections open in a new window.</p>
      </header>

      <div className="profile-summary">
        <div>
          <p className="ui-field__label">Signed in as</p>
          <div className="profile-summary__name">{user?.name ?? localProfile.name}</div>
          <div className="profile-summary__email">{localProfile.email}</div>
        </div>
      </div>

      <div className="settings-grid">
        <UserDetailsFields
          name={localProfile.name}
          email={localProfile.email}
          phone={localProfile.phone}
          onChange={(updates) => setLocalProfile((prev) => ({ ...prev, ...updates }))}
          emailDisabled
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
          <p className="avatar-helper">Square crop enforced, max 256×256px, 2MB limit.</p>
          {avatarError && <p className="ui-field__error">{avatarError}</p>}
        </div>
      </div>

      <div className="connected-accounts">
        <h3>Connected accounts</h3>
        <p>Connect optional services. OAuth prompts open in a new window.</p>
        <div className="connected-accounts__actions">
          <Button type="button" variant="secondary">
            Microsoft 365
          </Button>
          <Button type="button" variant="secondary">
            LinkedIn
          </Button>
        </div>
      </div>

      <div className="settings-actions">
        <Button type="submit" disabled={isLoadingProfile}>
          {isLoadingProfile ? "Saving..." : "Save changes"}
        </Button>
        {statusMessage && <span role="status">{statusMessage}</span>}
      </div>
    </form>
  );
};

export default ProfileSettings;
