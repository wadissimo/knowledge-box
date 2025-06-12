import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Platform,
  Modal,
  Pressable,
  KeyboardTypeOptions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { getLocale, i18n, setLocale } from '@/src/lib/i18n';
import { Setting, SettingCategory, useSettingsModel } from '@/src/data/SettingsModel';
import { Href, router } from 'expo-router';
import { resetAISetup } from '@/src/service/AIService';
import { useThemeColors } from '@/src/context/ThemeContext';
import { useSettings } from '@/src/context/SettingsContext';
import ScreenContainer from '@/src/components/common/ScreenContainer';
import { CategoriesView } from '@/src/components/common/CategoriesView';

type Option = {
  label: string;
  value: string;
};

type Options = {
  language: Option[];
  model: Option[];
  theme: Option[];
};

const OPTIONS: Options = {
  language: [
    { label: 'English', value: 'en' },
    { label: 'Deutsch', value: 'de' },
    { label: '中文 (Chinese)', value: 'zh' },
    { label: 'Русский (Russian)', value: 'ru' },
    { label: 'Français (French)', value: 'fr' },
  ],
  model: [
    { label: 'Gemini 1.5', value: 'gemini-1.5' },
    { label: 'Gemini 2.0', value: 'gemini-2.0' },
  ],
  theme: [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ],
};

type OptionCategory = keyof typeof OPTIONS;

const SettingsTab = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [showReloadInfo, setShowReloadInfo] = useState(false);
  const { upsertSetting, getAllCategories, getAllSettings } = useSettingsModel();
  const [categories, setCategories] = useState<SettingCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { themeColors, setThemeColors } = useThemeColors();
  const { theme, setTheme, language, setLanguage } = useSettings();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [categories, settings] = await Promise.all([getAllCategories(), getAllSettings()]);
      setSettings(settings);
      setCategories(categories);

      setLoading(false);
    }
    loadData();
  }, []);

  const handleChange = (key: string, value: any) => {
    const newSetting = settings.map(setting => {
      if (setting.id === key) {
        setting.value = String(value);
      }
      return setting;
    });
    setSettings(newSetting);
  };

  const handleSave = () => {
    settings.forEach(setting => {
      upsertSetting(setting);
    });
    const curLanguage = settings.find(setting => setting.id === 'language')?.value;
    if (curLanguage && curLanguage !== language) {
      setShowReloadInfo(true);
      setLanguage(curLanguage);
    }
    const curTheme = settings.find(setting => setting.id === 'theme')?.value;
    if (curTheme && curTheme !== theme) {
      setTheme(curTheme);
    }
  };

  const handleResetAI = () => {
    // Reset AI setup logic here
    console.log('AI setup reset');
    resetAISetup();
  };

  const handleLinkClick = (id: string, link: string) => {
    console.log('Link clicked:', id, link);
    router.push(link as Href);
  };

  const handleButtonClick = (id: string) => {
    console.log('Button clicked:', id);
    switch (id) {
      case 'resetAI':
        handleResetAI();
        break;
      case 'database':
        router.push('./settings/database');
        break;
      default:
        break;
    }
  };

  const renderSetting = (setting: Setting) => {
    if (setting.type === 'picker') {
      return (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={setting.value}
            onValueChange={itemValue => handleChange(setting.id, itemValue)}
            style={[
              styles.picker,
              { backgroundColor: themeColors.inputBg, color: themeColors.inputText },
            ]}
            itemStyle={[styles.pickerItem, { color: themeColors.inputText }]}
            dropdownIconColor={themeColors.inputText}
            mode="dropdown"
          >
            {OPTIONS[setting.options as OptionCategory].map((opt: Option) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
      );
    }
    switch (setting.type) {
      case 'input':
        return (
          <TextInput
            style={[
              styles.input,
              { backgroundColor: themeColors.inputBg, color: themeColors.inputText },
            ]}
            value={setting.value}
            onChangeText={text => handleChange(setting.id, text)}
            placeholder={i18n.t(setting.label)}
            keyboardType={(setting.keyboardType || 'default') as KeyboardTypeOptions}
            placeholderTextColor={themeColors.inputText}
          />
        );
      case 'switch':
        return (
          <Switch
            value={setting.value === 'true'}
            onValueChange={value => handleChange(setting.id, value)}
            thumbColor={setting.value ? themeColors.primaryBtnBg : themeColors.secondaryBtnBg}
            trackColor={{ false: themeColors.secondaryBtnBg, true: themeColors.primaryBtnBg }}
          />
        );
      case 'select':
        return (
          <View style={styles.selectContainer}>
            {OPTIONS[setting.options as OptionCategory].map((opt: Option) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.selectOption,
                  { backgroundColor: themeColors.secondaryBtnBg },
                  setting.value === opt.value && {
                    backgroundColor: themeColors.primaryBtnBg,
                  },
                ]}
                onPress={() => handleChange(setting.id, opt.value)}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    { color: themeColors.secondaryBtnText },
                    setting.value === opt.value && { color: themeColors.primaryBtnText },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'button':
        return (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColors.primaryBtnBg }]}
            onPress={() => handleButtonClick(setting.id)}
          >
            <Text style={[styles.buttonText, { color: themeColors.primaryBtnText }]}>
              {i18n.t(setting.label)}
            </Text>
          </TouchableOpacity>
        );
      case 'link':
        return (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              handleLinkClick(setting.id, setting.link);
            }}
          >
            <Text style={styles.linkText}>{setting.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#1976d2" />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };
  const renderCategory = (categoryId: string) => {
    return (
      <>
        {settings
          .filter(setting => setting.category === categoryId)
          .map(setting => (
            <View key={setting.id} style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: themeColors.cardText }]}>
                {i18n.t(setting.label)}
              </Text>
              {renderSetting(setting)}
            </View>
          ))}
      </>
    );
  };
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingBottom: 96 }}>
        <ScrollView
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <CategoriesView
            categories={categories}
            renderCategory={renderCategory}
            defaultExpandedCategories={categories.map(g => g.id === 'common')}
          />
          {/* {categories.map((category, idx) => (
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
                  {settings
                    .filter(setting => setting.category === category.id)
                    .map(setting => (
                      <View key={setting.id} style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: themeColors.cardText }]}>
                          {i18n.t(setting.label)}
                        </Text>
                        {renderSetting(setting)}
                      </View>
                    ))}
                </View>
              )}
            </View>
          ))} */}
        </ScrollView>
      </View>
      <View style={styles.fabContainer} pointerEvents="box-none">
        <TouchableOpacity style={styles.fab} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name="save" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <Modal
        visible={showReloadInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReloadInfo(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowReloadInfo(false)}>
          <Pressable style={styles.modalContainer}>
            <Ionicons name="information-circle-outline" size={48} color="#1976d2" />
            <Text style={styles.modalTitle}>App Reload Required</Text>
            <Text style={styles.modalMessage}>
              Please restart the app for the language change to apply properly.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowReloadInfo(false)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupContainer: {
    marginHorizontal: 16,
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
  input: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    fontSize: 16,
    color: '#263238',
    minWidth: 120,
    flex: 1,
    marginLeft: 8,
  },
  pickerContainer: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 120,
    paddingVertical: 0,
  },
  picker: {
    // width: '100%',
    // height: 40,
    // paddingVertical: 0,
    // color: '#263238',
    // backgroundColor: 'transparent',
  },
  pickerItem: {
    // paddingVertical: 0,
    // fontSize: 16,
    // color: '#263238',
  },
  selectContainer: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  selectOption: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedOption: {
    backgroundColor: '#1976d2',
  },
  selectOptionText: {
    color: '#1976d2',
    fontWeight: '500',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#fff',
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingVertical: 6,
  },
  linkText: {
    color: '#1976d2',
    fontWeight: '500',
    fontSize: 16,
    marginRight: 4,
  },
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 64,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d32f2f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#b71c1c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    marginHorizontal: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#263238',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#546e7a',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsTab;
