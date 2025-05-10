import { useThemeColors } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PrimaryButton = ({ text, onClick }: { text: string; onClick: () => void }) => {
  const { themeColors } = useThemeColors();
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[styles.btn, { backgroundColor: themeColors.primaryBtnBg }]}>
        <Text style={[styles.btnText, { color: themeColors.primaryBtnText }]}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btnText: {
    textTransform: 'uppercase',
    //fontFamily: 'Poppins_400Regular',
    fontWeight: '600',
    fontSize: 14,
  },

  btn: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    width: '100%',
    shadowColor: '#0288d1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
});

export default PrimaryButton;
