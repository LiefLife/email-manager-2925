/// 三层加密模块
/// 
/// 第一层：AES-256-GCM加密（使用机器特征派生的密钥）
/// 第二层：基于用户邮箱的PBKDF2密钥派生
/// 第三层：操作系统级别的keyring存储

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use pbkdf2::pbkdf2_hmac;
use sha2::Sha256;
use rand::RngCore;
use base64::{Engine as _, engine::general_purpose};
use keyring::Entry;

const PBKDF2_ITERATIONS: u32 = 100_000;
const SALT_LENGTH: usize = 32;
const NONCE_LENGTH: usize = 12;

/// 加密错误类型
#[derive(Debug)]
pub enum CryptoError {
    EncryptionFailed(String),
    DecryptionFailed(String),
    KeyringError(String),
    InvalidData(String),
}

impl std::fmt::Display for CryptoError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CryptoError::EncryptionFailed(msg) => write!(f, "加密失败: {}", msg),
            CryptoError::DecryptionFailed(msg) => write!(f, "解密失败: {}", msg),
            CryptoError::KeyringError(msg) => write!(f, "密钥环错误: {}", msg),
            CryptoError::InvalidData(msg) => write!(f, "无效数据: {}", msg),
        }
    }
}

impl std::error::Error for CryptoError {}

/// 获取机器唯一标识符
/// 用于第一层加密的密钥派生
fn get_machine_id() -> Result<String, CryptoError> {
    machine_uid::get()
        .map_err(|e| CryptoError::EncryptionFailed(format!("无法获取机器ID: {}", e)))
}

/// 第一层加密：使用机器ID派生的密钥进行AES-256-GCM加密
/// 
/// # 参数
/// * `data` - 要加密的数据
/// * `email` - 用户邮箱（用于第二层密钥派生）
fn layer1_encrypt(data: &[u8], email: &str) -> Result<Vec<u8>, CryptoError> {
    // 获取机器ID
    let machine_id = get_machine_id()?;
    
    // 生成随机盐
    let mut salt = vec![0u8; SALT_LENGTH];
    OsRng.fill_bytes(&mut salt);
    
    // 使用PBKDF2从机器ID和邮箱派生密钥
    let mut key = [0u8; 32];
    let combined_input = format!("{}{}", machine_id, email);
    pbkdf2_hmac::<Sha256>(
        combined_input.as_bytes(),
        &salt,
        PBKDF2_ITERATIONS,
        &mut key,
    );
    
    // 创建AES-256-GCM加密器
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| CryptoError::EncryptionFailed(format!("创建加密器失败: {}", e)))?;
    
    // 生成随机nonce
    let mut nonce_bytes = [0u8; NONCE_LENGTH];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    // 加密数据
    let ciphertext = cipher
        .encrypt(nonce, data)
        .map_err(|e| CryptoError::EncryptionFailed(format!("加密失败: {}", e)))?;
    
    // 组合：salt + nonce + ciphertext
    let mut result = Vec::new();
    result.extend_from_slice(&salt);
    result.extend_from_slice(&nonce_bytes);
    result.extend_from_slice(&ciphertext);
    
    Ok(result)
}

/// 第一层解密：使用机器ID派生的密钥进行AES-256-GCM解密
/// 
/// # 参数
/// * `encrypted_data` - 加密的数据（包含salt + nonce + ciphertext）
/// * `email` - 用户邮箱
fn layer1_decrypt(encrypted_data: &[u8], email: &str) -> Result<Vec<u8>, CryptoError> {
    // 验证数据长度
    if encrypted_data.len() < SALT_LENGTH + NONCE_LENGTH {
        return Err(CryptoError::InvalidData("加密数据太短".to_string()));
    }
    
    // 提取salt、nonce和ciphertext
    let salt = &encrypted_data[0..SALT_LENGTH];
    let nonce_bytes = &encrypted_data[SALT_LENGTH..SALT_LENGTH + NONCE_LENGTH];
    let ciphertext = &encrypted_data[SALT_LENGTH + NONCE_LENGTH..];
    
    // 获取机器ID
    let machine_id = get_machine_id()?;
    
    // 使用PBKDF2从机器ID和邮箱派生密钥
    let mut key = [0u8; 32];
    let combined_input = format!("{}{}", machine_id, email);
    pbkdf2_hmac::<Sha256>(
        combined_input.as_bytes(),
        salt,
        PBKDF2_ITERATIONS,
        &mut key,
    );
    
    // 创建AES-256-GCM解密器
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| CryptoError::DecryptionFailed(format!("创建解密器失败: {}", e)))?;
    
    let nonce = Nonce::from_slice(nonce_bytes);
    
    // 解密数据
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| CryptoError::DecryptionFailed(format!("解密失败: {}", e)))?;
    
    Ok(plaintext)
}

/// 第二层加密：使用用户邮箱派生的密钥进行额外加密
/// 
/// # 参数
/// * `data` - 第一层加密后的数据
/// * `email` - 用户邮箱
fn layer2_encrypt(data: &[u8], email: &str) -> Result<Vec<u8>, CryptoError> {
    // 生成随机盐
    let mut salt = vec![0u8; SALT_LENGTH];
    OsRng.fill_bytes(&mut salt);
    
    // 使用PBKDF2从邮箱派生密钥
    let mut key = [0u8; 32];
    pbkdf2_hmac::<Sha256>(
        email.as_bytes(),
        &salt,
        PBKDF2_ITERATIONS * 2, // 使用更多迭代次数
        &mut key,
    );
    
    // 创建AES-256-GCM加密器
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| CryptoError::EncryptionFailed(format!("第二层加密器创建失败: {}", e)))?;
    
    // 生成随机nonce
    let mut nonce_bytes = [0u8; NONCE_LENGTH];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    // 加密数据
    let ciphertext = cipher
        .encrypt(nonce, data)
        .map_err(|e| CryptoError::EncryptionFailed(format!("第二层加密失败: {}", e)))?;
    
    // 组合：salt + nonce + ciphertext
    let mut result = Vec::new();
    result.extend_from_slice(&salt);
    result.extend_from_slice(&nonce_bytes);
    result.extend_from_slice(&ciphertext);
    
    Ok(result)
}

/// 第二层解密：使用用户邮箱派生的密钥进行解密
/// 
/// # 参数
/// * `encrypted_data` - 第二层加密的数据
/// * `email` - 用户邮箱
fn layer2_decrypt(encrypted_data: &[u8], email: &str) -> Result<Vec<u8>, CryptoError> {
    // 验证数据长度
    if encrypted_data.len() < SALT_LENGTH + NONCE_LENGTH {
        return Err(CryptoError::InvalidData("第二层加密数据太短".to_string()));
    }
    
    // 提取salt、nonce和ciphertext
    let salt = &encrypted_data[0..SALT_LENGTH];
    let nonce_bytes = &encrypted_data[SALT_LENGTH..SALT_LENGTH + NONCE_LENGTH];
    let ciphertext = &encrypted_data[SALT_LENGTH + NONCE_LENGTH..];
    
    // 使用PBKDF2从邮箱派生密钥
    let mut key = [0u8; 32];
    pbkdf2_hmac::<Sha256>(
        email.as_bytes(),
        salt,
        PBKDF2_ITERATIONS * 2,
        &mut key,
    );
    
    // 创建AES-256-GCM解密器
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| CryptoError::DecryptionFailed(format!("第二层解密器创建失败: {}", e)))?;
    
    let nonce = Nonce::from_slice(nonce_bytes);
    
    // 解密数据
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| CryptoError::DecryptionFailed(format!("第二层解密失败: {}", e)))?;
    
    Ok(plaintext)
}

/// 第三层：使用操作系统keyring存储
/// 
/// # 参数
/// * `email` - 用户邮箱（作为keyring的用户名）
/// * `encrypted_data` - 第二层加密后的数据
pub fn layer3_save(email: &str, encrypted_data: &[u8]) -> Result<(), CryptoError> {
    // 创建keyring条目
    let entry = Entry::new("email-manager-2925", email)
        .map_err(|e| CryptoError::KeyringError(format!("创建keyring条目失败: {}", e)))?;
    
    // 将二进制数据编码为base64
    let encoded = general_purpose::STANDARD.encode(encrypted_data);
    
    // 保存到keyring
    entry
        .set_password(&encoded)
        .map_err(|e| CryptoError::KeyringError(format!("保存到keyring失败: {}", e)))?;
    
    Ok(())
}

/// 第三层：从操作系统keyring读取
/// 
/// # 参数
/// * `email` - 用户邮箱
pub fn layer3_load(email: &str) -> Result<Vec<u8>, CryptoError> {
    // 创建keyring条目
    let entry = Entry::new("email-manager-2925", email)
        .map_err(|e| CryptoError::KeyringError(format!("创建keyring条目失败: {}", e)))?;
    
    // 从keyring读取
    let encoded = entry
        .get_password()
        .map_err(|e| CryptoError::KeyringError(format!("从keyring读取失败: {}", e)))?;
    
    // 解码base64
    let decoded = general_purpose::STANDARD
        .decode(encoded)
        .map_err(|e| CryptoError::InvalidData(format!("base64解码失败: {}", e)))?;
    
    Ok(decoded)
}

/// 第三层：从操作系统keyring删除
/// 
/// # 参数
/// * `email` - 用户邮箱
#[allow(dead_code)]
pub fn layer3_delete(email: &str) -> Result<(), CryptoError> {
    let entry = Entry::new("email-manager-2925", email)
        .map_err(|e| CryptoError::KeyringError(format!("创建keyring条目失败: {}", e)))?;
    
    entry
        .delete_password()
        .map_err(|e| CryptoError::KeyringError(format!("从keyring删除失败: {}", e)))?;
    
    Ok(())
}

/// 三层加密保存密码
/// 
/// # 参数
/// * `password` - 明文密码
/// * `email` - 用户邮箱
pub fn encrypt_and_save_password(password: &str, email: &str) -> Result<(), CryptoError> {
    // 第一层：使用机器ID加密
    let layer1_encrypted = layer1_encrypt(password.as_bytes(), email)?;
    
    // 第二层：使用邮箱加密
    let layer2_encrypted = layer2_encrypt(&layer1_encrypted, email)?;
    
    // 第三层：保存到keyring
    layer3_save(email, &layer2_encrypted)?;
    
    Ok(())
}

/// 三层解密读取密码
/// 
/// # 参数
/// * `email` - 用户邮箱
pub fn load_and_decrypt_password(email: &str) -> Result<String, CryptoError> {
    // 第三层：从keyring读取
    let layer2_encrypted = layer3_load(email)?;
    
    // 第二层：使用邮箱解密
    let layer1_encrypted = layer2_decrypt(&layer2_encrypted, email)?;
    
    // 第一层：使用机器ID解密
    let password_bytes = layer1_decrypt(&layer1_encrypted, email)?;
    
    // 转换为字符串
    let password = String::from_utf8(password_bytes)
        .map_err(|e| CryptoError::InvalidData(format!("密码数据无效: {}", e)))?;
    
    Ok(password)
}

/// 删除保存的密码
/// 
/// # 参数
/// * `email` - 用户邮箱
#[allow(dead_code)]
pub fn delete_saved_password(email: &str) -> Result<(), CryptoError> {
    layer3_delete(email)
}
