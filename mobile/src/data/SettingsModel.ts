import * as SQLite from 'expo-sqlite';

type Setting = {
  id: string;
  label: string;
  category: string;
  type: string;
  value: string;
  options: string;
  keyboardType: string;
  link: string;
};

type SettingCategory = {
  id: string;
  title: string;
  icon: string;
};
const SETTINGS_DEFAULTS = {
  language: 'en',
  apiKey: '',
  model: 'gemini-1.5',
  newCards: '20',
  reviewCards: '50',
  learnCards: '10',
  theme: 'light',
};
export const SETTING_IDS = {
  language: 'language',
  apiKey: 'apiKey',
  model: 'model',
  newCards: 'newCards',
  reviewCards: 'reviewCards',
  learnCards: 'learnCards',
  theme: 'theme',
};
function useSettingsModel() {
  const db = SQLite.useSQLiteContext();

  // Insert or update a setting
  const upsertSetting = async (setting: Setting) => {
    try {
      await db.runAsync(
        `INSERT INTO settings (id, label, category, type, value, options, keyboardType, link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET value = excluded.value`,
        [
          setting.id,
          setting.label,
          setting.category,
          setting.type,
          setting.value,
          setting.options,
          setting.keyboardType,
          setting.link,
        ]
      );
    } catch (e) {
      console.log(e);
    }
  };

  const getAllSettings = async (): Promise<Setting[]> => {
    const result = await db.getAllAsync<Setting>(`SELECT * FROM settings`);
    return result;
  };

  const getAllSettingsByCategory = async (category: string): Promise<Setting[]> => {
    const result = await db.getAllAsync<Setting>(
      `SELECT * FROM settings where category=?`,
      category
    );
    return result;
  };

  //Delete
  const deleteSetting = async (settingId: string) => {
    await db.runAsync('DELETE FROM settings where id=?', settingId);
  };

  //Read
  const getSettingById = async (settingId: string) => {
    const result = await db.getFirstAsync<Setting | null>(
      'SELECT * FROM settings where id=?',
      settingId
    );
    return result;
  };

  const updateSettingById = async (settingId: string, value: string) => {
    await db.runAsync(`UPDATE settings SET value = ? WHERE id = ?`, [value, settingId]);
  };

  const getAllCategories = async (): Promise<SettingCategory[]> => {
    const result = await db.getAllAsync<SettingCategory>(`SELECT * FROM setting_categories`);
    return result;
  };

  return {
    upsertSetting,
    getAllSettings,
    getAllSettingsByCategory,
    deleteSetting,
    getSettingById,
    updateSettingById,
    getAllCategories,
  };
}

export { SETTINGS_DEFAULTS, Setting, SettingCategory, useSettingsModel };
