import { useThemeColors } from '@/src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, SafeAreaView,View } from 'react-native';

const ScreenContainer = ({ children }: { children: React.ReactNode }) => {
  const { themeColors } = useThemeColors();
  return (
    <LinearGradient
      colors={[themeColors.headerBg, themeColors.subHeaderBg]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{flex:1}}>
        <View style={styles.container}>

        {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 8,
  },
});

export default ScreenContainer;
