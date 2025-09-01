export interface User {
  id: string;
  email: string;
  displayName: string;
  city?: string;
  createdAt: string;
}

export interface Me extends User {
  emailVerified: boolean;
}