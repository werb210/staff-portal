import { create } from "zustand";
import type { UserRole } from "@/utils/roles";

export type LoginHistoryEntry = {
  id: string;
  timestamp: string;
  location: string;
};

export type SiloCode = "BF" | "BI" | "SLF";

export type SiloPermissions = {
  canViewApplications: boolean;
  canViewCRM: boolean;
  canUseDialer: boolean;
  canUseMarketing: boolean;
  canSendToLenders: boolean;
};

export type SiloAccess = {
  code: SiloCode;
  name: string;
  phoneNumber: string;
  emailSync: "Connected" | "Disconnected" | "Refreshing";
  permissions: SiloPermissions;
};

export type ProfileSettings = {
  firstName: string;
  lastName: string;
  phone: string;
  timezone: string;
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
  name: string;
  email: string;
  role: UserRole;
  silos: SiloCode[];
  disabled?: boolean;
};

export type SettingsState = {
  profile: ProfileSettings;
  security: {
    twoFactorEnabled: boolean;
    loginHistory: LoginHistoryEntry[];
    lastPasswordChange?: string;
  };
  meetingLink: string;
  silos: {
    defaultSilo: SiloCode;
    allowed: SiloCode[];
    access: SiloAccess[];
  };
  branding: BrandingSettingsState;
  users: AdminUser[];
  statusMessage?: string;
  updateProfile: (updates: Partial<ProfileSettings>) => void;
  changePassword: () => void;
  toggleTwoFactor: (enabled: boolean) => void;
  updateMeetingLink: (link: string) => void;
  setDefaultSilo: (code: SiloCode) => void;
  updateSiloPermission: (code: SiloCode, key: keyof SiloPermissions, value: boolean) => void;
  refreshEmailSync: (code: SiloCode) => void;
  uploadFavicon: (url: string) => void;
  addUser: (user: Omit<AdminUser, "id">) => void;
  updateUser: (id: string, updates: Partial<AdminUser>) => void;
  resetUserPassword: (id: string) => void;
  disableUser: (id: string) => void;
  setStatusMessage: (message?: string) => void;
  reset: () => void;
};

type SettingsSnapshot = Omit<
  SettingsState,
  | "updateProfile"
  | "changePassword"
  | "toggleTwoFactor"
  | "updateMeetingLink"
  | "setDefaultSilo"
  | "updateSiloPermission"
  | "refreshEmailSync"
  | "uploadFavicon"
  | "addUser"
  | "updateUser"
  | "resetUserPassword"
  | "disableUser"
  | "setStatusMessage"
  | "reset"
>;

const createInitialState = (): SettingsSnapshot => ({
  profile: {
    firstName: "Alex",
    lastName: "Smith",
    phone: "+1 (555) 123-4567",
    timezone: "America/New_York",
    profileImage: "https://placehold.co/80x80?text=AS"
  },
  security: {
    twoFactorEnabled: true,
    loginHistory: [
      { id: "1", timestamp: "2024-10-02 09:15", location: "Toronto" },
      { id: "2", timestamp: "2024-10-01 20:04", location: "New York" },
      { id: "3", timestamp: "2024-09-30 08:10", location: "Remote" }
    ],
    lastPasswordChange: "2024-09-15"
  },
  meetingLink: "https://bookings.office.com/meet/alex-smith",
  silos: {
    defaultSilo: "BF" as SiloCode,
    allowed: ["BF", "BI", "SLF"],
    access: [
      {
        code: "BF",
        name: "BF Silo",
        phoneNumber: "+1 555-100-1000",
        emailSync: "Connected",
        permissions: {
          canViewApplications: true,
          canViewCRM: true,
          canUseDialer: true,
          canUseMarketing: true,
          canSendToLenders: true
        }
      },
      {
        code: "BI",
        name: "BI Silo",
        phoneNumber: "+1 555-200-2000",
        emailSync: "Connected",
        permissions: {
          canViewApplications: true,
          canViewCRM: true,
          canUseDialer: false,
          canUseMarketing: false,
          canSendToLenders: true
        }
      },
      {
        code: "SLF",
        name: "SLF Silo",
        phoneNumber: "+1 555-300-3000",
        emailSync: "Disconnected",
        permissions: {
          canViewApplications: false,
          canViewCRM: true,
          canUseDialer: false,
          canUseMarketing: false,
          canSendToLenders: false
        }
      }
    ]
  },
  branding: {
    faviconUrl: "https://placehold.co/32x32/mountain?text=\u26f0",
    logoUrl: "https://placehold.co/200x60?text=BF+Logo",
    palette: ["#003F5C", "#7A5195", "#EF5675", "#FFA600"],
    typography: ["Inter", "Instrument Sans", "Space Grotesk"],
    brandKitUrl: "https://example.com/brand-kit.zip"
  },
  users: [
    { id: "u-1", name: "Alex Smith", email: "alex@example.com", role: "ADMIN", silos: ["BF", "BI"] },
    { id: "u-2", name: "Jamie Rivera", email: "jamie@example.com", role: "STAFF", silos: ["BF"] }
  ],
  statusMessage: undefined
});

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...createInitialState(),
  updateProfile: (updates) => {
    set((state) => ({
      profile: { ...state.profile, ...updates },
      statusMessage: "Profile updated"
    }));
  },
  changePassword: () => {
    const timestamp = new Date().toISOString();
    set((state) => ({
      security: { ...state.security, lastPasswordChange: timestamp },
      statusMessage: "Password changed"
    }));
  },
  toggleTwoFactor: (enabled) => {
    set((state) => ({
      security: { ...state.security, twoFactorEnabled: enabled },
      statusMessage: enabled ? "Two-factor enabled" : "Two-factor disabled"
    }));
  },
  updateMeetingLink: (link) => {
    set({ meetingLink: link, statusMessage: "Meeting link saved" });
  },
  setDefaultSilo: (code) => {
    set((state) => ({
      silos: { ...state.silos, defaultSilo: code },
      statusMessage: "Default silo updated"
    }));
  },
  updateSiloPermission: (code, key, value) => {
    set((state) => ({
      silos: {
        ...state.silos,
        access: state.silos.access.map((access) =>
          access.code === code
            ? { ...access, permissions: { ...access.permissions, [key]: value } }
            : access
        )
      },
      statusMessage: "Silo permissions updated"
    }));
  },
  refreshEmailSync: (code) => {
    set((state) => ({
      silos: {
        ...state.silos,
        access: state.silos.access.map((access) =>
          access.code === code
            ? { ...access, emailSync: access.emailSync === "Refreshing" ? "Connected" : "Refreshing" }
            : access
        )
      },
      statusMessage: "Email sync refreshed"
    }));
  },
  uploadFavicon: (url) => {
    set((state) => ({
      branding: { ...state.branding, faviconUrl: url },
      statusMessage: "Branding updated"
    }));
  },
  addUser: (user) => {
    const id = `u-${Date.now()}`;
    set((state) => ({
      users: [...state.users, { ...user, id }],
      statusMessage: "User added"
    }));
  },
  updateUser: (id, updates) => {
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
      statusMessage: "User updated"
    }));
  },
  resetUserPassword: (id) => {
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, disabled: false } : user)),
      statusMessage: "Password reset"
    }));
  },
  disableUser: (id) => {
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, disabled: true } : user)),
      statusMessage: "User disabled"
    }));
  },
  setStatusMessage: (message) => set({ statusMessage: message }),
  reset: () => set({ ...createInitialState() })
}));

export const getInitialSettingsState = createInitialState;
