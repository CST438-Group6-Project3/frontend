import { render, screen } from "@testing-library/react";
import React from "react";

let mockPanResponderConfig: {
  onPanResponderGrant: (event: { nativeEvent: { pageX: number } }) => void;
  onPanResponderMove: (event: { nativeEvent: { pageX: number } }) => void;
} | null = null;

jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native");

  return {
    ...actual,
    PanResponder: {
      create: jest.fn((config) => {
        mockPanResponderConfig = config;
        return { panHandlers: {} };
      }),
    },
  };
});

import RadiusSlider, {
  formatRadiusMiles,
  getRadiusValueFromPageX,
  scheduleTrackMeasurement,
} from "./RadiusSlider";

describe("RadiusSlider", () => {
  it("formats the max radius as an open-ended distance", () => {
    expect(formatRadiusMiles(10)).toBe("10 mi");
    expect(formatRadiusMiles(95)).toBe("95 mi");
    expect(formatRadiusMiles(100)).toBe("100+ mi");
    expect(formatRadiusMiles(125)).toBe("100+ mi");
  });

  it("converts track coordinates into stepped radius values", () => {
    expect(getRadiusValueFromPageX(50, 50, 0)).toBeNull();
    expect(getRadiusValueFromPageX(25, 50, 200)).toBe(10);
    expect(getRadiusValueFromPageX(250, 50, 200)).toBe(100);
    expect(getRadiusValueFromPageX(141, 50, 200)).toBe(50);
  });

  it("measures the track on the next frame without passing the frame timestamp", () => {
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const measureTrack = jest.fn();

    window.requestAnimationFrame = jest.fn((callback) => {
      callback(12345);
      return 1;
    });

    scheduleTrackMeasurement(measureTrack);

    expect(measureTrack).toHaveBeenCalledWith();

    window.requestAnimationFrame = originalRequestAnimationFrame;
  });

  it("renders the current distance labels", () => {
    render(<RadiusSlider value={35} onChange={jest.fn()} />);

    expect(screen.getByText("10 mi")).toBeInTheDocument();
    expect(screen.getByText("35 mi")).toBeInTheDocument();
    expect(screen.getByText("100+ mi")).toBeInTheDocument();
  });

});
