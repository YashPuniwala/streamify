import axios from "axios";
import { Group, GroupMessage, LoginData, OnboardingFormState, SignupData } from "../types/frontendTypes";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// Auth APIs
export const signup = (data: SignupData) => {
  return axiosInstance.post("/auth/signup", data);
};

export const login = (data: LoginData) => {
  return axiosInstance.post("/auth/login", data);
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return { user: null }; // Return consistent structure even on error
  }
};

export const completeOnboarding = async (userData: OnboardingFormState) => {
  const res = await axiosInstance.post("/auth/onboarding", userData);
  return res.data;
};

// Friend APIs
export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users/me");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId: string) {
  const response = await axiosInstance.post(`/users/friend-requests/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId: string) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

// Group APIs
export const createGroup = async (data: {
  name: string;
  description: string;
  language: string;
}): Promise<Group> => {
  const response = await axiosInstance.post("/group/create-group", data);
  return response.data;
};

export const getGroups = async (): Promise<Group[]> => {
  const response = await axiosInstance.get("/group");
  return response.data;
};

export const getGroupDetails = async (groupId: string): Promise<Group> => {
  const response = await axiosInstance.get(`/groups/${groupId}`);
  return response.data;
};

export const joinGroup = async (groupId: string): Promise<Group> => {
  const response = await axiosInstance.post(`/groups/${groupId}/join`);
  return response.data;
};

export const leaveGroup = async (groupId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post(`/groups/${groupId}/leave`);
  return response.data;
};

export const updateGroup = async (
  groupId: string,
  data: {
    name?: string;
    description?: string;
    language?: string;
  }
): Promise<Group> => {
  const response = await axiosInstance.put(`/groups/${groupId}`, data);
  return response.data;
};

export const deleteGroup = async (groupId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/groups/${groupId}`);
  return response.data;
};

// Group Message APIs
export const sendGroupMessage = async (
  groupId: string,
  data: {
    content: string;
    contentType?: 'text' | 'image' | 'video';
  }
): Promise<GroupMessage> => {
  const response = await axiosInstance.post(`/groups/${groupId}/messages`, data);
  return response.data;
};

export const getGroupMessages = async (
  groupId: string,
  options?: {
    limit?: number;
    skip?: number;
  }
): Promise<GroupMessage[]> => {
  const params = options || {};
  const response = await axiosInstance.get(`/groups/${groupId}/messages`, { params });
  return response.data;
};

export const markMessageAsRead = async (messageId: string): Promise<GroupMessage> => {
  const response = await axiosInstance.put(`/groups/messages/${messageId}/read`);
  return response.data;
};

export const sendGroupInvitation = async (groupId: string, userId: string) => {
  const response = await axiosInstance.post(`/groups/${groupId}/invite`, { userId });
  return response.data;
};

export const acceptGroupInvitation = async (groupId: string) => {
  const response = await axiosInstance.post(`/groups/${groupId}/accept-invite`);
  return response.data;
};