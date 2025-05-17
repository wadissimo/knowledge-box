import { useThemeColors } from '@/src/context/ThemeContext';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

const TextInputCard = ({
  header,
  value,
  setValue,
  placeholder,
  multiline,
  numberOfLines,
}: {
  header: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
}) => {
  const { themeColors } = useThemeColors();
  return (
    <View style={styles.card}>
      <View style={[styles.cardHeader, { backgroundColor: themeColors.cardBg }]}>
        <Text style={[styles.formText, { color: themeColors.popupText }]}>{header}</Text>
      </View>
      <View style={styles.cardBody}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,

    shadowColor: '#0288d1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  cardBody: {
    padding: 8,
    //paddingVertical: 12,
    paddingBottom: 20,
  },
  input: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    fontSize: 16,
    color: '#263238',
    minWidth: 120,
    textAlignVertical: 'top',
  },
  formText: {
    //fontFamily: 'Poppins_400Regular',
    fontSize: 18,
    color: '#263238',
    fontWeight: '600',
  },
});

export default TextInputCard;
