/**
 * 文件加密解密工具函数
 * 基于 Web Crypto API 实现 AES-GCM 加密
 */

/**
 * 从密码生成加密密钥
 * @param {string} password - 用户输入的密码
 * @param {Uint8Array} salt - 盐值
 * @returns {Promise<CryptoKey>} 加密密钥
 */
async function deriveKey(password, salt) {
  // Ensure Web Crypto API is available (must be secure context: https or localhost)
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error('Web Crypto API is not available in this context. Ensure the app is served over HTTPS or running on localhost and use a modern browser.');
  }
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 加密文件
 * @param {File} file - 要加密的文件
 * @param {string} password - 加密密码
 * @returns {Promise<Blob>} 加密后的文件
 */
export async function encryptFile(file, password) {
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error('Web Crypto API is not available in this context. Ensure the app is served over HTTPS or running on localhost and use a modern browser.');
  }
  const arrayBuffer = await file.arrayBuffer();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const fileName = file.name;
  const extensionMatch = fileName.match(/\.([^.]+)$/);
  const extension = extensionMatch ? extensionMatch[1] : '';
  
  const encoder = new TextEncoder();
  const extensionBytes = encoder.encode(extension);
  const extensionLength = new Uint8Array([extensionBytes.length]);

  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    arrayBuffer
  );

  const totalLength = salt.length + iv.length + extensionLength.length + 
                     extensionBytes.length + encryptedData.byteLength;
  const resultBuffer = new Uint8Array(totalLength);
  
  let offset = 0;
  resultBuffer.set(salt, offset);
  offset += salt.length;
  resultBuffer.set(iv, offset);
  offset += iv.length;
  resultBuffer.set(extensionLength, offset);
  offset += extensionLength.length;
  resultBuffer.set(extensionBytes, offset);
  offset += extensionBytes.length;
  resultBuffer.set(new Uint8Array(encryptedData), offset);

  return new Blob([resultBuffer], { type: 'application/octet-stream' });
}

/**
 * 解密文件
 * @param {File} file - 要解密的文件
 * @param {string} password - 解密密码
 * @returns {Promise<{blob: Blob, extension: string}>} 解密后的文件和原始扩展名
 */
export async function decryptFile(file, password) {
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error('Web Crypto API is not available in this context. Ensure the app is served over HTTPS or running on localhost and use a modern browser.');
  }
  const arrayBuffer = await file.arrayBuffer();
  const dataView = new Uint8Array(arrayBuffer);

  const salt = dataView.slice(0, 16);
  const iv = dataView.slice(16, 28);
  const extensionLength = dataView[28];
  const extensionBytes = dataView.slice(29, 29 + extensionLength);
  const encryptedData = dataView.slice(29 + extensionLength);

  const decoder = new TextDecoder();
  const extension = decoder.decode(extensionBytes);

  const key = await deriveKey(password, salt);

  try {
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    return {
      blob: new Blob([decryptedData]),
      extension
    };
  } catch (error) {
    throw new Error('解密失败，请检查密码是否正确');
  }
}

/**
 * 检查密码强度
 * @param {string} password - 密码
 * @returns {Object} 强度信息 { strength: 'weak'|'medium'|'strong', score: 0-100 }
 */
export function checkPasswordStrength(password) {
  let score = 0;
  
  if (!password) return { strength: 'weak', score: 0 };
  
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  
  let strength = 'weak';
  if (score >= 60) strength = 'medium';
  if (score >= 80) strength = 'strong';
  
  return { strength, score };
}