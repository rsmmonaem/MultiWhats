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

#[derive(serde::Serialize, Clone)]
pub struct InAppNotificationPayload {
    pub account_id: String,
    pub account_name: String,
    pub title: String,
    pub body: String,
}

#[tauri::command]
pub fn send_native_notification(
    app: AppHandle,
    title: String,
    body: String,
    account_id: Option<String>,
    account_name: Option<String>,
) -> Result<(), String> {
    use tauri::Emitter;
    use tauri_plugin_notification::NotificationExt;

    let acc_id = account_id.clone().unwrap_or_default();
    let acc_name = account_name
        .clone()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| "WhatsApp".to_string());

    let display_title = if !acc_name.is_empty() && acc_name != title {
        format!("{} • {}", title, acc_name)
    } else {
        title.clone()
    };

    // 1. Show System notification (works when app is in background/minimized)
    let _ = app
        .notification()
        .builder()
        .title(&display_title)
        .body(&body)
        .show();

    // 2. Play native macOS notification sound
    #[cfg(target_os = "macos")]
    {
        std::thread::spawn(|| {
            let _ = std::process::Command::new("afplay")
                .arg("/System/Library/Sounds/Glass.aiff")
                .output();
        });
    }

    // 3. Emit in-app notification event so React frontend can display a floating banner in the Header
    let _ = app.emit(
        "incoming_notification",
        InAppNotificationPayload {
            account_id: acc_id,
            account_name: acc_name,
            title,
            body,
        },
    );

    Ok(())
}

#[derive(serde::Serialize, Clone)]
pub struct UnreadUpdatePayload {
    pub account_id: String,
    pub count: u32,
}

static UNREAD_MAP: std::sync::LazyLock<std::sync::Mutex<std::collections::HashMap<String, u32>>> =
    std::sync::LazyLock::new(|| std::sync::Mutex::new(std::collections::HashMap::new()));

#[tauri::command]
pub fn update_unread_count(
    app: AppHandle,
    account_id: String,
    count: u32,
) -> Result<(), String> {
    use tauri::Emitter;

    let total_count: u32 = {
        let mut map = UNREAD_MAP.lock().unwrap();
        map.insert(account_id.clone(), count);
        map.values().sum()
    };

    // Emit event to frontend so sidebar account item updates its badge
    let _ = app.emit(
        "unread_count_updated",
        UnreadUpdatePayload {
            account_id,
            count,
        },
    );

    // Update native macOS Dock badge with total unread across all accounts
    #[cfg(target_os = "macos")]
    {
        use objc2_app_kit::NSApplication;
        use objc2_foundation::{MainThreadMarker, NSString};

        if let Some(mtm) = MainThreadMarker::new() {
            let ns_app = NSApplication::sharedApplication(mtm);
            let dock_tile = ns_app.dockTile();
            if total_count > 0 {
                let badge_str = total_count.to_string();
                let ns_str = NSString::from_str(&badge_str);
                dock_tile.setBadgeLabel(Some(&ns_str));
            } else {
                dock_tile.setBadgeLabel(None);
            }
        }
    }

    Ok(())
}

