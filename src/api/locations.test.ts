import axios from "axios";
import { getLocations } from "./locations";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("getLocations", () => {
  it("returns location data from the backend", async () => {
    const mockLocations = [
      {
        id: "1",
        name: "Hidden Beach",
        category: "scenic",
        lat: 36.6,
        lng: -121.9,
        createdById: "user-1",
        status: "pending",
        avgRating: 0,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockLocations });

    const result = await getLocations();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://localhost:8080/api/locations"
    );
    expect(result).toEqual(mockLocations);
  });

  it("throws when the request fails", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

    await expect(getLocations()).rejects.toThrow("Network error");
  });
});