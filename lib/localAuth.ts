import { UserProfile } from "@/types/reader";

export interface StoredUser extends UserProfile {
  passwordHash: string;
  lastReadDate?: string;
  bookProgress: Record<
    string,
    {
      currentPage: number;
      totalPages: number;
      percentage: number;
      lastReadAt: number;
    }
  >;
}

const USERS_KEY = "readepub_users";
const SESSION_KEY = "readepub_active_session";

export function getStoredUsers(): Record<string, StoredUser> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getActiveUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const activeEmail = localStorage.getItem(SESSION_KEY);
  if (!activeEmail) return null;

  const users = getStoredUsers();
  return users[activeEmail] || null;
}

export function registerLocalUser(
  email: string,
  password: string,
  username: string
): { success: boolean; message?: string; user?: StoredUser } {
  const users = getStoredUsers();
  const normalizedEmail = email.toLowerCase().trim();

  if (users[normalizedEmail]) {
    return { success: false, message: "Já existe uma conta com este e-mail." };
  }

  const newUser: StoredUser = {
    id: `usr_${Date.now()}`,
    email: normalizedEmail,
    username: username.trim() || normalizedEmail.split("@")[0],
    passwordHash: btoa(password),
    xp: 0,
    level: 1,
    current_streak: 1,
    longest_streak: 1,
    daily_goal_minutes: 20,
    minutes_read_today: 0,
    lastReadDate: new Date().toISOString().split("T")[0],
    bookProgress: {},
  };

  users[normalizedEmail] = newUser;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, normalizedEmail);

  return { success: true, user: newUser };
}

export function loginLocalUser(
  email: string,
  password: string
): { success: boolean; message?: string; user?: StoredUser } {
  const users = getStoredUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const user = users[normalizedEmail];

  if (!user || user.passwordHash !== btoa(password)) {
    return { success: false, message: "E-mail ou palavra-passe incorretos." };
  }

  const today = new Date().toISOString().split("T")[0];
  if (user.lastReadDate) {
    const lastDate = new Date(user.lastReadDate);
    const currentDate = new Date(today);
    const diffDays = Math.floor(
      (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      user.current_streak += 1;
      if (user.current_streak > user.longest_streak) {
        user.longest_streak = user.current_streak;
      }
      user.minutes_read_today = 0;
    } else if (diffDays > 1) {
      user.current_streak = 1;
      user.minutes_read_today = 0;
    }
  }

  user.lastReadDate = today;
  users[normalizedEmail] = user;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, normalizedEmail);

  return { success: true, user };
}

export function logoutLocalUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function updateUserProgress(
  email: string,
  bookKey: string,
  currentPage: number,
  totalPages: number,
  xpEarned: number = 10
): StoredUser | null {
  const users = getStoredUsers();
  const user = users[email];
  if (!user) return null;

  user.xp += xpEarned;
  user.level = Math.floor(user.xp / 200) + 1;

  const percentage = Math.round((currentPage / Math.max(1, totalPages)) * 100);
  user.bookProgress[bookKey] = {
    currentPage,
    totalPages,
    percentage,
    lastReadAt: Date.now(),
  };

  users[email] = user;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return user;
}