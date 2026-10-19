import React, { useEffect, useState } from "react";
import {
  X,
  ShieldCheck,
  Cpu,
  Lock,
  Database,
  Command,
  ExternalLink,
  RefreshCw,
  Sparkles,
  User,
  CheckCircle2,
} from "lucide-react";
import type { SystemInfo } from "../types";
import { getSystemInfo } from "../services/api";
import { checkForAppUpdates, installAndRelaunch } from "../services/updater";
import { Logo } from "./Logo";

interface SystemInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "dark" | "light";
}

export const SystemInfoModal: React.FC<SystemInfoModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [updateState, setUpdateState] = useState<{
    status: "idle" | "checking" | "available" | "downloading" | "latest" | "error";
    version?: string;
    progress?: number;
    errorMsg?: string;
  }>({ status: "idle" });

  useEffect(() => {
    if (isOpen) {
      getSystemInfo()
        .then(setInfo)
        .catch(() => {
          setInfo({
            app_version: "1.0.0",
            tauri_version: "2.12.4",
            macos_version: "macOS Sequoia",
            isolation_engine: "Apple WKWebsiteDataStore",
          });
        });
    }
  }, [isOpen]);

  const handleCheckUpdate = async () => {
    try {
      setUpdateState({ status: "checking" });
      const result = await checkForAppUpdates();
      if (result.hasUpdate && result.version) {
        setUpdateState({
          status: "available",
          version: result.version,
        });
      } else {
        setUpdateState({ status: "latest" });
      }
    } catch (err: any) {
      setUpdateState({
        status: "error",
        errorMsg: err?.message || "Failed to check for updates",
      });
    }
  };

  const handleInstallUpdate = async () => {
    try {
      setUpdateState((prev) => ({ ...prev, status: "downloading", progress: 0 }));
      await installAndRelaunch((downloaded, total) => {
        if (total && total > 0) {
          const percent = Math.round((downloaded / total) * 100);
          setUpdateState((prev) => ({ ...prev, progress: percent }));
        }
      });
    } catch (err: any) {
      setUpdateState({
        status: "error",
        errorMsg: err?.message || "Download failed",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border p-6 overflow-hidden transition-all duration-200 max-h-[90vh] overflow-y-auto ${
          theme === "dark"
            ? "bg-[#1e1e24] border-[#2e2e38] text-gray-100"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-500/10">
          <div className="flex items-center space-x-3">
            <Logo size={36} />
            <div>
              <h3 className="font-semibold text-base leading-tight">
                About MultiWhats
              </h3>
              <p className="text-xs text-gray-400">
                Created by MOHAMMAD MUNAYAM SOWDAGOR (RSM Monaem)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-500/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-xs">
          {/* Author & Open Source Info Card */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              theme === "dark"
                ? "bg-[#16161a] border-[#2e2e38]"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <User size={20} />
              </div>
              <div>
                <div className="font-semibold text-xs flex items-center space-x-1.5">
                  <span>MOHAMMAD MUNAYAM SOWDAGOR</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.2 rounded font-mono font-medium">
                    RSM Monaem
                  </span>
                </div>
                <div className="text-[11px] text-gray-400">
                  Open Source Creator & Lead Desktop Architect
                </div>
              </div>
            </div>

            {/* Social / Developer Contact Links */}
            <div className="flex items-center flex-wrap gap-1.5">
              {/* WhatsApp Developer Contact */}
              <a
                href="https://wa.me/?text=Hi%20Monaem,%20reaching%20out%20about%20MultiWhats"
                target="_blank"
                rel="noreferrer"
                title="Developer Contact: @rsmmonaemwp"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600/15 border border-emerald-500/30 hover:bg-emerald-600/25 text-emerald-400 text-[11px] font-medium transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>@rsmmonaemwp</span>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/Rsmmonaem"
                target="_blank"
                rel="noreferrer"
                title="GitHub Profile"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-gray-500/20 hover:border-gray-400 text-[11px] font-medium transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/rsm-monaem/"
                target="_blank"
                rel="noreferrer"
                title="LinkedIn Profile"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-[11px] font-medium transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Auto-Updater Section */}
          <div
            className={`p-3.5 rounded-xl border space-y-2.5 ${
              theme === "dark"
                ? "bg-[#141418] border-blue-500/20 text-gray-200"
                : "bg-blue-50/40 border-blue-500/20 text-gray-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-blue-500 font-semibold text-xs">
                <Sparkles size={14} />
                <span>Automatic Software Updates</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">
                Current: v{info?.app_version || "1.0.0"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              {updateState.status === "idle" && (
                <span className="text-[11px] text-gray-400">
                  Direct updates from GitHub Releases
                </span>
              )}
              {updateState.status === "checking" && (
                <span className="text-[11px] text-blue-400 flex items-center space-x-1">
                  <RefreshCw size={11} className="animate-spin" />
                  <span>Checking GitHub Releases...</span>
                </span>
              )}
              {updateState.status === "latest" && (
                <span className="text-[11px] text-emerald-500 flex items-center space-x-1">
                  <CheckCircle2 size={12} />
                  <span>You are on the latest version!</span>
                </span>
              )}
              {updateState.status === "available" && (
                <span className="text-[11px] text-emerald-400 font-semibold">
                  New Version v{updateState.version} Available!
                </span>
              )}
              {updateState.status === "downloading" && (
                <span className="text-[11px] text-blue-400">
                  Downloading update {updateState.progress ? `${updateState.progress}%` : "..."}
                </span>
              )}
              {updateState.status === "error" && (
                <span className="text-[11px] text-rose-400">
                  {updateState.errorMsg || "Unable to reach update server"}
                </span>
              )}

              {updateState.status === "available" ? (
                <button
                  type="button"
                  onClick={handleInstallUpdate}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                >
                  Install & Restart
                </button>
              ) : (
                <button
                  type="button"
                  disabled={updateState.status === "checking" || updateState.status === "downloading"}
                  onClick={handleCheckUpdate}
                  className="flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-lg border border-gray-500/20 hover:bg-gray-500/10 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={11} className={updateState.status === "checking" ? "animate-spin" : ""} />
                  <span>Check for Updates</span>
                </button>
              )}
            </div>
          </div>

          {/* Privacy Policy */}
          <div
            className={`p-3 rounded-xl border space-y-1.5 leading-relaxed ${
              theme === "dark"
                ? "bg-[#141418] border-emerald-500/20 text-gray-300"
                : "bg-emerald-50/50 border-emerald-500/20 text-gray-700"
            }`}
          >
            <div className="flex items-center space-x-1.5 text-emerald-500 font-semibold text-xs">
              <Lock size={13} />
              <span>Zero-Interference Privacy Policy</span>
            </div>
            <p className="text-[11px] opacity-90">
              MultiWhats acts exclusively as a native multi-instance desktop
              launcher for the official WhatsApp Web (<code>web.whatsapp.com</code>).
              It strictly never inspects, collects, or logs messages, contacts,
              passwords, OTPs, or authentication QR codes.
            </p>
          </div>

          {/* System Specs */}
          <div
            className={`p-3 rounded-xl border space-y-2 ${
              theme === "dark"
                ? "bg-[#16161a] border-[#2e2e38] text-gray-300"
                : "bg-gray-50 border-gray-200 text-gray-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center space-x-1.5">
                <Cpu size={13} />
                <span>Backend Framework</span>
              </span>
              <span className="font-mono text-[11px]">
                Rust + Tauri {info?.tauri_version || "2.12.4"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center space-x-1.5">
                <Database size={13} />
                <span>Metadata Storage</span>
              </span>
              <span className="font-mono text-[11px]">Local Embedded SQLite</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center space-x-1.5">
                <Lock size={13} />
                <span>Credential Security</span>
              </span>
              <span className="font-mono text-[11px]">Native Keychain / Win Credential Guard</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center space-x-1.5">
                <ShieldCheck size={13} />
                <span>Isolation Engine</span>
              </span>
              <span className="text-emerald-500 font-mono text-[11px] font-semibold">
                Apple WKDataStore (macOS) / Edge WebView2 (Windows)
              </span>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Command size={13} />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  theme === "dark"
                    ? "border-[#2e2e38] bg-[#16161a]"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <span>Switch Account</span>
                <kbd className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-gray-500/20">
                  ⌘1 - ⌘9
                </kbd>
              </div>
              <div
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  theme === "dark"
                    ? "border-[#2e2e38] bg-[#16161a]"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <span>Add Account</span>
                <kbd className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-gray-500/20">
                  ⌘N
                </kbd>
              </div>
              <div
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  theme === "dark"
                    ? "border-[#2e2e38] bg-[#16161a]"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <span>Reload Session</span>
                <kbd className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-gray-500/20">
                  ⌘R
                </kbd>
              </div>
              <div
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  theme === "dark"
                    ? "border-[#2e2e38] bg-[#16161a]"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <span>About & Shortcuts</span>
                <kbd className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-gray-500/20">
                  ⌘,
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-gray-500/10 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 flex items-center space-x-1.5">
            <a
              href="https://github.com/rsmmonaem/MultiWhats"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-500 hover:underline flex items-center space-x-1.5 font-medium"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>rsmmonaem/MultiWhats</span>
              <ExternalLink size={10} />
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-xl bg-gray-500/10 hover:bg-gray-500/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
