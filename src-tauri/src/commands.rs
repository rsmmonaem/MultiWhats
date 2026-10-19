use crate::db::Database;
use crate::keychain;
use crate::manager::SessionManager;
use crate::models::{
    AccountRecord, CreateAccountInput, SystemInfo, UpdateAccountInput, WebviewBounds,
};
use tauri::{AppHandle, State};

#[tauri::command]
pub fn get_accounts(db: State<Database>) -> Result<Vec<AccountRecord>, String> {
    db.get_accounts()
}

#[tauri::command]
pub fn create_account(
    db: State<Database>,
    input: CreateAccountInput,
) -> Result<AccountRecord, String> {
    if input.name.trim().is_empty() {
        return Err("Account name cannot be empty".to_string());
    }
    db.create_account(input)
}

#[tauri::command]
pub fn update_account(
    db: State<Database>,
    input: UpdateAccountInput,
) -> Result<AccountRecord, String> {
    if input.name.trim().is_empty() {
        return Err("Account name cannot be empty".to_string());
    }
    db.update_account(input)
}

#[tauri::command]
pub fn delete_account(
    app: AppHandle,
    db: State<Database>,
    manager: State<SessionManager>,
    id: String,
) -> Result<(), String> {
    manager.close_account_webview(&app, &id)?;
    let _ = keychain::delete_secret(&id);
    db.delete_account(&id)
}

#[tauri::command]
pub fn switch_account(
    app: AppHandle,
    db: State<Database>,
    manager: State<SessionManager>,
    id: String,
    bounds: WebviewBounds,
) -> Result<(), String> {
    let accounts = db.get_accounts()?;
    let account = accounts
        .into_iter()
        .find(|a| a.id == id)
        .ok_or_else(|| format!("Account with ID {} not found", id))?;

    let data_store_bytes = db.get_account_data_store(&id)?;
    manager.switch_account(&app, &account, data_store_bytes, &bounds)?;
    let _ = db.update_last_active(&id);
    Ok(())
}

#[tauri::command]
pub fn set_webviews_visible(
    app: AppHandle,
    manager: State<SessionManager>,
    visible: bool,
) -> Result<(), String> {
    manager.set_webviews_visible(&app, visible)
}

#[tauri::command]
pub fn update_active_webview_bounds(
    app: AppHandle,
    manager: State<SessionManager>,
    bounds: WebviewBounds,
) -> Result<(), String> {
    manager.update_bounds(&app, &bounds)
}

#[tauri::command]
pub fn reload_account(
    app: AppHandle,
    manager: State<SessionManager>,
    id: String,
) -> Result<(), String> {
    manager.reload_account(&app, &id)
}

#[tauri::command]
pub fn logout_account(
    app: AppHandle,
    manager: State<SessionManager>,
    id: String,
) -> Result<(), String> {
    manager.logout_account(&app, &id)
}

#[tauri::command]
pub fn get_active_account_id(manager: State<SessionManager>) -> Result<Option<String>, String> {
    Ok(manager.get_active_account_id())
}

#[tauri::command]
pub fn save_secure_note(account_id: String, note: String) -> Result<(), String> {
    keychain::set_secret(&account_id, &note)
}

#[tauri::command]
pub fn get_secure_note(account_id: String) -> Result<Option<String>, String> {
    keychain::get_secret(&account_id)
}

#[tauri::command]
pub fn get_setting(db: State<Database>, key: String) -> Result<Option<String>, String> {
    db.get_setting(&key)
}

#[tauri::command]
pub fn set_setting(db: State<Database>, key: String, value: String) -> Result<(), String> {
    db.set_setting(&key, &value)
}

#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        tauri_version: "2.12.4".to_string(),
        macos_version: "macOS Sequoia (WebKit WKWebsiteDataStore)".to_string(),
        isolation_engine:
            "Apple WKWebsiteDataStore init(forIdentifier:) [Hardware & Kernel Isolated]".to_string(),
    })
}

#[tauri::command]
pub fn restart_app(app: AppHandle) {
    app.restart();
}
