export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
};

const demoUser: User = {
  id: "demo-user",
  email: "demo@example.com",
  passwordHash: "",
  role: "user",
};

export const usersRepo = {
  async findByEmail(email: string): Promise<User | null> {
    if (email === demoUser.email) return demoUser;
    return null;
  },
};

export default usersRepo;
export { usersRepo };
