import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import LocationDetailsSheet from "./LocationDetailsSheet.native";
import type { LocationResponse } from "../../api/locations";

const mockLocation: LocationResponse = {
  id: "1",
  name: "Secret Study Spot",
  description: "Quiet place near campus",
  category: "study_spot",
  tags: ["quiet", "wifi"],
  imageUrls: ["https://example.com/image1.jpg"],
  lat: 36.653,
  lng: -121.797,
  createdById: "user-1",
  status: "pending",
  avgRating: 4.5,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

describe("LocationDetailsSheet.native", () => {
  it("renders nothing when location is null", () => {
    const { toJSON } = render(
      <LocationDetailsSheet location={null} onClose={jest.fn()} />
    );

    expect(toJSON()).toBeNull();
  });

  it("renders location details", () => {
    const { getByText } = render(
      <LocationDetailsSheet location={mockLocation} onClose={jest.fn()} />
    );

    expect(getByText("Secret Study Spot")).toBeTruthy();
    expect(getByText("Quiet place near campus")).toBeTruthy();
    expect(getByText("Category: study_spot")).toBeTruthy();
    expect(getByText("Rating: 4.5")).toBeTruthy();
    expect(getByText("Coordinates: 36.653, -121.797")).toBeTruthy();
  });

  it("renders placeholder when there are no images", () => {
    const locationWithoutImages = {
      ...mockLocation,
      imageUrls: [],
    };

    const { getByText } = render(
      <LocationDetailsSheet location={locationWithoutImages} onClose={jest.fn()} />
    );

    expect(getByText("No image yet")).toBeTruthy();
  });

  it("calls onClose when close button is pressed", () => {
    const onClose = jest.fn();

    const { getByText } = render(
      <LocationDetailsSheet location={mockLocation} onClose={onClose} />
    );

    fireEvent.press(getByText("✕"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});