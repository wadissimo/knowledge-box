import { Platform } from 'react-native';

export const Sizes = {
  tabBarHeight: Platform.OS === 'ios' ? 90 : 60,
  headerHeight: 80,
};
