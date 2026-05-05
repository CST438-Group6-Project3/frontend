import axios from "axios";
import {
  createLocation,
  getApiErrorMessage,
  getLocations,
  type CreateLocationRequest,
} from "./locations";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("locations api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches locations from the configured API", async () => {
    const locations = [
      {
        id: "location-1",
        name: "Library",
        category: "study_spot",
        lat: 36.1,
        lng: -121.1,
        createdById: "user-1",
        status: "pending",
        avgRating: 0,
        createdAt: "2026-01-01T00:00:00",
        updatedAt: "2026-01-01T00:00:00",
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: locations });

    await expect(getLocations()).resolves.toEqual(locations);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://localhost:8080/api/locations"
    );
  });

  it("posts a new location and returns the created location", async () => {
    const payload: CreateLocationRequest = {
      name: "Courtyard",
      description: "Quiet tables",
      category: "study_spot",
      tags: [],
      imageUrls: ["https://example.com/image.jpg"],
      lat: 36.2,
      lng: -121.2,
      createdById: "user-1",
    };
    const createdLocation = {
      ...payload,
      id: "location-1",
      status: "pending",
      avgRating: 0,
      createdAt: "2026-01-01T00:00:00",
      updatedAt: "2026-01-01T00:00:00",
    };

    mockedAxios.post.mockResolvedValueOnce({ data: createdLocation });

    await expect(createLocation(payload)).resolves.toEqual(createdLocation);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8080/api/locations",
      payload
    );
  });

  it("extracts helpful API error messages", () => {
    mockedAxios.isAxiosError.mockReturnValueOnce(true);

    expect(
      getApiErrorMessage({
        response: { data: { message: "User not found" } },
      })
    ).toBe("User not found");

    mockedAxios.isAxiosError.mockReturnValueOnce(true);

    expect(
      getApiErrorMessage({
        response: { data: { error: "Invalid category" } },
      })
    ).toBe("Invalid category");

    mockedAxios.isAxiosError.mockReturnValueOnce(true);

    expect(
      getApiErrorMessage({
        response: { status: 500 },
        message: "Request failed",
      })
    ).toBe("Request failed with status 500.");
  });

  it("handles non-Axios errors", () => {
    mockedAxios.isAxiosError.mockReturnValueOnce(false);

    expect(getApiErrorMessage(new Error("Upload failed"))).toBe(
      "Upload failed"
    );

    mockedAxios.isAxiosError.mockReturnValueOnce(false);

    expect(getApiErrorMessage("nope")).toBe(
      "Something went wrong. Please try again."
    );
  });
});
