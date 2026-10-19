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

                    // 1b. Window.open Popups Auto-Allow Bridge
                    try {{
                        const origOpen = window.open;
                        window.open = function(url, target, features) {{
                            // Ensure the call window opens large enough (at least 960x700) so WhatsApp never shows "Make this window larger"
                            let enhancedFeatures = features || '';
                            if (!enhancedFeatures || enhancedFeatures.includes('width=') || enhancedFeatures.includes('height=')) {{
                                enhancedFeatures = 'width=960,height=700,resizable=yes,scrollbars=yes';
                            }}
                            try {{
                                if (origOpen) {{
                                    const win = origOpen.call(this, url, target, enhancedFeatures);
                                    if (win) {{
                                        try {{ win.resizeTo(960, 700); }} catch(e) {{}}
                                        return win;
                                    }}
                                }}
                            }} catch(e) {{}}

                            // Fallback compliant WindowProxy so WhatsApp popup permission check always succeeds
                            return {{
                                closed: false,
                                focus: function() {{}},
                                blur: function() {{}},
                                close: function() {{ this.closed = true; }},
                                postMessage: function() {{}},
                                addEventListener: function() {{}},
                                removeEventListener: function() {{}},
                                document: {{ write: function() {{}}, open: function() {{}}, close: function() {{}} }},
                                location: {{ href: url || '' }}
                            }};
                        }};
                    }} catch(e) {{
                        console.error('Popup bridge init error:', e);
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

                            let lastNotificationTime = 0;
                            const OriginalNotification = window.Notification;
                            window.Notification = function(title, options) {{
                                lastNotificationTime = Date.now();
                                try {{
                                    if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {{
                                        window.__TAURI_INTERNALS__.invoke('send_native_notification', {{
                                            title: title || ACCOUNT_NAME,
                                            body: options?.body || 'New WhatsApp message received',
                                            accountId: ACCOUNT_ID,
                                            accountName: ACCOUNT_NAME
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
                    let lastUnreadAlertTime = 0;
                    function checkUnreadCount() {{
                        const match = document.title.match(/\((\d+)\)/);
                        const count = match ? parseInt(match[1], 10) : 0;
                        if (count !== lastUnread) {{
                            const isNewMessage = (lastUnread !== -1 && count > lastUnread);
                            lastUnread = count;
                            try {{
                                if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {{
                                    window.__TAURI_INTERNALS__.invoke('update_unread_count', {{
                                        accountId: ACCOUNT_ID,
                                        count: count
                                    }});

                                    // If new message arrives in foreground and WhatsApp Web bypassed window.Notification,
                                    // dispatch native alert so user gets audio chime and in-app banner!
                                    if (isNewMessage && (Date.now() - lastUnreadAlertTime > 2500)) {{
                                        lastUnreadAlertTime = Date.now();
                                        window.__TAURI_INTERNALS__.invoke('send_native_notification', {{
                                            title: ACCOUNT_NAME,
                                            body: count === 1 ? 'New WhatsApp message received' : `${{count}} new unread messages`,
                                            accountId: ACCOUNT_ID,
                                            accountName: ACCOUNT_NAME
                                        }});
                                    }}
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

                        // Auto-dismiss "To open calls in a separate window, allow pop-ups" prompt
                        const popupBanners = document.querySelectorAll('div, [role="alertdialog"], [role="dialog"]');
                        popupBanners.forEach(p => {{
                            if (p.textContent && (p.textContent.includes('allow pop-ups') || p.textContent.includes('pop-up windows'))) {{
                                const closeBtn = p.querySelector('button, [data-icon="x"]');
                                if (closeBtn) {{
                                    closeBtn.click();
                                }} else if (p.children.length < 6) {{
                                    p.style.display = 'none';
                                }}
                            }}
                        }});

                        // 5. Video Call Enhancement: In-Window Fullscreen & Free Resizing
                        enhanceVideoCall();

                        checkUnreadCount();
                    }}

                    let isVideoMaximized = false;
                    let savedCallStyle = null;

                    function enhanceVideoCall() {{
                        const videos = document.querySelectorAll('video');
                        if (!videos || videos.length === 0) return;

                        const mainVideo = videos[0];
                        let container = mainVideo.parentElement;
                        while (container && container !== document.body) {{
                            const style = window.getComputedStyle(container);
                            if ((style.position === 'fixed' || style.position === 'absolute') &&
                                (container.querySelector('button') || container.style.transform || container.style.width)) {{
                                break;
                            }}
                            container = container.parentElement;
                        }}

                        if (!container || container === document.body) {{
                            container = mainVideo.closest('[data-animate-modal-popup], [role="dialog"], [data-testid*="call"]') || mainVideo.parentElement.parentElement;
                        }}

                        if (!container) return;

                        // Enable CSS free resizing so user can drag to resize freely
                        if (!container.dataset.resizableEnabled) {{
                            container.dataset.resizableEnabled = "true";
                            container.style.resize = "both";
                            container.style.overflow = "hidden";
                            container.style.minWidth = "320px";
                            container.style.minHeight = "240px";
                            container.style.maxWidth = "100vw";
                            container.style.maxHeight = "100vh";
                            container.style.boxShadow = "0 25px 60px rgba(0,0,0,0.7)";
                        }}

                        // Intercept native WhatsApp Fullscreen/Expand buttons
                        const nativeExpandButtons = container.querySelectorAll('button[aria-label*="Full screen" i], button[aria-label*="Expand" i], button[title*="Full screen" i], [data-icon="expand"], [data-icon="fullscreen"]');
                        nativeExpandButtons.forEach(btn => {{
                            if (!btn.dataset.intercepted) {{
                                btn.dataset.intercepted = "true";
                                btn.addEventListener('click', function(e) {{
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleMaximizeCall(container);
                                }}, true);
                            }}
                        }});

                        // Inject custom Maximize / Fullscreen button on top right of the call card
                        if (!container.querySelector('.multiwhats-fullscreen-btn')) {{
                            const maxBtn = document.createElement('button');
                            maxBtn.className = 'multiwhats-fullscreen-btn';
                            maxBtn.type = "button";
                            maxBtn.title = "Fullscreen / Maximize Video Call";
                            maxBtn.innerHTML = `
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                                </svg>
                            `;
                            maxBtn.style.cssText = "position: absolute; top: 12px; right: 12px; z-index: 9999999; background: rgba(0,0,0,0.65); backdrop-filter: blur(10px); border: 1.5px solid rgba(255,255,255,0.3); border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; transition: all 0.15s ease-out;";
                            maxBtn.onmouseenter = () => {{ maxBtn.style.background = "rgba(16,185,129,0.9)"; maxBtn.style.transform = "scale(1.08)"; }};
                            maxBtn.onmouseleave = () => {{ maxBtn.style.background = "rgba(0,0,0,0.65)"; maxBtn.style.transform = "scale(1)"; }};
                            maxBtn.onclick = function(e) {{
                                e.stopPropagation();
                                toggleMaximizeCall(container);
                            }};
                            container.appendChild(maxBtn);

                            // Double click on video also toggles fullscreen
                            mainVideo.ondblclick = function(e) {{
                                e.stopPropagation();
                                toggleMaximizeCall(container);
                            }};
                        }}
                    }}

                    function toggleMaximizeCall(container) {{
                        isVideoMaximized = !isVideoMaximized;
                        const maxBtn = container.querySelector('.multiwhats-fullscreen-btn');
                        if (isVideoMaximized) {{
                            savedCallStyle = {{
                                position: container.style.position,
                                inset: container.style.inset,
                                top: container.style.top,
                                left: container.style.left,
                                right: container.style.right,
                                bottom: container.style.bottom,
                                width: container.style.width,
                                height: container.style.height,
                                transform: container.style.transform,
                                borderRadius: container.style.borderRadius,
                                zIndex: container.style.zIndex
                            }};
                            container.style.position = "fixed";
                            container.style.top = "0px";
                            container.style.left = "0px";
                            container.style.right = "0px";
                            container.style.bottom = "0px";
                            container.style.width = "100vw";
                            container.style.height = "100vh";
                            container.style.transform = "none";
                            container.style.borderRadius = "0px";
                            container.style.zIndex = "9999998";
                            if (maxBtn) {{
                                maxBtn.title = "Restore Floating Window";
                                maxBtn.innerHTML = `
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>
                                    </svg>
                                `;
                            }}
                        }} else {{
                            if (savedCallStyle) {{
                                Object.assign(container.style, savedCallStyle);
                            }} else {{
                                container.style.position = "absolute";
                                container.style.width = "640px";
                                container.style.height = "480px";
                                container.style.transform = "none";
                                container.style.borderRadius = "16px";
                            }}
                            if (maxBtn) {{
                                maxBtn.title = "Fullscreen / Maximize Video Call";
                                maxBtn.innerHTML = `
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                                    </svg>
                                `;
                            }}
                        }}
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
                .on_new_window(|_url, _features| {
                    tauri::webview::NewWindowResponse::Allow
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
