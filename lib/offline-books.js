
const DB_NAME = "bookforge-offline";
const DB_VERSION = 1;
const STORE_NAME = "books";

export function openOfflineBooksDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}


export async function saveOfflineBook(book) {
  const db = await openOfflineBooksDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readwrite");
    const store = transaction.objectStore("books");

    store.put(book);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}


export async function getOfflineBook(bookId) {
  const db = await openOfflineBooksDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readonly");
    const store = transaction.objectStore("books");
    const request = store.get(bookId);

    request.onsuccess = () => {
      db.close();
      resolve(request.result);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}
