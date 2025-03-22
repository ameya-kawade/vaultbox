// Opens the IndexedDB database
export function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('VaultBoxDB', 2);
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys', { keyPath: 'id' });
        }
      };
  
      request.onsuccess = () => {
        resolve(request.result);
      };
  
      request.onerror = () => {
        console.error("IndexedDB Error:", request.error);
        reject(request.error);
      };
    });
  }
  
  // Stores the private key in IndexedDB
  export async function storePrivateKey(privateKey) {
    try {
      const db = await openDatabase();
      const transaction = db.transaction('keys', 'readwrite');
      const store = transaction.objectStore('keys');
  
      store.put({ id: 'privateKey', key: privateKey }); // key is base64 String
  
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          resolve(true);
        };
        transaction.onerror = () => {
          console.error("Transaction Error:", transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error("Error storing private key:", error);
      return false;
    }
  }
  
  // Retrieves the private key from IndexedDB
  export async function getPrivateKey() {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('keys', 'readonly');
        const store = transaction.objectStore('keys');
        const request = store.get('privateKey');
  
        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.key); // key is base64 String
          } else {
            console.warn("Private key not found in IndexedDB.");
            resolve(null);
          }
        };
  
        request.onerror = () => {
          console.error("Error retrieving private key:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error getting private key:", error);
      return null;
    }
  }
  