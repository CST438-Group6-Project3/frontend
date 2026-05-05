import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080/api";

export type LocationCategory =
  | "study_spot"
  | "food"
  | "scenic"
  | "hangout"
  | "trail"
  | "activity"
  | "other";

export type LocationResponse = {
  id: string;
  name: string;
  description?: string;
  category: LocationCategory;
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

export type CreateLocationRequest = {
  name: string;
  description?: string;
  category: LocationCategory;
  tags?: string[];
  imageUrls?: string[];
  lat: number;
  lng: number;
  createdById: string;
};

export type UpdateLocationRequest = Partial<
  Pick<
    CreateLocationRequest,
    "name" | "description" | "category" | "tags" | "imageUrls" | "lat" | "lng"
  >
>;

export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
  }

  const responseData = error.response?.data;

  if (typeof responseData === "string") {
    return responseData;
  }

  if (responseData && typeof responseData === "object") {
    const data = responseData as Record<string, unknown>;

    if (typeof data.message === "string") {
      return data.message;
    }

    if (typeof data.error === "string") {
      return data.error;
    }
  }

  if (error.response?.status) {
    return `Request failed with status ${error.response.status}.`;
  }

  return error.message || "Something went wrong. Please try again.";
}

export async function getLocations() {
  const res = await axios.get<LocationResponse[]>(`${API_BASE_URL}/locations`);
  return res.data;
}

export async function createLocation(payload: CreateLocationRequest) {
  const res = await axios.post<LocationResponse>(
    `${API_BASE_URL}/locations`,
    payload
  );
  return res.data;
}

export async function updateLocation(
  locationId: string,
  payload: UpdateLocationRequest
) {
  const res = await axios.patch<LocationResponse>(
    `${API_BASE_URL}/locations/${locationId}`,
    payload
  );
  return res.data;
}
