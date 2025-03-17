const DB_NAME = "directory_history_db";
const DB_VERSION = 1;
const DB_STORE_NAME = "history";

let db: IDBDatabase | null = null;

function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("Error opening database:", event);
        reject(event);
      };

      request.onsuccess = (event) => {
        db = (event.target as IDBOpenDBRequest).result;

        resolve();
      };

      request.onupgradeneeded = (event) => {
        db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(DB_STORE_NAME, { keyPath: "dirName" });
      };
    } else {
      resolve();
    }
  });
}

export async function addDirToHistory(dirName: string): Promise<void> {
  if (!db) {
    await initDB();
  }

  const transaction = db!.transaction(DB_STORE_NAME, "readwrite");
  const store = transaction.objectStore(DB_STORE_NAME);
  const request = store.add({ dirName });

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error("Error adding directory to history:", event);

      reject(event);
    };
  });
}

export async function getHistory(): Promise<string[]> {
  if (!db) {
    await initDB();
  }

  const transaction = db!.transaction([DB_STORE_NAME], "readonly");
  const store = transaction.objectStore(DB_STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const directories: string[] = request.result.map((res) => res.dirName);

      resolve(directories);
    };

    request.onerror = (event) => {
      console.error("Error getting directory history:", event);

      reject(event);
    };
  });
}
