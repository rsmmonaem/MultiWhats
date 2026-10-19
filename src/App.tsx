import React, { useEffect, useRef, useState, useCallback } from "react";
import type { Account, CreateAccountInput, UpdateAccountInput } from "./types";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  switchAccount,
  reloadAccount,
  logoutAccount,
  setWebviewsVisible,
  updateActiveWebviewBounds,
  getSetting,
  setSetting,
} from "./services/api";
import { Sidebar } from "./components/Sidebar";
import { Header, type InAppNotification } from "./components/Header";
import { EmptyState } from "./components/EmptyState";
import { AddAccountModal } from "./components/AddAccountModal";
import { AccountSettingsModal } from "./components/AccountSettingsModal";
import { SystemInfoModal } from "./components/SystemInfoModal";
import { checkForAppUpdates, installAndRelaunch } from "./services/updater";
import { listen } from "@tauri-apps/api/event";
import {
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification";
import "./App.css";

export const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUpdate, setPendingUpdate] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeNotification, setActiveNotification] = useState<InAppNotification | null>(null);

  // Check for auto-updates & native notification permission
  useEffect(() => {
    isPermissionGranted().then((granted) => {
      if (!granted) {
        requestPermission().catch(() => {});
      }
    });

    checkForAppUpdates()
      .then((res) => {
        if (res.hasUpdate && res.version) {
          setPendingUpdate(res.version);
        }
      })
      .catch(() => {});

    const unlistenUnread = listen<{ account_id: string; count: number }>(
      "unread_count_updated",
      (event) => {
        setUnreadCounts((prev) => ({
          ...prev,
          [event.payload.account_id]: event.payload.count,
        }));
      }
    );

    const unlistenNotify = listen<{
      account_id: string;
      account_name: string;
      title: string;
      body: string;
    }>("incoming_notification", (event) => {
      setActiveNotification({
        accountId: event.payload.account_id,
        accountName: event.payload.account_name,
        title: event.payload.title,
        body: event.payload.body,
      });
    });

    return () => {
      unlistenUnread.then((fn) => fn());
      unlistenNotify.then((fn) => fn());
    };
  }, []);

  // Auto-dismiss in-app notification pill after 6 seconds
  useEffect(() => {
    if (!activeNotification) return;
    const timer = setTimeout(() => {
      setActiveNotification(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeNotification]);

  const viewportRef = useRef<HTMLDivElement>(null);

  // Synchronize modal open state with native child webview visibility
  const isAnyModalOpen =
    isAddModalOpen || editingAccount !== null || isInfoModalOpen;

  useEffect(() => {
    // When a modal opens, hide the native WKWebView so it doesn't occlude modal dialogs
    setWebviewsVisible(!isAnyModalOpen).catch(console.error);
  }, [isAnyModalOpen]);

  // Measure viewport bounds relative to window
  const getViewportBounds = useCallback(() => {
    if (!viewportRef.current) {
      return { x: 288, y: 48, width: 912, height: 752 };
    }
    const rect = viewportRef.current.getBoundingClientRect();
    return {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.max(200, Math.round(rect.width)),
      height: Math.max(200, Math.round(rect.height)),
    };
  }, []);

  // Switch to selected account
  const handleSelectAccount = useCallback(
    async (id: string) => {
      try {
        setActiveAccountId(id);
        const bounds = getViewportBounds();
        await switchAccount(id, bounds);
        await setSetting("last_active_account", id);
      } catch (err) {
        console.error("Failed to switch account:", err);
      }
    },
    [getViewportBounds]
  );

  // Load accounts and preferences on startup
  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await getAccounts();
      setAccounts(list);

      const savedTheme = await getSetting("theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }

      const savedActive = await getSetting("last_active_account");
      if (list.length > 0) {
        const target =
          list.find((a) => a.id === savedActive)?.id || list[0].id;
        handleSelectAccount(target);
      } else {
        setActiveAccountId(null);
      }
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [handleSelectAccount]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Setup ResizeObserver on viewport to keep child WKWebView bounds synchronized
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    let timeoutId: number | null = null;
    const observer = new ResizeObserver(() => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (activeAccountId && !isAnyModalOpen) {
          const bounds = getViewportBounds();
          updateActiveWebviewBounds(bounds).catch(console.error);
        }
      }, 30);
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [activeAccountId, isAnyModalOpen, getViewportBounds]);

  // Handle Create Account
  const handleCreateAccount = async (input: CreateAccountInput) => {
    const newAcc = await createAccount(input);
    const updated = await getAccounts();
    setAccounts(updated);
    await handleSelectAccount(newAcc.id);
  };

  // Handle Update Account
  const handleUpdateAccount = async (input: UpdateAccountInput) => {
    await updateAccount(input);
    const updated = await getAccounts();
    setAccounts(updated);
    if (editingAccount && editingAccount.id === input.id) {
      setEditingAccount((prev) =>
        prev
          ? {
              ...prev,
              name: input.name,
              color: input.color,
              icon: input.icon,
            }
          : null
      );
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async (id: string) => {
    await deleteAccount(id);
    const updated = await getAccounts();
    setAccounts(updated);
    if (activeAccountId === id) {
      if (updated.length > 0) {
        await handleSelectAccount(updated[0].id);
      } else {
        setActiveAccountId(null);
      }
    }
  };

  // Handle Reload
  const handleReloadAccount = async () => {
    if (!activeAccountId) return;
    try {
      setIsReloading(true);
      await reloadAccount(activeAccountId);
    } catch (err) {
      console.error("Failed to reload account:", err);
    } finally {
      setTimeout(() => setIsReloading(false), 600);
    }
  };

  // Handle Logout
  const handleLogoutAccount = async (id: string) => {
    await logoutAccount(id);
  };

  // Toggle Theme
  const handleToggleTheme = async () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    await setSetting("theme", nextTheme);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts when typing in inputs/textareas
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMacMeta = e.metaKey || e.ctrlKey;

      if (e.key === "Escape") {
        setIsAddModalOpen(false);
        setEditingAccount(null);
        setIsInfoModalOpen(false);
        return;
      }

      if (isMacMeta && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        setIsAddModalOpen(true);
        return;
      }

      if (isMacMeta && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        handleReloadAccount();
        return;
      }

      if (isMacMeta && e.key === ",") {
        e.preventDefault();
        setIsInfoModalOpen(true);
        return;
      }

      // ⌘1 - ⌘9 Account switching
      if (isMacMeta && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key, 10) - 1;
        if (index < accounts.length) {
          handleSelectAccount(accounts[index].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [accounts, handleReloadAccount, handleSelectAccount]);

  const activeAccount =
    accounts.find((a) => a.id === activeAccountId) || null;

  return (
    <div
      className={`w-screen h-screen flex overflow-hidden select-none ${
        theme === "dark" ? "dark bg-[#121216] text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <Sidebar
        accounts={accounts}
        activeAccountId={activeAccountId}
        unreadCounts={unreadCounts}
        onSelectAccount={handleSelectAccount}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettingsModal={(acc) => setEditingAccount(acc)}
        onOpenInfoModal={() => setIsInfoModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 h-full flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <Header
          activeAccount={activeAccount}
          onReload={handleReloadAccount}
          onLogout={() => {
            if (activeAccount) {
              setEditingAccount(activeAccount);
            }
          }}
          onOpenSettings={() => {
            if (activeAccount) {
              setEditingAccount(activeAccount);
            }
          }}
          theme={theme}
          isReloading={isReloading}
          activeNotification={activeNotification}
          onDismissNotification={() => setActiveNotification(null)}
          onNotificationClick={(id) => handleSelectAccount(id)}
        />

        {/* Update Notification Banner */}
        {pendingUpdate && (
          <div
            className={`px-4 py-2 flex items-center justify-between text-xs border-b z-20 ${
              theme === "dark"
                ? "bg-blue-950/60 border-blue-500/30 text-blue-200"
                : "bg-blue-50 border-blue-200 text-blue-900"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>
                A new version of MultiWhats (<strong>v{pendingUpdate}</strong>) is ready to install!
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={async () => {
                  try {
                    setIsUpdating(true);
                    await installAndRelaunch();
                  } catch (e: any) {
                    alert("Update failed: " + e?.message);
                    setIsUpdating(false);
                  }
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-sm transition-all"
              >
                {isUpdating ? "Updating..." : "Update Now"}
              </button>
              <button
                type="button"
                onClick={() => setPendingUpdate(null)}
                className="px-2 py-1 text-gray-400 hover:text-gray-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Viewport for Native Isolated WKWebView or Empty State */}
        <div
          ref={viewportRef}
          id="webview-viewport"
          className="flex-1 w-full h-full relative overflow-hidden"
        >
          {accounts.length === 0 && !isLoading && (
            <EmptyState
              onAddAccount={() => setIsAddModalOpen(true)}
              theme={theme}
            />
          )}

          {accounts.length > 0 && activeAccount && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
              <div className="text-center space-y-2 opacity-40">
                <div className="text-xs font-medium">
                  Isolated WhatsApp Web Container
                </div>
                <div className="text-[11px] font-mono">
                  Profile: {activeAccount.id}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateAccount}
        theme={theme}
      />

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={editingAccount !== null}
        account={editingAccount}
        onClose={() => setEditingAccount(null)}
        onUpdate={handleUpdateAccount}
        onLogout={handleLogoutAccount}
        onDelete={handleDeleteAccount}
        theme={theme}
      />

      {/* About & System Info Modal */}
      <SystemInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        theme={theme}
      />
    </div>
  );
};

export default App;
