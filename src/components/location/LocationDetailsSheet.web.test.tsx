/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LocationDetailsSheet from "./LocationDetailsSheet.web";

describe("LocationDetailsSheet.web", () => {
  const mockLocation = {
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
    imageUrls: [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
    ],
  };

  it("renders nothing when location is null", () => {
    const { container } = render(
      <LocationDetailsSheet location={null} onClose={jest.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders location details", () => {
    render(<LocationDetailsSheet location={mockLocation as any} onClose={jest.fn()} />);

    expect(screen.getByText("Ocean View Spot")).toBeInTheDocument();
    expect(screen.getByText("Nice quiet overlook")).toBeInTheDocument();
  });

  it("switches selected image when thumbnail is clicked", () => {
    render(<LocationDetailsSheet location={mockLocation as any} onClose={jest.fn()} />);

    const secondImage = screen.getByAltText("Ocean View Spot 2");

    fireEvent.click(secondImage);

    expect(secondImage).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();

    render(<LocationDetailsSheet location={mockLocation as any} onClose={onClose} />);

    fireEvent.click(screen.getByText("✕"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});