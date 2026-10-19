pub mod commands;
pub mod db;
pub mod keychain;
pub mod manager;
pub mod models;

use commands::*;
use db::Database;
use manager::SessionManager;
use std::fs;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Determine application data directory for SQLite database storage
            let app_data_dir = app
                .path()
                .app_data_dir()
                .map_err(|e| format!("Failed to get app_data_dir: {}", e))?;

            if !app_data_dir.exists() {
                fs::create_dir_all(&app_data_dir)
                    .map_err(|e| format!("Failed to create app data directory: {}", e))?;
            }

            let db_path = app_data_dir.join("multiwhats.db");
            let database = Database::new(db_path)
                .map_err(|e| format!("Database initialization error: {}", e))?;

            let session_manager = SessionManager::new();

            app.manage(database);
            app.manage(session_manager);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_accounts,
            create_account,
            update_account,
            delete_account,
            switch_account,
            set_webviews_visible,
            update_active_webview_bounds,
            reload_account,
            logout_account,
            get_active_account_id,
            get_system_info,
            save_secure_note,
            get_secure_note,
            get_setting,
            set_setting,
            restart_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running MultiWhats desktop application");
}
