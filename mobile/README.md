# Tap2 Wallet - Mobile App

React Native mobile app for Tap2 Wallet - a digital wallet app for tap-to-pay payments.

## Tech Stack

- **Framework**: React Native with Expo SDK 52
- **Language**: TypeScript
- **Navigation**: React Navigation v7 (Native Stack)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Haptics**: Expo Haptics

## Prerequisites

- Node.js 18+ and npm/yarn
- iOS: Xcode 15+ (for iOS development)
- Android: Android Studio with SDK 34+ (for Android development)
- Expo Go app (for testing on physical devices)

## Installation

```bash
# Install dependencies
npm install

# or with yarn
yarn install
```

## Running the App

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

## Project Structure

```
src/
├── screens/          # Screen components
├── components/       # Reusable UI components
├── navigation/       # Navigation configuration
├── services/         # API services
├── hooks/           # Custom React hooks
├── stores/          # Zustand state stores
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Development Workflow

1. Create feature branch from `main`
2. Develop feature with TypeScript
3. Test on iOS and Android simulators
4. Create PR with changes
5. Merge after review

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Contributing

See main repository README.md for contribution guidelines.

## License

Proprietary - Tap2 / CloudMind Inc.
