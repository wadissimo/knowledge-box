import { useSQLiteContext } from "expo-sqlite";

function useDbUtils() {
  const db = useSQLiteContext();
  async function runQuery(query: string): Promise<any> {
    const res = await db.getAllAsync(query);
    return res;
  }
  return {
    runQuery,
  };
}

export { useDbUtils };
