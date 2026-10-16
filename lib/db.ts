export interface SavedBook {
  id: string;
  name: string;
  type: "epub" | "pdf";
  data: ArrayBuffer;
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  lastLocation?: string | number; // CFI para EPUB ou índice da página para PDF
  updatedAt: number;
}

const DB_NAME = "readepub_library";
const STORE_NAME = "books";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveBookToLibrary(book: SavedBook): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(book);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllBooksFromLibrary(): Promise<SavedBook[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const books: SavedBook[] = request.result || [];
      books.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(books);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updateBookLocation(
  id: string,
  currentPage: number,
  totalPages: number,
  progressPercent: number,
  lastLocation: string | number
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const book = getReq.result as SavedBook;
      if (book) {
        book.currentPage = currentPage;
        book.totalPages = Math.max(book.totalPages, totalPages);
        book.progressPercent = progressPercent;
        book.lastLocation = lastLocation;
        book.updatedAt = Date.now();
        store.put(book);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function deleteBookFromLibrary(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}