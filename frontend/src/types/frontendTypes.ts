export interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  token: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiError {
  response?: {
    data: {
      message: string;
    };
  };
}

export interface UserData {
  _id?: string;
  fullName: string;
  email: string;
  bio?: string;
  profilePic?: string;
  nativeLanguage?: string;
  learningLanguage?: string;
  location?: string;
  isOnboarded: boolean;
  friends?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OnboardingFormState {
  fullName: string;
  profilePic?: string;
  bio?: string;
  nativeLanguage?: string;
  learningLanguage?: string;
  location?: string;
}

export interface Friend {
  _id: string;
  fullName: string;
  profilePic?: string;
  nativeLanguage?: string;
  learningLanguage?: string;
}

export interface FriendRequest {
  _id: string;
  sender: {
    _id: string;
    fullName: string;
    profilePic?: string;
  };
  recipient: {
    _id: string;
    fullName: string;
    profilePic?: string;
  };
  status: "pending" | "accepted";
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  language: string;
  admin: UserData | string; // Can be populated or just ID
  members: (UserData | string)[]; // Can be populated or just IDs
  createdAt: string;
  updatedAt: string;
}

export interface GroupMessage {
  _id: string;
  group: Group | string; // Can be populated or just ID
  sender: UserData | string; // Can be populated or just ID
  content: string;
  contentType: "text" | "image" | "video";
  readBy: (UserData | string)[]; // Can be populated or just IDs
  createdAt: string;
  updatedAt: string;
}
