import { useThemeColors } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { i18n } from '@/src/lib/i18n';

type Category = {
  id: string;
  title: string;
  icon: string;
};

export function CategoriesView({
  categories,
  renderCategory,
  defaultExpandedCategories,
}: {
  categories: Category[];
  renderCategory: (categoryId: string) => React.ReactNode;
  defaultExpandedCategories?: boolean[];
}) {
  const { themeColors } = useThemeColors();
  const [expandedCategories, setExpandedCategories] = useState<boolean[]>(
    defaultExpandedCategories ?? []
  );
  const handleExpand = (idx: number) => {
    setExpandedCategories(prev => prev.map((v, i) => (i === idx ? !v : v)));
  };

  return (
    <>
      {categories.map((category, idx) => (
        <View key={category.id} style={[styles.groupContainer]}>
          <TouchableOpacity
            style={[styles.groupHeader, { backgroundColor: themeColors.cardHeaderBg }]}
            onPress={() => handleExpand(idx)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={category.icon as any}
              size={24}
              color={themeColors.activeTintColor}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.groupTitle, { color: themeColors.cardHeaderText }]}>
              {i18n.t(category.title)}
            </Text>
            <View style={{ flex: 1 }} />
            <Ionicons
              name={expandedCategories[idx] ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={themeColors.activeTintColor}
            />
          </TouchableOpacity>
          {expandedCategories[idx] && (
            <View style={[styles.card, { backgroundColor: themeColors.cardBg }]}>
              {renderCategory(category.id)}
            </View>
          )}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  groupContainer: {
    marginHorizontal: 8,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'visible',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#e3f2fd',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#0288d1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  groupTitle: {
    fontSize: 18,
    color: '#263238',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 18,
    shadowColor: '#0288d1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  settingLabel: {
    fontSize: 16,
    color: '#263238',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
});
