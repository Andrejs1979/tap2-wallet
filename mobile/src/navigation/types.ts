import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  // Add more screens here as needed
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
