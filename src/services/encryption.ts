let encryptionKey: CryptoKey | null = null;
const appName = import.meta.env.VITE_APP_NAME

class EncryptionService {
  public static get encryptionKey(): CryptoKey | null {
    return encryptionKey;
  }

  public async generateEncryptionKey(username: string, password: string): Promise<CryptoKey> {
    // Create a salt from the username to make the key unique per user
    const salt = new TextEncoder().encode(username + appName);
    
    // Derive key from password using PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return encryptionKey;
  }

  public async encryptAndStorePrivateKey(privateKey: string): Promise<void> {
    if (!encryptionKey) {
      console.error('Encryption key not generated.');
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(privateKey);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector (IV)
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      data
    );
    const encryptedArray = new Uint8Array([...iv, ...new Uint8Array(encryptedData)]);
    localStorage.setItem(appName + '-encryptedpk', JSON.stringify(Array.from(encryptedArray)));
  }

  public async decryptPrivateKey(): Promise<string> {
    if (!encryptionKey) {
      console.error('Encryption key not available.');
      return '';
    }
    const encryptedKeyString = localStorage.getItem(appName + '-encryptedpk');
    if (!encryptedKeyString) {
      console.error('No encrypted private key found.');
      return '';
    }
    const encryptedKey = new Uint8Array(JSON.parse(encryptedKeyString));
    const iv = encryptedKey.slice(0, 12);
    const encryptedData = encryptedKey.slice(12);
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      encryptedData
    );
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  }
}

export default new EncryptionService();
