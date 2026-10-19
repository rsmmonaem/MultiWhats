import React from "react";
import { RefreshCw, LogOut, Settings, ShieldCheck, Bell, X } from "lucide-react";
import type { Account } from "../types";
import { AccountIcon } from "./AccountIcon";

export interface InAppNotification {
  accountId: string;
  accountName: string;
  title: string;
  body: string;
}

interface HeaderProps {
  activeAccount: Account | null;
  onReload: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  theme: "dark" | "light";
  isReloading: boolean;
  activeNotification?: InAppNotification | null;
  onDismissNotification?: () => void;
  onNotificationClick?: (accountId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeAccount,
  onReload,
  onLogout,
  onOpenSettings,
  theme,
  isReloading,
  activeNotification,
  onDismissNotification,
  onNotificationClick,
}) => {
  return (
    <header
      data-tauri-drag-region
      className={`h-12 w-full flex items-center justify-between px-4 border-b select-none transition-colors duration-200 shrink-0 ${
        theme === "dark"
          ? "bg-[#18181c] border-[#2a2a32] text-gray-200"
          : "bg-[#f5f5f7] border-[#e2e2e7] text-gray-800"
      }`}
    >
      {/* Left: Active Account Info */}
      <div className="flex items-center space-x-3 pointer-events-none">
        {activeAccount ? (
          <>
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shadow-sm"
              style={{ backgroundColor: activeAccount.color || "#10b981" }}
            >
              <AccountIcon iconName={activeAccount.icon || "user"} size={13} />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-xs tracking-tight">
                {activeAccount.name}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <ShieldCheck size={10} className="mr-1" />
                WKWebsiteDataStore Isolated
              </span>
            </div>
          </>
        ) : (
          <span className="text-xs text-gray-400 font-medium">
            MultiWhats Desktop
          </span>
        )}
      </div>

      {/* Center: Live In-App Notification Pill */}
      {activeNotification && (
        <div
          onClick={() => {
            if (activeNotification.accountId && onNotificationClick) {
              onNotificationClick(activeNotification.accountId);
            }
            if (onDismissNotification) {
              onDismissNotification();
            }
          }}
          className={`flex items-center space-x-2 px-3 py-1 rounded-full cursor-pointer shadow-lg backdrop-blur-md transition-all duration-200 pointer-events-auto max-w-sm sm:max-w-md ${
            theme === "dark"
              ? "bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-900"
              : "bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-100"
          }`}
          title="Click to switch to this account"
        >
          <Bell size={12} className="text-emerald-400 shrink-0 animate-bounce" />
          <span className="text-[11px] font-semibold shrink-0">
            {activeNotification.accountName}:
          </span>
          <span className="text-[11px] truncate font-medium">
            {activeNotification.title} — {activeNotification.body}
          </span>
          {activeNotification.accountId &&
            activeAccount &&
            activeNotification.accountId !== activeAccount.id && (
              <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded shadow-sm shrink-0">
                Switch
              </span>
            )}
          {onDismissNotification && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismissNotification();
              }}
              className="p-0.5 hover:text-white rounded shrink-0 opacity-70 hover:opacity-100"
            >
              <X size={11} />
            </button>
          )}
        </div>
      )}

      {/* Right: Actions */}
      {activeAccount && (
        <div className="flex items-center space-x-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={onReload}
            disabled={isReloading}
            title="Reload WhatsApp Web (⌘R)"
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              theme === "dark"
                ? "hover:bg-[#2c2c38] text-gray-300 hover:text-white"
                : "hover:bg-gray-200 text-gray-700 hover:text-gray-900"
            }`}
          >
            <RefreshCw
              size={13}
              className={isReloading ? "animate-spin text-emerald-500" : ""}
            />
            <span className="hidden sm:inline">Reload</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title="Account Settings"
            className={`p-1.5 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-[#2c2c38] text-gray-300 hover:text-white"
                : "hover:bg-gray-200 text-gray-700 hover:text-gray-900"
            }`}
          >
            <Settings size={14} />
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Log Out This Account"
            className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-rose-500 hover:bg-rose-500/10`}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      )}
    </header>
  );
};
