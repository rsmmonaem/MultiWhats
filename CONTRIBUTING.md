# Contributing to MultiWhats

Thank you for your interest in contributing to MultiWhats! This document provides guidelines for contributing to this open-source project.

---

## Code of Conduct

Please treat everyone with respect, kindness, and professionalism. We are committed to providing a welcoming and inclusive environment.

---

## Development Setup

### 1. Prerequisites
- macOS 14.0+ (Apple Silicon or Intel)
- [Rust](https://rustup.rs/) (1.88+)
- [Node.js](https://nodejs.org/) (20+) and npm
- Xcode Command Line Tools (`xcode-select --install`)

### 2. Fork and Clone
```bash
git clone https://github.com/rsmmonaem/MultiWhats.git
cd MultiWhats
npm install
```

### 3. Local Development
Start the hot-reloading development environment:
```bash
npm run tauri dev
```

### 4. Running Checks Before Submitting a PR
Make sure all formatting, linting, and tests pass:
```bash
# Frontend type check & build
npm run build

# Rust checks
cd src-tauri
cargo fmt --check
cargo clippy -- -D warnings
cargo test
```

---

## Architectural Principles

1. **Zero Script Injection**: MultiWhats never inspects or scrapes chat content, contact lists, or tokens. Never add scripts that extract messages or credentials.
2. **True Profile Isolation**: Every WhatsApp account MUST operate under an isolated, persistent `WKWebsiteDataStore` UUID (`data_store_identifier`). Never share cookies or storage across accounts.
3. **Native Feel**: Preserve macOS human interface guidelines (smooth titlebar overlays, SF Pro typography, keyboard shortcuts).

---

## Submitting Pull Requests

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Commit with meaningful conventional commit messages: `git commit -m "feat: add support for custom proxy configuration"`
3. Push to your fork: `git push origin feature/your-feature-name`
4. Open a Pull Request against the `main` branch on GitHub.
