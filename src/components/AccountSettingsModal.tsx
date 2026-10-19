import React, { useState, useEffect } from "react";
import {
  X,
  Trash2,
  LogOut,
  Save,
  Key,
  ShieldCheck,
  Calendar,
  Layers,
  AlertTriangle,
} from "lucide-react";
import type { Account, UpdateAccountInput } from "../types";
import { AccountIcon } from "./AccountIcon";
import { getSecureNote, saveSecureNote } from "../services/api";

interface AccountSettingsModalProps {
  isOpen: boolean;
  account: Account | null;
  onClose: () => void;
  onUpdate: (input: UpdateAccountInput) => Promise<void>;
  onLogout: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  theme: "dark" | "light";
}

const PRESET_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#f43f5e",
  "#06b6d4",
  "#6366f1",
  "#ec4899",
];

const PRESET_ICONS = [
  "user",
  "briefcase",
  "shopping-bag",
  "headphones",
  "shield",
  "star",
  "building",
  "phone",
];

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  account,
  onClose,
  onUpdate,
  onLogout,
  onDelete,
  theme,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#10b981");
  const [icon, setIcon] = useState("user");
  const [secureNote, setSecureNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setColor(account.color || "#10b981");
      setIcon(account.icon || "user");
      setConfirmDelete(false);
      setConfirmLogout(false);
      setMessage(null);

      // Load sensitive keychain note if exists
      getSecureNote(account.id)
        .then((note) => setSecureNote(note || ""))
        .catch(() => setSecureNote(""));
    }
  }, [account, isOpen]);

  if (!isOpen || !account) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSaving(true);
      setMessage(null);
      await onUpdate({
        id: account.id,
        name: name.trim(),
        color,
        icon,
      });

      if (secureNote.trim()) {
        await saveSecureNote(account.id, secureNote.trim());
      }

      setMessage({ text: "Account settings saved successfully", type: "success" });
    } catch (err: any) {
      setMessage({
        text: err?.toString() || "Failed to update account",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteLogout = async () => {
    try {
      await onLogout(account.id);
      setConfirmLogout(false);
      onClose();
    } catch (err: any) {
      setMessage({
        text: err?.toString() || "Failed to log out account",
        type: "error",
      });
    }
  };

  const handleExecuteDelete = async () => {
    try {
      await onDelete(account.id);
      setConfirmDelete(false);
      onClose();
    } catch (err: any) {
      setMessage({
        text: err?.toString() || "Failed to delete account",
        type: "error",
      });
    }
  };

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
          <div className="flex items-center space-x-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              <AccountIcon iconName={icon} size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">
                Account Settings: {account.name}
              </h3>
              <p className="text-xs text-gray-400">
                Manage profile details and isolated session
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

        {/* Message Banner */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs border ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-5">
          {/* Account Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Account Label
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-xl border outline-none transition-all ${
                theme === "dark"
                  ? "bg-[#16161a] border-[#2e2e38] text-white focus:border-emerald-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-600"
              }`}
            />
          </div>

          {/* Color & Icon Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Theme Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Avatar Icon
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ICONS.map((i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      icon === i
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                        : theme === "dark"
                        ? "border-[#2e2e38] text-gray-400 hover:bg-[#262630]"
                        : "border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <AccountIcon iconName={i} size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* macOS Keychain Secure Note */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center space-x-1.5 text-xs font-medium text-gray-400">
                <Key size={13} className="text-amber-500" />
                <span>macOS Keychain Secure Note</span>
              </label>
              <span className="text-[10px] text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                Encrypted in Keychain
              </span>
            </div>
            <textarea
              rows={2}
              value={secureNote}
              onChange={(e) => setSecureNote(e.target.value)}
              placeholder="Private credentials or phone number notes (stored directly in macOS Keychain)"
              className={`w-full px-3 py-2 text-xs rounded-xl border outline-none font-mono transition-all ${
                theme === "dark"
                  ? "bg-[#16161a] border-[#2e2e38] text-white focus:border-amber-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:border-amber-600"
              }`}
            />
          </div>

          {/* Isolated Profile Metadata */}
          <div
            className={`p-3 rounded-xl border space-y-2 text-xs ${
              theme === "dark"
                ? "bg-[#141418] border-[#282834] text-gray-300"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center space-x-1">
                <Layers size={13} />
                <span>Profile UUID</span>
              </span>
              <span className="font-mono text-[11px] truncate max-w-[200px]">
                {account.id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center space-x-1">
                <Calendar size={13} />
                <span>Created At</span>
              </span>
              <span className="text-[11px]">
                {new Date(account.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center space-x-1">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>Isolation Type</span>
              </span>
              <span className="text-emerald-500 font-medium text-[11px]">
                WKWebsiteDataStore
              </span>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
            >
              <Save size={14} />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>

        {/* Danger Zone: Log Out & Remove Account */}
        <div className="mt-6 pt-5 border-t border-gray-500/10 space-y-3">
          <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider flex items-center space-x-1.5">
            <AlertTriangle size={13} />
            <span>Session & Account Management</span>
          </div>

          {/* Logout Section */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-500/10">
            <div>
              <div className="text-xs font-medium">Log Out Account Session</div>
              <div className="text-[11px] text-gray-400">
                Wipes cookies and resets WhatsApp Web to QR login
              </div>
            </div>
            {confirmLogout ? (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setConfirmLogout(false)}
                  className="px-2.5 py-1 text-xs text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteLogout}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-500"
                >
                  Confirm Log Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmLogout(true)}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-500 hover:bg-rose-500/10 border border-rose-500/20"
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            )}
          </div>

          {/* Delete Account Section */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-rose-500/20 bg-rose-500/5">
            <div>
              <div className="text-xs font-medium text-rose-500">
                Delete Account from MultiWhats
              </div>
              <div className="text-[11px] text-gray-400">
                Permanently removes this account and cleans up stored metadata
              </div>
            </div>
            {confirmDelete ? (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 text-xs text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-500 shadow-sm"
                >
                  Confirm Delete
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/30 transition-all"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
