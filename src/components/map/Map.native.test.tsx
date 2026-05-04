import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Text, View } from "react-native";
import HiddenGemsMap from "./Map.native";
import type { LocationResponse } from "../../api/locations";

jest.mock("react-native-maps", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  const MockMapView = ({ children }: any) => <View>{children}</View>;

  const MockMarker = ({ title, description, onPress }: any) => (
    <Pressable onPress={onPress}>
      <Text>{title}</Text>
      <Text>{description}</Text>
    </Pressable>
  );

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

const mockLocations: LocationResponse[] = [
  {
    id: "1",
    name: "Hidden Beach",
    description: "Nice beach",
    category: "scenic",
    lat: 36.6,
    lng: -121.9,
    createdById: "user-1",
    status: "pending",
    avgRating: 4,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
];

describe("Map.native", () => {
  it("renders markers for locations", () => {
    const { getByText } = render(
      <HiddenGemsMap locations={mockLocations} onMarkerPress={jest.fn()} />
    );

    expect(getByText("Hidden Beach")).toBeTruthy();
    expect(getByText("scenic")).toBeTruthy();
  });

  it("calls onMarkerPress with selected location", () => {
    const onMarkerPress = jest.fn();

    const { getByText } = render(
      <HiddenGemsMap locations={mockLocations} onMarkerPress={onMarkerPress} />
    );

    fireEvent.press(getByText("Hidden Beach"));

    expect(onMarkerPress).toHaveBeenCalledWith(mockLocations[0]);
  });
});