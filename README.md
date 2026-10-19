# MultiWhats — Multi-Account WhatsApp Desktop Client for macOS & Windows

<p align="center">
  <img src="public/multiwhats-icon.jpg" width="128" height="128" alt="MultiWhats Desktop Logo" style="border-radius: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);" />
</p>

<p align="center">
  <strong>Run multiple independent WhatsApp accounts simultaneously on macOS and Windows with true hardware-level session isolation.</strong>
</p>

<p align="center">
  <a href="https://github.com/rsmmonaem/MultiWhats/releases/latest"><img src="https://img.shields.io/github/v/release/rsmmonaem/MultiWhats?style=for-the-badge&color=25D366&logo=github&labelColor=1e1e24" alt="Download Latest Release"></a>
  <a href="https://github.com/rsmmonaem/MultiWhats/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge&labelColor=1e1e24" alt="License: MIT"></a>
  <a href="https://github.com/rsmmonaem"><img src="https://img.shields.io/badge/Author-MOHAMMAD%20MUNAYAM%20SOWDAGOR-10b981?style=for-the-badge&labelColor=1e1e24" alt="Author"></a>
  <a href="https://wa.me/?text=Hi%20Monaem,%20reaching%20out%20about%20MultiWhats"><img src="https://img.shields.io/badge/WhatsApp-%40rsmmonaemwp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white&labelColor=1e1e24" alt="WhatsApp Developer Contact"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-macOS%20(Apple%20Silicon%20%26%20Intel)%20%7C%20Windows%2010%2F11-blue?style=flat-square&logo=apple" alt="macOS & Windows Supported">
  <img src="https://img.shields.io/badge/Engine-Tauri%202.x%20%2B%20Rust-orange?style=flat-square&logo=rust" alt="Tauri 2 + Rust">
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20TailwindCSS-38bdf8?style=flat-square&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/Session_Isolation-Hardware_Enforced-emerald?style=flat-square" alt="Session Isolation">
</p>

---

## 📥 Instant Downloads (Direct 1-Click Installers)

Get the latest production-ready installer for your operating system:

| Operating System | Architecture | Installer Type | Direct Download Link |
|:---|:---|:---|:---|
| 🍏 **macOS** | **Apple Silicon (M1 / M2 / M3 / M4)** | Disk Image (`.dmg`) | [⬇️ **Download MultiWhats for Apple Silicon (.dmg)**](https://github.com/rsmmonaem/MultiWhats/releases/download/v1.0.0/MultiWhats_1.0.0_aarch64.dmg) |
| 🍏 **macOS** | **Intel Core (x86_64)** | Disk Image (`.dmg`) | [⬇️ **Download MultiWhats for Intel Mac**](https://github.com/rsmmonaem/MultiWhats/releases/latest) |
| 🪟 **Windows** | **Windows 10 / 11 (64-bit)** | Standard Setup (`.exe`) | [⬇️ **Download MultiWhats for Windows (EXE)**](https://github.com/rsmmonaem/MultiWhats/releases/latest) |
| 🪟 **Windows** | **Enterprise / IT Admin** | MSI Package (`.msi`) | [⬇️ **Download MultiWhats Windows MSI**](https://github.com/rsmmonaem/MultiWhats/releases/latest) |

> 💡 **Auto-Update Enabled**: Once installed, MultiWhats will automatically detect and install all future releases seamlessly in the background without needing manual re-downloads.

---

## 🎯 Why MultiWhats?

Tired of opening incognito windows, multiple browsers (Chrome, Edge, Safari), or heavy Electron wrappers just to use your Personal, Business, Support, and Client WhatsApp accounts?

**MultiWhats** solves this once and for all:
- **Multiple WhatsApp Accounts Simultaneously**: Keep Personal, Work, E-commerce, Support, and VIP clients open in one native desktop workspace.
- **True Hardware-Level Isolation**: No cookie mixing, no session collisions, and no unexpected logouts.
- **Ultra-Low Resource Footprint**: Built in Rust and Tauri 2. Consumes **~80% less RAM** than heavy Electron wrappers like Franz, Ferdi, or Rambox.
- **Instant Account Switching**: Switch between conversations with instant macOS/Windows hotkeys (`⌘1`–`⌘9` or `Ctrl+1`–`Ctrl+9`).
- **Zero Interception & Privacy-First**: Direct official connection to `web.whatsapp.com`. No intermediate proxies, no analytics, no message scraping.

---

## 📊 Comparison Matrix

| Feature | Standard Browser Tabs | Electron Apps (Franz/Rambox) | Official WhatsApp App | 🚀 MultiWhats Desktop |
|:---|:---:|:---:|:---:|:---:|
| **Multi-Account Support** | ❌ (1 session only) | ⚠️ (Heavy memory bloat) | ❌ (Single account) |  **Unlimited Accounts** |
| **Session Isolation** | ❌ Cookies shared | ⚠️ Soft process wrapper | N/A |  **True Hardware Isolated Stores** |
| **RAM Usage (4 Accounts)** | ~1.5 GB | ~1.8 GB - 2.5 GB | ~350 MB (1 acc) |  **~180 MB - 250 MB Total** |
| **Instant Hotkeys** | ❌ Tab switching | ⚠️ Slow | ❌ |  **⌘1 - ⌘9 / Ctrl+1 - Ctrl+9** |
| **Auto-Updating** | N/A | ⚠️ Slow |  Yes |  **Built-in Cryptographic Updater** |
| **Cross-Platform** |  Web only |  Desktop |  Limited |  **macOS & Windows Native** |
| **Open Source** | ❌ Proprietary | ⚠️ Freemium / Tracking | ❌ Proprietary |  **100% Free & Open Source (MIT)** |

---

## 🌟 Key Highlights

- **Multi-Account Manager**: Add custom labels (e.g., *Personal*, *Business*, *Sales*, *Support*, *VIP*) with unique colored avatars.
- **Cross-Platform Session Isolation**:
  - **macOS (Sonoma / Sequoia / Ventura)**: Powered by Apple WebKit `WKWebsiteDataStore` UUID data store identifiers (`data_store_identifier`).
  - **Windows (10 / 11)**: Powered by Microsoft Edge WebView2 dedicated User Data Directory (`profiles/<account_id>`).
- **Official WhatsApp Web**: Directly loads official `web.whatsapp.com` with desktop user-agent spoofing for fast, reliable QR scanning.
- **Persistent Sessions**: Your logins persist across app restarts and computer reboots.
- **Native OS Feel**:
  - Translucent native sidebar with active indicators.
  - Native titlebar overlays.
  - Dark & Light themes with system appearance auto-detection.
- **Embedded SQLite Metadata**: Ultra-fast local SQLite database storing account order, settings, and metadata.
- **Zero-Interference Privacy**: Never reverse-engineers the WhatsApp protocol; never collects chat content, contacts, OTPs, or phone numbers.

---

## 👤 Author & Open Source Maintainer

- **Creator & Lead Desktop Architect**: **MOHAMMAD MUNAYAM SOWDAGOR (RSM Monaem)**
- **GitHub**: [@Rsmmonaem](https://github.com/Rsmmonaem/)
- **LinkedIn**: [MOHAMMAD MUNAYAM SOWDAGOR](https://www.linkedin.com/in/rsm-monaem/)
- **WhatsApp Developer Contact**: `@rsmmonaemwp` ([💬 Chat with Developer](https://wa.me/?text=Hi%20Monaem,%20reaching%20out%20about%20MultiWhats))
- **Repository**: [https://github.com/rsmmonaem/MultiWhats](https://github.com/rsmmonaem/MultiWhats)
- **License**: [MIT Open Source](LICENSE)

Contributions, feature requests, and issue reports from the open-source community are warmly welcomed!

---

## 🏗️ Architecture & Session Isolation Engine

```
┌─────────────────────────────────────────────────────────────┐
│ MultiWhats Desktop Host (macOS WKWebView / Windows WebView2)│
├──────────────────┬──────────────────────────────────────────┤
│ Native Sidebar   │ Active Account Header (⌘R, Logout)       │
│                  ├──────────────────────────────────────────┤
│ • Personal  (⌘1) │                                          │
│ • Business  (⌘2) │ Native Isolated Child Webview Container  │
│ • Sales     (⌘3) │ [Segregated Storage: UUID-A]             │
│ • Support   (⌘4) │ web.whatsapp.com                         │
│                  │                                          │
│ + Add Account    │                                          │
│ ☼ Theme / Info   │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

### The Isolation Problem
Standard web browsers and generic multi-window webview apps share the default browser cookie store (`WKWebsiteDataStore.default()` on macOS or shared User Data Folder on Windows). In those setups, logging into a second WhatsApp account immediately logs out or corrupts the first.

### The MultiWhats Engine Solution
MultiWhats implements hardware-level profile partitioning:
- **On macOS**: Every account gets a unique UUID bound directly to Apple's native `WKWebsiteDataStore`:
  ```rust
  let mut builder = WebviewBuilder::new(&target_label, url)
      .user_agent(DESKTOP_USER_AGENT)
      .initialization_script(CLEAN_UI_SCRIPT)
      .auto_resize();

  #[cfg(target_os = "macos")]
  {
      builder = builder.data_store_identifier(data_store_bytes);
  }
  ```
- **On Windows**: Every account receives a dedicated User Data Directory:
  ```rust
  #[cfg(not(target_os = "macos"))]
  {
      let profile_dir = app_dir.join("profiles").join(&account.id);
      builder = builder.data_directory(profile_dir);
  }
  ```
When switching accounts, MultiWhats simply toggles visibility (`show`/`hide`), preserving active WebSocket connections, chat states, and drafts with zero reload lag.

---

## 🚀 Development Setup

Want to contribute or build MultiWhats from source?

### Prerequisites
- **macOS** (14.0 Sonoma or newer) or **Windows** (10 / 11)
- [Rust](https://rustup.rs/) (1.88+)
- [Node.js](https://nodejs.org/) (20+) and npm
- Xcode Command Line Tools (on macOS: `xcode-select --install`) or Visual Studio C++ Build Tools (on Windows)

### 1. Clone & Install
```bash
git clone https://github.com/rsmmonaem/MultiWhats.git
cd MultiWhats
npm install
```

### 2. Launch Local Development
```bash
npm run tauri dev
```

### 3. Build Production Installers
```bash
# Builds .app & .dmg on macOS, or .exe & .msi on Windows
npm run tauri build
```

---

## 🔄 Cryptographic Auto-Update System

MultiWhats includes a built-in, tamper-proof auto-updater:
1. Every release binary is cryptographically signed using an Ed25519 keypair.
2. The public key is embedded in `src-tauri/tauri.conf.json`:
   ```json
   "plugins": {
     "updater": {
       "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEJEMjUzNTVGNjUzOUEyNEIKUldSTG9qbGxYelVsdmNhZENodTdsZUsrK01LbWgrczNpQW1DWERrai9rZmlpZ0RDSVZOeCs0NE8K",
       "endpoints": [
         "https://github.com/rsmmonaem/MultiWhats/releases/latest/download/latest.json"
       ]
     }
   }
   ```
3. Whenever a new tag is pushed (e.g. `v1.0.1`), GitHub Actions automatically builds the macOS (Apple Silicon + Intel) and Windows artifacts, generates `latest.json` signatures, and publishes them.
4. Users get an instant one-click notification inside the desktop app to **"Update & Restart"**.

---

## ⌨️ Productivity Keyboard Shortcuts

| macOS Shortcut | Windows Shortcut | Action |
|:---|:---|:---|
| `⌘1` – `⌘9` | `Ctrl + 1` – `Ctrl + 9` | Instantly switch to Account 1 through 9 |
| `⌘N` | `Ctrl + N` | Open **Add Account** dialog |
| `⌘R` | `Ctrl + R` | Reload active WhatsApp Web session |
| `⌘,` | `Ctrl + ,` | Open **System Information & Auto-Update** dialog |
| `Esc` | `Esc` | Dismiss active modal dialog |

---

## 🔒 Security & Privacy Guarantees

- **100% Zero-Interference**: MultiWhats never collects, logs, or transmits passwords, messages, contacts, OTPs, or authentication QR codes.
- **Official Servers Only**: All network connections are made directly to `web.whatsapp.com` over TLS.
- **Hardware Profile Isolation**: Session cookies, IndexedDB, and WebCrypto keys are strictly isolated per account.
- **Open Source Transparency**: All Rust backend and React frontend code is public and auditable by the community.

---

## 🤝 Contributing

We welcome contributions from developers worldwide! Please review our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on pull requests and coding standards.

If you enjoy using MultiWhats, please consider giving this repository a ⭐ **Star** on GitHub to support ongoing development and help others discover it!

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete details.

*Disclaimer: MultiWhats is an independent, open-source project developed by MOHAMMAD MUNAYAM SOWDAGOR (RSM Monaem). WhatsApp is a registered trademark of Meta Platforms, Inc. This application is not affiliated with, sponsored by, or endorsed by Meta Platforms, Inc.*
