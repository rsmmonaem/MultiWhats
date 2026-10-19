const SERVICE_NAME: &str = "com.multiwhats.desktop";

pub fn set_secret(account_id: &str, secret: &str) -> Result<(), String> {
    let entry = keyring::Entry::new(SERVICE_NAME, account_id)
        .map_err(|e| format!("Failed to initialize keychain entry: {}", e))?;
    entry
        .set_password(secret)
        .map_err(|e| format!("Keychain set_password failed: {}", e))?;
    Ok(())
}

pub fn get_secret(account_id: &str) -> Result<Option<String>, String> {
    let entry = keyring::Entry::new(SERVICE_NAME, account_id)
        .map_err(|e| format!("Failed to initialize keychain entry: {}", e))?;
    match entry.get_password() {
        Ok(secret) => Ok(Some(secret)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(format!("Keychain get_password failed: {}", e)),
    }
}

pub fn delete_secret(account_id: &str) -> Result<(), String> {
    let entry = keyring::Entry::new(SERVICE_NAME, account_id)
        .map_err(|e| format!("Failed to initialize keychain entry: {}", e))?;
    match entry.delete_credential() {
        Ok(_) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(format!("Keychain delete_credential failed: {}", e)),
    }
}
