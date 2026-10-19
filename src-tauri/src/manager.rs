use crate::models::{AccountRecord, WebviewBounds};
use std::collections::HashSet;
use std::sync::Mutex;
use tauri::{
    AppHandle, LogicalPosition, LogicalSize, Manager, Rect, WebviewUrl, webview::WebviewBuilder,
};

#[cfg(target_os = "macos")]
pub const DESKTOP_USER_AGENT: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15";

#[cfg(not(target_os = "macos"))]
pub const DESKTOP_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0";

pub const WHATSAPP_WEB_URL: &str = "https://web.whatsapp.com";

pub struct SessionManager {
    pub active_account_id: Mutex<Option<String>>,
    pub known_account_ids: Mutex<HashSet<String>>,
    pub last_bounds: Mutex<Option<WebviewBounds>>,
}

impl Default for SessionManager {
    fn default() -> Self {
        Self {
            active_account_id: Mutex::new(None),
            known_account_ids: Mutex::new(HashSet::new()),
            last_bounds: Mutex::new(None),
        }
    }
}

impl SessionManager {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn get_active_account_id(&self) -> Option<String> {
        self.active_account_id.lock().unwrap().clone()
    }

    pub fn switch_account(
        &self,
        app: &AppHandle,
        account: &AccountRecord,
        data_store_bytes: [u8; 16],
        bounds: &WebviewBounds,
    ) -> Result<(), String> {
        // Hide currently active webview if different
        let mut active_guard = self.active_account_id.lock().map_err(|e| e.to_string())?;
        if let Some(ref prev_id) = *active_guard
            && prev_id != &account.id
        {
            let prev_label = format!("account-view-{}", prev_id);
            if let Some(prev_view) = app.get_webview(&prev_label) {
                let _ = prev_view.hide();
            }
        }

        let target_label = format!("account-view-{}", account.id);
        let rect = Rect {
            position: LogicalPosition::new(bounds.x, bounds.y).into(),
            size: LogicalSize::new(bounds.width, bounds.height).into(),
        };

        if let Some(existing_view) = app.get_webview(&target_label) {
            let _ = existing_view.set_bounds(rect);
            let _ = existing_view.show();
        } else {
            let window = app
                .get_window("main")
                .ok_or_else(|| "Main window not found".to_string())?;

            let url = WebviewUrl::External(
                WHATSAPP_WEB_URL
                    .parse()
                    .map_err(|e| format!("Invalid URL: {}", e))?,
            );

            let init_script = format!(
                r#"
                (function() {{
                    const ACCOUNT_ID = "{account_id}";
                    const ACCOUNT_NAME = "{account_name}";

                    // 1. Microphone & Camera Permission Mock for WhatsApp Call Readiness
                    if (navigator.permissions && navigator.permissions.query) {{
                        const origQuery = navigator.permissions.query.bind(navigator.permissions);
                        navigator.permissions.query = function(param) {{
                            if (param && (param.name === 'microphone' || param.name === 'camera' || param.name === 'notifications')) {{
                                return Promise.resolve({{
                                    state: 'granted',
                                    name: param.name,
                                    onchange: null,
                                    addEventListener: function() {{}},
                                    removeEventListener: function() {{}},
                                    dispatchEvent: function() {{ return false; }}
                                }});
                            }}
                            return origQuery(param);
                        }};
                    }}

                    // 2. Desktop Notification Native Bridge & Auto-Permission
                    try {{
                        const grantNotification = function(callback) {{
                            if (typeof callback === 'function') {{
                                try {{ callback('granted'); }} catch(e) {{}}
                            }}
                            return Promise.resolve('granted');
                        }};

                        if (typeof window.Notification !== 'undefined') {{
                            Object.defineProperty(window.Notification, 'permission', {{
                                get: () => 'granted',
                                set: () => {{}},
                                configurable: true
                            }});
                            window.Notification.requestPermission = grantNotification;

                            const OriginalNotification = window.Notification;
                            window.Notification = function(title, options) {{
                                try {{
                                    if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {{
                                        window.__TAURI_INTERNALS__.invoke('send_native_notification', {{
                                            title: title || ACCOUNT_NAME,
                                            body: options?.body || 'New WhatsApp message received',
                                            accountId: ACCOUNT_ID
                                        }});
                                    }}
                                }} catch (e) {{
                                    console.error('MultiWhats native notification dispatch error:', e);
                                }}
                                return new OriginalNotification(title, options);
                            }};
                            window.Notification.permission = 'granted';
                            window.Notification.requestPermission = grantNotification;
                            window.Notification.prototype = OriginalNotification.prototype;
                        }}
                    }} catch (e) {{
                        console.error('Notification bridge setup error:', e);
                    }}

                    // 3. Unread Message & Incoming Call Title Observer
                    let lastUnread = -1;
                    function checkUnreadCount() {{
                        const match = document.title.match(/\((\d+)\)/);
                        const count = match ? parseInt(match[1], 10) : 0;
                        if (count !== lastUnread) {{
                            lastUnread = count;
                            try {{
                                if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {{
                                    window.__TAURI_INTERNALS__.invoke('update_unread_count', {{
                                        accountId: ACCOUNT_ID,
                                        count: count
                                    }});
                                }}
                            }} catch (e) {{}}
                        }}
                    }}

                    // 4. Clean "Download WhatsApp for Mac" promo banner & Auto-dismiss notification prompts
                    function cleanWhatsAppUI() {{
                        // Hide desktop download promo
                        const links = document.querySelectorAll('a[href*="whatsapp.com/download"]');
                        links.forEach(link => {{
                            const container = link.closest('div');
                            if (container && container.textContent && container.textContent.includes('Download WhatsApp')) {{
                                container.style.display = 'none';
                            }}
                        }});

                        // Auto-dismiss "Allow notifications" in-page modal
                        const buttons = document.querySelectorAll('button, div[role="button"]');
                        buttons.forEach(btn => {{
                            const text = (btn.textContent || '').trim().toLowerCase();
                            if (text === 'ok' || text === 'turn on') {{
                                const modal = btn.closest('[data-animate-modal-popup], [role="dialog"], [role="alertdialog"], div');
                                if (modal && modal.textContent && modal.textContent.includes('Allow notifications')) {{
                                    if (text === 'ok') {{
                                        btn.click();
                                    }}
                                }}
                            }}
                        }});

                        // Hide or dismiss "Message and call notifications are off"
                        const banners = document.querySelectorAll('div');
                        banners.forEach(b => {{
                            if (b.textContent && b.textContent.includes('Message and call notifications are off') && b.children.length < 5) {{
                                const closeBtn = b.querySelector('button, [data-icon="x"]');
                                if (closeBtn) {{
                                    closeBtn.click();
                                }}
                            }}
                        }});

                        checkUnreadCount();
                    }}

                    if (document.readyState === 'loading') {{
                        document.addEventListener('DOMContentLoaded', cleanWhatsAppUI);
                    }} else {{
                        cleanWhatsAppUI();
                    }}
                    setInterval(cleanWhatsAppUI, 800);
                }})();
                "#,
                account_id = account.id,
                account_name = account.name.replace('"', "\\\"")
            );

            // Construct isolated child webview with platform-optimized isolation and media permissions
            let mut builder = WebviewBuilder::new(&target_label, url)
                .user_agent(DESKTOP_USER_AGENT)
                .initialization_script(&init_script)
                .on_permission_request(|_webview, kind| {
                    use tauri::webview::{PermissionKind, PermissionResponse};
                    match kind {
                        PermissionKind::Microphone => PermissionResponse::Allow,
                        PermissionKind::Camera => PermissionResponse::Allow,
                        PermissionKind::Notifications => PermissionResponse::Allow,
                        _ => PermissionResponse::Allow,
                    }
                })
                .auto_resize();

            #[cfg(target_os = "macos")]
            {
                builder = builder.data_store_identifier(data_store_bytes);
            }

            #[cfg(not(target_os = "macos"))]
            {
                if let Ok(app_dir) = app.path().app_data_dir() {
                    let profile_dir = app_dir.join("profiles").join(&account.id);
                    let _ = std::fs::create_dir_all(&profile_dir);
                    builder = builder.data_directory(profile_dir);
                }
            }

            let _child = window
                .add_child(
                    builder,
                    LogicalPosition::new(bounds.x, bounds.y),
                    LogicalSize::new(bounds.width, bounds.height),
                )
                .map_err(|e| format!("Failed to create child webview: {}", e))?;

            let mut known = self.known_account_ids.lock().map_err(|e| e.to_string())?;
            known.insert(account.id.clone());
        }

        *active_guard = Some(account.id.clone());

        if let Ok(mut last_b) = self.last_bounds.lock() {
            *last_b = Some(bounds.clone());
        }

        Ok(())
    }

    pub fn set_webviews_visible(&self, app: &AppHandle, visible: bool) -> Result<(), String> {
        let active_id = self.active_account_id.lock().map_err(|e| e.to_string())?;
        if let Some(ref id) = *active_id {
            let label = format!("account-view-{}", id);
            if let Some(view) = app.get_webview(&label) {
                if visible {
                    let _ = view.show();
                } else {
                    let _ = view.hide();
                }
            }
        }
        Ok(())
    }

    pub fn update_bounds(&self, app: &AppHandle, bounds: &WebviewBounds) -> Result<(), String> {
        if let Ok(mut last_b) = self.last_bounds.lock() {
            *last_b = Some(bounds.clone());
        }

        let active_id = self.active_account_id.lock().map_err(|e| e.to_string())?;
        if let Some(ref id) = *active_id {
            let label = format!("account-view-{}", id);
            if let Some(view) = app.get_webview(&label) {
                let rect = Rect {
                    position: LogicalPosition::new(bounds.x, bounds.y).into(),
                    size: LogicalSize::new(bounds.width, bounds.height).into(),
                };
                let _ = view.set_bounds(rect);
            }
        }
        Ok(())
    }

    pub fn reload_account(&self, app: &AppHandle, account_id: &str) -> Result<(), String> {
        let label = format!("account-view-{}", account_id);
        if let Some(view) = app.get_webview(&label) {
            let _ = view.eval("window.location.reload();");
            Ok(())
        } else {
            Err("Account webview not loaded yet".to_string())
        }
    }

    pub fn logout_account(&self, app: &AppHandle, account_id: &str) -> Result<(), String> {
        let label = format!("account-view-{}", account_id);
        if let Some(view) = app.get_webview(&label) {
            let script = "try { window.localStorage.clear(); window.sessionStorage.clear(); } catch(e){} window.location.href = 'https://web.whatsapp.com';";
            let _ = view.eval(script);
            Ok(())
        } else {
            Err("Account webview not found".to_string())
        }
    }

    pub fn close_account_webview(&self, app: &AppHandle, account_id: &str) -> Result<(), String> {
        let mut active_id = self.active_account_id.lock().map_err(|e| e.to_string())?;
        if active_id.as_deref() == Some(account_id) {
            *active_id = None;
        }

        let label = format!("account-view-{}", account_id);
        if let Some(view) = app.get_webview(&label) {
            let _ = view.close();
        }

        let mut known = self.known_account_ids.lock().map_err(|e| e.to_string())?;
        known.remove(account_id);

        Ok(())
    }
}
