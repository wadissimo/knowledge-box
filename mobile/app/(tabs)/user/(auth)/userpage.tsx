import { View, Text, Button, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAuth } from '@react-native-firebase/auth';
import { useTheme } from '@react-navigation/native';
import ScreenContainer from '@/src/components/common/ScreenContainer';
const UserPage = () => {
  const { colors } = useTheme();
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
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text>Welcome, {user?.email}</Text>
        <Button title="Sign out" onPress={signOut} color={colors.primary} />
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.statsContainer}>
          <View>
            <Text>Stats</Text>
          </View>
          <View>
            <Text>Total cards: XXX</Text>
          </View>
          <View>
            <Text>Studying: XXX</Text>
          </View>
          <View>
            <Text>Total XP: XXX</Text>
          </View>
          <View>
            <Text>Time Spent: X days XX hrs XX mins</Text>
          </View>
        </View>
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
