import { View, Text, Button, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAuth } from '@react-native-firebase/auth';
import { useTheme } from '@react-navigation/native';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import { useThemeColors } from '@/src/context/ThemeContext';
import { i18n } from '@/src/lib/i18n';
import PrimaryButton from '@/src/components/common/PrimaryButton';
const UserPage = () => {
  const { themeColors } = useThemeColors();
  const [user, setUser] = useState(getAuth().currentUser);
  // return null;
  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged(user => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const signOut = () => {
    getAuth().signOut();
    setUser(null);
  };
  console.log('user', user);
  if (!user) return null;
  return (
    <ScreenContainer>
      <View style={[styles.header, { backgroundColor: themeColors.subHeaderBg }]}>
        <Text style={{ color: themeColors.subHeaderText }}>Welcome, {user?.email}</Text>
      </View>
      <View style={[styles.mainContainer, { backgroundColor: themeColors.cardBg }]}>
        <View style={styles.statsContainer}>
          <View>
            <Text style={{ color: themeColors.cardText }}>Stats</Text>
          </View>
          <View>
            <Text style={{ color: themeColors.cardText }}>Total cards: XXX</Text>
          </View>
          <View>
            <Text style={{ color: themeColors.cardText }}>Studying: XXX</Text>
          </View>
          <View>
            <Text style={{ color: themeColors.cardText }}>Total XP: XXX</Text>
          </View>
          <View>
            <Text style={{ color: themeColors.cardText }}>Time Spent: X days XX hrs XX mins</Text>
          </View>
        </View>
      </View>
      <View>
        <PrimaryButton onClick={signOut} text={i18n.t('user.signOut')} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  mainContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 16,
  },
  statsContainer: {
    padding: 20,
  },
});
export default UserPage;
