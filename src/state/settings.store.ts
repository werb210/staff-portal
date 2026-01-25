import { create } from "zustand";
import type { UserRole } from "@/utils/roles";

export type ProfileSettings = {
  firstName: string;
  lastName: string;
  phone: string;
  profileImage?: string;
};

export type BrandingSettingsState = {
  faviconUrl: string;
  logoUrl: string;
  palette: string[];
  typography: string[];
  brandKitUrl: string;
};

export type AdminUser = {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  disabled?: boolean;
  deleted?: boolean;
};

export type SettingsState = {
  profile: ProfileSettings;
  branding: BrandingSettingsState;
  users: AdminUser[];
  statusMessage?: string;
  updateProfile: (updates: Partial<ProfileSettings>) => void;
  uploadFavicon: (url: string) => void;
  uploadLogo: (url: string) => void;
  addUser: (user: Pick<AdminUser, "email" | "role">) => void;
  updateUser: (id: string, updates: Partial<AdminUser>) => void;
  setUserDisabled: (id: string, disabled: boolean) => void;
  softDeleteUser: (id: string) => void;
  setStatusMessage: (message?: string) => void;
  reset: () => void;
};

type SettingsSnapshot = Omit<
  SettingsState,
  | "updateProfile"
  | "uploadFavicon"
  | "uploadLogo"
  | "addUser"
  | "updateUser"
  | "setUserDisabled"
  | "softDeleteUser"
  | "setStatusMessage"
  | "reset"
>;

const createInitialState = (): SettingsSnapshot => ({
  profile: {
    firstName: "Alex",
    lastName: "Smith",
    phone: "+1 (555) 123-4567",
    profileImage: "https://placehold.co/80x80?text=AS"
  },
  branding: {
    faviconUrl: "https://placehold.co/32x32/mountain?text=\u26f0",
    logoUrl: "https://placehold.co/200x60?text=BF+Logo",
    palette: ["#003F5C", "#7A5195", "#EF5675", "#FFA600"],
    typography: ["Inter", "Instrument Sans", "Space Grotesk"],
    brandKitUrl: "https://example.com/brand-kit.zip"
  },
  users: [
    { id: "u-1", name: "Alex Smith", email: "alex@example.com", role: "Admin" },
    { id: "u-2", name: "Jamie Rivera", email: "jamie@example.com", role: "Staff" }
  ],
  statusMessage: undefined
});

export const useSettingsStore = create<SettingsState>((set) => ({
  ...createInitialState(),
  updateProfile: (updates) => {
    set((state) => ({
      profile: { ...state.profile, ...updates },
      statusMessage: "Profile updated"
    }));
  },
  uploadFavicon: (url) => {
    set((state) => ({
      branding: { ...state.branding, faviconUrl: url },
      statusMessage: "Branding updated"
    }));
  },
  uploadLogo: (url) => {
    set((state) => ({
      branding: { ...state.branding, logoUrl: url },
      statusMessage: "Logo updated"
    }));
  },
  addUser: (user) => {
    const id = `u-${Date.now()}`;
    set((state) => ({
      users: [
        ...state.users,
        {
          id,
          email: user.email,
          role: user.role,
          name: user.email.split("@")[0],
          disabled: false,
          deleted: false
        }
      ],
      statusMessage: "User added"
    }));
  },
  updateUser: (id, updates) => {
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
      statusMessage: "User updated"
    }));
  },
  setUserDisabled: (id, disabled) => {
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, disabled } : user)),
      statusMessage: disabled ? "User disabled" : "User enabled"
    }));
  },
  softDeleteUser: (id) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, deleted: true, disabled: true } : user
      ),
      statusMessage: "User deleted"
    }));
  },
  setStatusMessage: (message) => set({ statusMessage: message }),
  reset: () => set({ ...createInitialState() })
}));

export const getInitialSettingsState = createInitialState;
