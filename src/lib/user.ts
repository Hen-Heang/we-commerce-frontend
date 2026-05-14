import { api } from "./api";
import type { BaseResponse, UserProfile, UserProfileUpdate } from "@/types/api";

const MOCK_DISABLED = process.env.NEXT_PUBLIC_DISABLE_MOCK === "true";

/* ---------------- in-memory mock user ---------------- */
const mockUser: UserProfile = {
  id: 1,
  userName: "Heang Hen",
  name: "Heang Hen",
  email: "henheang15@gmail.com",
  phoneNumber: "+855 12 345 678",
  profilePhoto: "",
  address: "Phnom Penh, Cambodia",
  shopAdress: "Phnom Penh, Cambodia",
  googleLink: "https://t.me/henheang",
  maplink: "",
  status: true,
  createDate: "2026-05-01T10:00:00",
  role: "USER",
};

export async function fetchUserProfile(): Promise<UserProfile> {
  try {
    const res = await api.get<BaseResponse<UserProfile>>("/user/userprofile");
    if (res.data.error || !res.data.payload) {
      throw new Error(res.data.message ?? "profile failed");
    }
    return res.data.payload;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[user] profile fetch failed — using mock", err);
    return mockUser;
  }
}

export async function updateUserProfile(input: UserProfileUpdate): Promise<UserProfile> {
  try {
    const res = await api.put<BaseResponse<UserProfile>>("/user/edit", input);
    if (res.data.error || !res.data.payload) {
      throw new Error(res.data.message ?? "update failed");
    }
    return res.data.payload;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[user] update failed — using mock", err);
    Object.assign(mockUser, {
      userName: input.userName,
      name: input.userName,
      phoneNumber: input.phoneNumber,
      address: input.address,
      shopAdress: input.address,
      profilePhoto: input.photoProfile,
      maplink: input.maplink,
    });
    return mockUser;
  }
}

export async function deleteUserAccount(): Promise<void> {
  try {
    const res = await api.delete<BaseResponse<string>>("/user");
    if (res.data.error) throw new Error(res.data.message ?? "delete failed");
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[user] delete failed — mock mode treats it as success", err);
  }
}
