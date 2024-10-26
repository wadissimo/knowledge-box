import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";

// Define the props interface
interface LocalImageProps {
  uri: string;
  maxWidth: number;
  maxHeight: number;
}

const LocalImage: React.FC<LocalImageProps> = ({
  uri,
  maxWidth,
  maxHeight,
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Get original image size
    Image.getSize(
      uri,
      (width, height) => {
        // Calculate aspect ratio
        const aspectRatio = width / height;

        // Determine the scaled dimensions
        let scaledWidth = width;
        let scaledHeight = height;

        if (width > maxWidth) {
          scaledWidth = maxWidth;
          scaledHeight = maxWidth / aspectRatio;
        }

        if (scaledHeight > maxHeight) {
          scaledHeight = maxHeight;
          scaledWidth = maxHeight * aspectRatio;
        }

        // Update state with scaled dimensions
        setDimensions({ width: scaledWidth, height: scaledHeight });
      },
      (error) => {
        console.error(`Failed to get image size: ${error.message}`);
      }
    );
  }, [uri, maxWidth, maxHeight]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri }}
        style={{ width: dimensions.width, height: dimensions.height }}
        resizeMode="contain" // ensures the aspect ratio is preserved
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});

export default LocalImage;
