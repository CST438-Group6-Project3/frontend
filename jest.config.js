/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
      tsconfig: {
        jsx: "react-jsx",
      },
      },
    ],
  },
  moduleFileExtensions: ["web.tsx", "web.ts", "tsx", "ts", "jsx", "js"],
  moduleNameMapper: {
    "^react-native$": "react-native-web",
  },
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  collectCoverageFrom: [
    "src/api/**/*.{ts,tsx}",
    "src/components/location/AddSpotSheet.web.tsx",
    "src/components/map/RadiusSlider.tsx",
    "!src/**/*.native.{ts,tsx}",
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
      functions: 75,
      branches: 70,
    },
  },
};
