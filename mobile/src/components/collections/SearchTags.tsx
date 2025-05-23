import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useThemeColors } from '@/src/context/ThemeContext';

const predefinedTags = ['#language', '#geography', '#sport', '#math', '#biology', '#history'];
const SearchTags = ({ onTagPressed }: { onTagPressed: Function }) => {
  const { themeColors } = useThemeColors();
  return (
    <View style={styles.tagsContainer}>
      {predefinedTags.map(tag => (
        <TouchableOpacity onPress={() => onTagPressed(tag)} key={`tag_${tag}`}>
          <Text style={[styles.tagText, { color: themeColors.text }]}>{tag}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tagsContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SearchTags;
