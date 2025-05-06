let encryptionKey: CryptoKey | null = null;
const appName = import.meta.env.VITE_APP_NAME

export class EncryptionService {
  public static get encryptionKey(): CryptoKey | null {
    return encryptionKey;
  }

  public static async generateEncryptionKey(username: string, password: string): Promise<CryptoKey> {
    // Legacy: Derive key from password (posting key)
    const salt = new TextEncoder().encode(username + appName);
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

  public static async generatePinKey(username: string, pin: string): Promise<CryptoKey> {
    // Derive key from 4-digit PIN and username as salt
    const salt = new TextEncoder().encode(username + appName + '-pin');
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(pin),
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

  public static setEncryptionKey(key: CryptoKey | null) {
    encryptionKey = key;
  }

  public static async encryptAndReturnPrivateKey(privateKey: string): Promise<string> {
    if (!encryptionKey) {
      console.error('Encryption key not generated.');
      return '';
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
    return JSON.stringify(Array.from(encryptedArray));
  }

  public static async decryptPrivateKey(encryptedKeyString: string): Promise<string> {
    if (!encryptionKey) {
      console.error('Encryption key not available.');
      return '';
    }
    if (!encryptedKeyString) {
      console.error('No encrypted private key provided.');
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

