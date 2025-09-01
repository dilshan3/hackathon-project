export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  city?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  city?: string;
}