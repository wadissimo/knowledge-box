import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite';
import { SETTINGS_DEFAULTS } from './SettingsModel';

const DATABASE_VERSION = 11;

function useDbUtils() {
  const db = useSQLiteContext();
  async function runQuery(query: string): Promise<any> {
    // try {
    const res = await db.getAllAsync(query);
    return res;
    // } catch (e) {
    //   console.error('runQuery error', e);
    //   throw e;
    // }
  }
  return {
    runQuery,
  };
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');

  const currentDbVersion = result?.user_version ?? 0;
  console.log('currentDbVersion', currentDbVersion);

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion < 5) {
    await db.execAsync(`
      DROP TABLE IF EXISTS settings;
      DROP TABLE IF EXISTS setting_categories;
      CREATE TABLE setting_categories (
        id TEXT PRIMARY KEY,
        title TEXT,
        icon TEXT
      );
      CREATE TABLE settings (
        id TEXT PRIMARY KEY,
        label TEXT,
        category TEXT,
        type TEXT,
        value TEXT,
        options TEXT,
        keyboardType TEXT,
        link TEXT,
        FOREIGN KEY (category) REFERENCES setting_categories(id) ON DELETE CASCADE
      );
      INSERT INTO setting_categories (id, title, icon) VALUES ('common', 'settings.common', 'settings-outline');
      INSERT INTO setting_categories (id, title, icon) VALUES ('ai', 'settings.ai', 'cloud-outline');
      INSERT INTO setting_categories (id, title, icon) VALUES ('train', 'settings.train', 'school-outline');
      INSERT INTO setting_categories (id, title, icon) VALUES ('appearance', 'settings.appearance', 'color-palette-outline');
      INSERT INTO setting_categories (id, title, icon) VALUES ('dev', 'settings.dev', 'construct-outline');
      INSERT INTO settings (id, label, category, type, value, options, keyboardType, link) VALUES ('language', 'settings.language', 'common', 'picker', '${SETTINGS_DEFAULTS.language}', 'language', '', '');
      INSERT INTO settings (id, label, category, type, value, options, keyboardType, link) VALUES ('apiKey', 'settings.apiKey', 'ai', 'input', '', '', '', '');
      INSERT INTO settings (id, label, category, type, value, options, keyboardType, link) VALUES ('model', 'settings.model', 'ai', 'select', '${SETTINGS_DEFAULTS.model}', 'model', '', '');
      INSERT INTO settings (id, label, category, type, value, options, keyboardType, link) VALUES ('newCards', 'settings.newCards', 'train', 'input', '${SETTINGS_DEFAULTS.newCards}', '', '', '');
      INSERT INTO settings (id, label, category, type, value, options, keyboardType, link) VALUES ('reviewCards', 'settings.reviewCards', 'train', 'input', '${SETTINGS_DEFAULTS.reviewCards}', '', '', '');
      INSERT INTO settings (id, label, category, type, value, options, keyboardType, link) VALUES ('learnCards', 'settings.learnCards', 'train', 'input', '${SETTINGS_DEFAULTS.learnCards}', '', '', '');
      INSERT INTO settings (id, label, category, type, value, options, keyboardType, link) VALUES ('theme', 'settings.theme', 'appearance', 'select', '${SETTINGS_DEFAULTS.theme}', 'theme', '', '');
      INSERT INTO settings (id, label, category, type, value, options, keyboardType, link) VALUES ('resetAI', 'settings.resetAI', 'dev', 'button', '', '', '', '');
      INSERT INTO settings (id, label, category, type, value, options, keyboardType, link) VALUES ('database', 'settings.database', 'dev', 'button', '', '', '', './settings/database');
      
      
      `);
    console.log('migration to version 5: create settings table');
  }
  if (currentDbVersion < 6) {
    await db.runAsync(`ALTER TABLE cards ADD COLUMN config TEXT`);
    console.log('migration to version 6: add config column to cards table');
  }

  if (currentDbVersion < 7) {
    await db.runAsync(`ALTER TABLE cards ADD COLUMN stability REAL`);
    await db.runAsync(`ALTER TABLE cards ADD COLUMN difficulty REAL`);
    await db.runAsync(`ALTER TABLE cards ADD COLUMN learningStep INTEGER`);
    await db.runAsync(`ALTER TABLE cards ADD COLUMN lastReviewTime INTEGER`);
    console.log('migration to version 7: add FSRS columns to cards table');
  }
  if (currentDbVersion < 8) {
    await db.runAsync(
      `INSERT INTO settings (id, label, category, type, value, options, keyboardType, link) VALUES ('audioAutoplay', 'settings.audioAutoplay', 'train', 'switch', 'false', '', '', '');`
    );
    console.log('migration to version 8: add audioAutoplay setting');
  }
  if (currentDbVersion < 9) {
    await db.runAsync(`ALTER TABLE sessionCards ADD COLUMN plannedReviewTime INTEGER`);
    console.log('migration to version 9: add plannedReviewTime column to sessionCards table');
  }
  if (currentDbVersion < 11) {
    await db.runAsync(`DROP TABLE IF EXISTS reviewLog;`);
    await db.runAsync(`CREATE TABLE reviewLog (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        cardId INTEGER,
                        cardState INTEGER,
                        reviewDuration INTEGER,
                        scheduledReviewTime INTEGER,
                        grade INTEGER,
                        stability REAL,
                        difficulty REAL,
                        createdAt INTEGER DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(cardId) REFERENCES cards(id) ON DELETE CASCADE)`);

    console.log('migration to version 11: create reviewLog table');
  }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export { useDbUtils, migrateDbIfNeeded };
