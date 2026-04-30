import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import MapScreen from "./MapScreen";
import { getLocations } from "../api/locations";

jest.mock("../api/locations");

jest.mock("../components/map/Map", () => {
  const React = require("react");
  const { View, Pressable, Text } = require("react-native");

  return function MockHiddenGemsMap({ locations, onMarkerPress }: any) {
    return (
      <View>
        {locations.map((location: any) => (
          <Pressable
            key={location.id}
            testID={`marker-${location.id}`}
            onPress={() => onMarkerPress(location)}
          >
            <Text>{location.name}</Text>
          </Pressable>
        ))}
      </View>
    );
  };
});

jest.mock("../components/location/LocationDetailsSheet", () => {
  const React = require("react");
  const { View, Text, Pressable } = require("react-native");

  return function MockLocationDetailsSheet({ location, onClose }: any) {
    if (!location) return null;

    return (
      <View>
        <Text>{location.name}</Text>
        <Pressable onPress={onClose}>
          <Text>Close</Text>
        </Pressable>
      </View>
    );
  };
});

const mockedGetLocations = getLocations as jest.MockedFunction<
  typeof getLocations
>;

describe("MapScreen", () => {
  const mockLocations = [
    {
      id: "1",
      name: "Ocean View Spot",
      description: "Nice quiet overlook",
      category: "scenic",
      tags: ["view", "quiet"],
      lat: 36.6,
      lng: -121.9,
      createdById: "user-1",
      status: "pending",
      avgRating: 0,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
      imageUrls: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders locations from backend", async () => {
    mockedGetLocations.mockResolvedValueOnce(mockLocations as any);

    render(<MapScreen />);

    expect(await screen.findByText("Ocean View Spot")).toBeTruthy();
  });

  it("opens preview when marker is pressed", async () => {
    mockedGetLocations.mockResolvedValueOnce(mockLocations as any);

    render(<MapScreen />);

    const marker = await screen.findByTestId("marker-1");

    fireEvent.press(marker);

    expect(await screen.findByTestId("preview-card")).toBeTruthy();
  });

  it("opens details sheet when preview is pressed", async () => {
    mockedGetLocations.mockResolvedValueOnce(mockLocations as any);

    render(<MapScreen />);

    const marker = await screen.findByTestId("marker-1");
    fireEvent.press(marker);

    const preview = await screen.findByTestId("preview-card");
    fireEvent.press(preview);

    expect(screen.getByText("Close")).toBeTruthy();
  });
});