import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
// import { FirebaseAuthTypes } from "@react-native-firebase/auth";
// import auth from "@react-native-firebase/auth";

const UserLayout = () => {
  return null;
  // const [initializing, setInitializing] = useState(true);
  // const [user, setUser] = useState<FirebaseAuthTypes.User | null>();

  // const router = useRouter();
  // const segments = useSegments();

  // const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
  //   console.log("onAuthStateChanged", user);
  //   setUser(user);
  //   if (initializing) setInitializing(false);
  // };
  // useEffect(() => {
  //   const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
  //   console.log("subscriber", subscriber);
  //   return subscriber;
  // }, []);

  // useEffect(() => {
  //   console.log("initializing");
  //   if (initializing) return;

  //   const inAuthGroup = "(auth)" in segments;
  //   if (user && !inAuthGroup) {
  //     console.log("userpage");
  //     router.replace("/(tabs)/user/userpage");
  //   } else if (!user && inAuthGroup) {
  //     console.log("login");
  //     router.replace("/(tabs)/user/login");
  //   }
  //   console.log("inAuthGroup", inAuthGroup);
  //   console.log("user", user !== null);
  //   // console.log("segments", segments);
  // }, [user, initializing]);

  // if (initializing)
  //   return (
  //     <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // return (
  //   <Stack>
  //     <Stack.Screen
  //       name="login"
  //       options={{
  //         title: "Login",
  //         headerShown: true,
  //         headerLeft: () => (
  //           <TouchableOpacity onPress={() => router.back()}>
  //             <Icon name="chevron-left" size={42} color="white" />
  //           </TouchableOpacity>
  //         ),
  //         headerBackVisible: false,
  //         headerShadowVisible: false,

  //         headerStyle: {
  //           backgroundColor: "#1da422",
  //         },
  //         headerTitleStyle: {
  //           color: "white",
  //           fontSize: 32,
  //           fontWeight: "bold",
  //         },
  //       }}
  //     />
  //     <Stack.Screen name="(auth)/userpage" options={{ headerShown: true }} />
  //   </Stack>
  // );
};

export default UserLayout;
