import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "veloura-offline";
const DB_VERSION = 1;

type MutationRecord = {
  id?: number;
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("mutations")) {
          const store = db.createObjectStore("mutations", {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("timestamp", "timestamp");
        }
      },
    });
  }
  return dbPromise;
}

export async function enqueueMutation(
  type: string,
  data: Record<string, unknown>
): Promise<IDBValidKey> {
  const db = await getDB();
  return db.add("mutations", { type, data, timestamp: Date.now() });
}

export async function getAllMutations(): Promise<MutationRecord[]> {
  const db = await getDB();
  return db.getAll("mutations");
}

export async function deleteMutation(id: IDBValidKey): Promise<void> {
  const db = await getDB();
  await db.delete("mutations", id);
}

export async function clearMutations(): Promise<void> {
  const db = await getDB();
  await db.clear("mutations");
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB();
  return db.count("mutations");
}
