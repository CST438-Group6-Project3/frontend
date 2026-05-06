import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export type LocationResponse = {
  id: string;
  name: string;
  description?: string;
  category: "study_spot" | "food" | "scenic" | "hangout" | "trail" | "activity" | "other";
  tags?: string[];
  imageUrls?: string[];
  lat: number;
  lng: number;
  createdById: string;
  status: "pending" | "verified" | "archived";
  avgRating: number;
  createdAt: string;
  updatedAt: string;
};

export async function getLocations() {
  const res = await axios.get<LocationResponse[]>(`${API_BASE_URL}/locations`);
  return res.data;
}