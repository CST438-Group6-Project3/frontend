import React from "react";
import {
  GestureResponderEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";

export const MIN_RADIUS_MILES = 10;
export const MAX_RADIUS_MILES = 100;
const RADIUS_STEP_MILES = 5;

type RadiusSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export function formatRadiusMiles(radiusMiles: number) {
  return radiusMiles >= MAX_RADIUS_MILES
    ? `${MAX_RADIUS_MILES}+ mi`
    : `${radiusMiles} mi`;
}

export function scheduleTrackMeasurement(measureTrack: () => void) {
  requestAnimationFrame(() => measureTrack());
}

export function getRadiusValueFromPageX(
  pageX: number,
  measuredTrackPageX: number,
  measuredTrackWidth: number
) {
  if (!measuredTrackWidth) return null;

  const clampedX = Math.max(
    0,
    Math.min(pageX - measuredTrackPageX, measuredTrackWidth)
  );
  const rawValue =
    MIN_RADIUS_MILES +
    (clampedX / measuredTrackWidth) * (MAX_RADIUS_MILES - MIN_RADIUS_MILES);
  const steppedValue =
    Math.round(rawValue / RADIUS_STEP_MILES) * RADIUS_STEP_MILES;

  return Math.max(MIN_RADIUS_MILES, Math.min(steppedValue, MAX_RADIUS_MILES));
}

export default function RadiusSlider({ value, onChange }: RadiusSliderProps) {
  const trackRef = React.useRef<View | null>(null);
  const trackPageXRef = React.useRef(0);
  const trackWidthRef = React.useRef(0);
  const progress =
    (value - MIN_RADIUS_MILES) / (MAX_RADIUS_MILES - MIN_RADIUS_MILES);

  /* istanbul ignore next */
  function measureTrack(pageX?: number) {
    trackRef.current?.measureInWindow((x, _y, width) => {
      trackPageXRef.current = x;
      trackWidthRef.current = width;

      if (pageX != null) {
        updateValueFromPageX(pageX, x, width);
      }
    });
  }

  /* istanbul ignore next */
  function updateValueFromPageX(
    pageX: number,
    measuredTrackPageX = trackPageXRef.current,
    measuredTrackWidth = trackWidthRef.current
  ) {
    const nextValue = getRadiusValueFromPageX(
      pageX,
      measuredTrackPageX,
      measuredTrackWidth
    );

    if (nextValue != null) {
      onChange(nextValue);
    }
  }

  /* istanbul ignore next */
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (event: GestureResponderEvent) => {
          measureTrack(event.nativeEvent.pageX);
        },
        onPanResponderMove: (event: GestureResponderEvent) => {
          updateValueFromPageX(event.nativeEvent.pageX);
        },
      }),
    []
  );

  return (
    <View style={styles.radiusSlider}>
      <View style={styles.radiusSliderLabels}>
        <Text style={styles.radiusSliderLabel}>{MIN_RADIUS_MILES} mi</Text>
        <Text style={styles.radiusSliderValue}>{formatRadiusMiles(value)}</Text>
        <Text style={styles.radiusSliderLabel}>{MAX_RADIUS_MILES}+ mi</Text>
      </View>

      <View
        ref={trackRef}
        testID="radius-slider-track"
        style={styles.radiusSliderTrack}
        /* istanbul ignore next */
        onLayout={() => {
          scheduleTrackMeasurement(measureTrack);
        }}
        {...panResponder.panHandlers}
      >
        <View style={styles.radiusSliderRail} />
        <View
          style={[
            styles.radiusSliderFill,
            { width: `${Math.max(0, Math.min(progress, 1)) * 100}%` },
          ]}
        />
        <View
          style={[
            styles.radiusSliderThumb,
            { left: `${Math.max(0, Math.min(progress, 1)) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  radiusSlider: {
    marginBottom: 12,
  },
  radiusSliderLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  radiusSliderLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
  },
  radiusSliderValue: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
  },
  radiusSliderTrack: {
    position: "relative",
    height: 32,
    justifyContent: "center",
  },
  radiusSliderRail: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  radiusSliderFill: {
    position: "absolute",
    left: 0,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#2563eb",
  },
  radiusSliderThumb: {
    position: "absolute",
    width: 24,
    height: 24,
    marginLeft: -12,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "white",
    backgroundColor: "#2563eb",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
});
