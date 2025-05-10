import { Platform } from 'react-native';

export const Sizes = {
  tabBarHeight: Platform.OS === 'ios' ? 90 : 50,
  headerHeight: 80,
};
