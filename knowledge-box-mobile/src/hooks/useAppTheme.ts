import { useTheme } from "@react-navigation/native";
import { useColorScheme } from "react-native";

// Type
export type AppTheme = {
  dark: boolean;
  colors: {
    primary: string; // primary button , header background
    background: string; // screen background
    card: string; // containers default background
    text: string; // text on card elements
    border: string;
    notification: string;
    // Add your custom colors here
    primaryText: string; // text on primary elements
    deleteBtn: string;
    button: string;
    cardDefault: string;
    header: string;
    popup: string;
  };
};

// Light
export const lightTheme: AppTheme = {
  dark: false,
  colors: {
    primary: "#1da422", // primary button , header background
    background: "#ddd", // screen background
    card: "#c2fbc4", // containers default background
    text: "black", // text on card elements
    border: "gray",
    notification: "black",
    // Custom
    primaryText: "white", // text on primary elements
    deleteBtn: "darkred",
    button: "#6200ee",
    cardDefault: "#f8f8f8",
    header: "#6200ee",
    popup: "white",
  },
};

// Dark
export const darkTheme: AppTheme = {
  dark: true,
  colors: {
    primary: "#bb86fc", // primary button , header background
    background: "#121212", // screen background
    card: "#1e1e1e", // containers default background
    text: "#ffffff", // text on card elements
    border: "#333333",
    notification: "#ff80ab",
    // Custom
    primaryText: "white", // text on primary elements
    deleteBtn: "darkred",
    button: "#bb86fc",
    cardDefault: "#2e2e2e",
    header: "#bb86fc",
    popup: "#eee",
  },
};

export function useAppTheme(): AppTheme {
  const theme = useTheme() as AppTheme;
  return theme;
}
