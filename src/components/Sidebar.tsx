import React from "react";
import { Plus, Settings, ShieldCheck, Sun, Moon, Info } from "lucide-react";
import type { Account } from "../types";
import { AccountIcon } from "./AccountIcon";
import { Logo } from "./Logo";

interface SidebarProps {
  accounts: Account[];
  activeAccountId: string | null;
  onSelectAccount: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenSettingsModal: (account: Account) => void;
  onOpenInfoModal: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  accounts,
  activeAccountId,
  onSelectAccount,
  onOpenAddModal,
  onOpenSettingsModal,
  onOpenInfoModal,
  theme,
  onToggleTheme,
}) => {
  return (
    <aside
      className={`w-72 h-full flex flex-col border-r select-none transition-colors duration-200 ${
        theme === "dark"
          ? "bg-[#18181c] border-[#2a2a32] text-gray-200"
          : "bg-[#f5f5f7] border-[#e2e2e7] text-gray-800"
      }`}
    >
      {/* Window Drag Titlebar Region with macOS Traffic Light clearance */}
      <div
        data-tauri-drag-region
        className="h-12 w-full flex items-center pl-20 pr-4 pt-1 cursor-default shrink-0"
      >
        <div className="flex items-center space-x-2">
          <Logo size={22} showText={true} textSize="text-xs" />
        </div>
        <span
          className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            theme === "dark"
              ? "bg-[#282832] text-gray-400"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {accounts.length} {accounts.length === 1 ? "Session" : "Sessions"}
        </span>
      </div>

      {/* Account List Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-none">
        <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          WhatsApp Accounts
        </div>

        {accounts.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-gray-400">No accounts connected yet</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Click below to link an account
            </p>
          </div>
        ) : (
          accounts.map((account, index) => {
            const isActive = account.id === activeAccountId;
            const shortcutNum = index < 9 ? index + 1 : null;

            return (
              <div
                key={account.id}
                onClick={() => onSelectAccount(account.id)}
                className={`group relative flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  isActive
                    ? theme === "dark"
                      ? "bg-[#2c2c38] text-white shadow-sm ring-1 ring-white/10"
                      : "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                    : theme === "dark"
                    ? "hover:bg-[#22222a] text-gray-300"
                    : "hover:bg-gray-200/60 text-gray-700"
                }`}
              >
                {/* Colored Avatar */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0 mr-3"
                  style={{ backgroundColor: account.color || "#10b981" }}
                >
                  <AccountIcon iconName={account.icon || "user"} size={16} />
                </div>

                {/* Account Details */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {account.name}
                    </span>
                    {shortcutNum && (
                      <kbd
                        className={`hidden group-hover:inline-block text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          theme === "dark"
                            ? "bg-[#383846] text-gray-400"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        ⌘{shortcutNum}
                      </kbd>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                      }`}
                    />
                    <span className="text-[11px] text-gray-400 truncate">
                      {isActive ? "Active Session" : "Isolated Store"}
                    </span>
                  </div>
                </div>

                {/* Settings Gear (reveals on hover or when active) */}
                <button
                  type="button"
                  title="Account Settings"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSettingsModal(account);
                  }}
                  className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                    theme === "dark"
                      ? "hover:bg-white/10 text-gray-400 hover:text-white"
                      : "hover:bg-black/5 text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Settings size={14} />
                </button>
              </div>
            );
          })
        )}

        {/* Add Account Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className={`w-full mt-3 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl border border-dashed transition-all duration-150 text-xs font-medium ${
            theme === "dark"
              ? "border-[#383846] text-gray-300 hover:bg-[#22222a] hover:border-emerald-500/50 hover:text-emerald-400"
              : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-emerald-600/50 hover:text-emerald-700"
          }`}
        >
          <Plus size={15} />
          <span>Add WhatsApp Account</span>
          <span className="text-[10px] opacity-60 ml-auto font-mono">⌘N</span>
        </button>
      </div>

      {/* Bottom macOS Bar */}
      <div
        className={`p-3 border-t flex items-center justify-between text-xs ${
          theme === "dark"
            ? "border-[#2a2a32] bg-[#141418] text-gray-400"
            : "border-[#e2e2e7] bg-[#ececef] text-gray-600"
        }`}
      >
        <button
          type="button"
          onClick={onOpenInfoModal}
          title="Architecture & Security Info"
          className="flex items-center space-x-1.5 hover:text-emerald-500 transition-colors"
        >
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[11px] font-medium">WebKit Isolated</span>
        </button>

        <div className="flex items-center space-x-1">
          <a
            href="https://wa.me/?text=Hi%20Monaem,%20reaching%20out%20about%20MultiWhats"
            target="_blank"
            rel="noreferrer"
            title="Developer WhatsApp Contact: @rsmmonaemwp"
            className={`p-1.5 rounded-lg transition-colors text-emerald-500 hover:text-emerald-400 ${
              theme === "dark"
                ? "hover:bg-[#262630]"
                : "hover:bg-gray-200"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </a>
          <button
            type="button"
            onClick={onToggleTheme}
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
            className={`p-1.5 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-[#262630] text-gray-400 hover:text-white"
                : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
            }`}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            type="button"
            onClick={onOpenInfoModal}
            title="App Information"
            className={`p-1.5 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-[#262630] text-gray-400 hover:text-white"
                : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
            }`}
          >
            <Info size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};
