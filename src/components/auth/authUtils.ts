// Mock authentication functions for demo purposes
// In a real app, these would call your backend API

/**
 * Validates an email address format
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Simulates creating a new user
 */
export async function createUserWithEmailAndPassword(
  name: string,
  email: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  password: string
): Promise<User> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const existingUsers: User[] = JSON.parse(
    localStorage.getItem('skilllink_users') || '[]'
  );

  if (existingUsers.some(user => user.email === email)) {
    throw new Error('Email already in use');
  }

  const newUser: User = {
    id: `user_${Math.random().toString(36).substring(2, 11)}`,
    name,
    email,
  };

  existingUsers.push(newUser);
  localStorage.setItem('skilllink_users', JSON.stringify(existingUsers));

  return newUser;
}

/**
 * Simulates signing in a user
 */
export async function signInWithEmailAndPassword(
  email: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  password: string
): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const existingUsers: User[] = JSON.parse(
    localStorage.getItem('skilllink_users') || '[]'
  );
  const user = existingUsers.find(user => user.email === email);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  return user;
}

/**
 * Simulates password reset request
 */
export async function sendPasswordResetEmail(
  email: string,
): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const existingUsers: User[] = JSON.parse(
    localStorage.getItem('skilllink_users') || '[]'
  );
  const user = existingUsers.find(user => user.email === email);

  if (!user) {
    throw new Error('No user found with this email');
  }

  return { success: true };
}