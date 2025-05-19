import { useThemeColors } from '@/src/context/ThemeContext';
import { TextInputProps } from 'react-native';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

const TextInputField = ({
  header,
  value,
  setValue,
  placeholder,
  multiline,
  numberOfLines,
  style,
}: {
  header: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: TextInputProps['style'];
}) => {
  const { themeColors } = useThemeColors();
  return (
    <View>
      <Text style={[styles.label, { color: themeColors.text }]}>{header}</Text>

      <TextInput
        style={[styles.input, style]}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    //textAlign: "center",
    color: '#333',
  },
  input: {
    backgroundColor: '#FFF',
    borderColor: '#DDD',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
});

export default TextInputField;
