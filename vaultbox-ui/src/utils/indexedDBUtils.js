export function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('VaultBoxDB', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('keys')) {
                db.createObjectStore('keys', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Store Private Key in IndexedDB
export async function storePrivateKey(privateKey) {
    const db = await openDatabase();
    const transaction = db.transaction('keys', 'readwrite');
    const store = transaction.objectStore('keys');

    store.put({ id: 'privateKey', key: privateKey });
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(transaction.error);
    });
}

// Retrieve Private Key from IndexedDB
export async function getPrivateKey() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('keys', 'readonly');
        const store = transaction.objectStore('keys');
        const request = store.get('privateKey');

        request.onsuccess = () => resolve(request.result ? request.result.key : null);
        request.onerror = () => reject(request.error);
    });
}
