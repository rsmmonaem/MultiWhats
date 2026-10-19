import React, { useState } from "react";
import { X, ShieldCheck, Check } from "lucide-react";
import type { CreateAccountInput } from "../types";
import { AccountIcon } from "./AccountIcon";

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateAccountInput) => Promise<void>;
  theme: "dark" | "light";
}

const PRESET_NAMES = [
  "Personal",
  "Business",
  "Sales",
  "Support",
  "Work",
  "Marketing",
  "VIP",
];

const PRESET_COLORS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#f43f5e", // Rose
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
  "#ec4899", // Pink
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

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  theme,
}) => {
  const [name, setName] = useState("Personal");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(PRESET_ICONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter an account name");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        name: name.trim(),
        color,
        icon,
      });
      onClose();
    } catch (err: any) {
      setError(err?.toString() || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border p-6 overflow-hidden transition-all duration-200 ${
          theme === "dark"
            ? "bg-[#1e1e24] border-[#2e2e38] text-gray-100"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Modal Header */}
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
                Add WhatsApp Account
              </h3>
              <p className="text-xs text-gray-400">
                Create an isolated desktop workspace
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

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
              placeholder="e.g. Personal, Sales, Business"
              className={`w-full px-3 py-2 text-sm rounded-xl border outline-none transition-all duration-150 ${
                theme === "dark"
                  ? "bg-[#16161a] border-[#2e2e38] text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/50"
              }`}
            />

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_NAMES.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setName(preset)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                    name === preset
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-medium"
                      : theme === "dark"
                      ? "border-[#2e2e38] text-gray-400 hover:bg-[#262630]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Theme Accent
            </label>
            <div className="flex items-center space-x-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Avatar Icon
            </label>
            <div className="flex items-center space-x-2 overflow-x-auto py-1">
              {PRESET_ICONS.map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                    icon === i
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40"
                      : theme === "dark"
                      ? "border-[#2e2e38] text-gray-400 hover:bg-[#262630]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <AccountIcon iconName={i} size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Sandbox Guarantee Callout */}
          <div
            className={`p-3 rounded-xl border text-xs space-y-1 ${
              theme === "dark"
                ? "bg-[#141418] border-emerald-500/20 text-gray-300"
                : "bg-emerald-50/50 border-emerald-500/20 text-gray-700"
            }`}
          >
            <div className="flex items-center space-x-1.5 text-emerald-500 font-medium">
              <ShieldCheck size={14} />
              <span>Full Browser Session Isolation</span>
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed">
              MultiWhats assigns a dedicated Apple WKWebsiteDataStore profile
              to this account. Cookies, localStorage, and chats are physically
              quarantined and persist across restarts.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors ${
                theme === "dark"
                  ? "hover:bg-[#2a2a34] text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all duration-150 disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <span>Creating Session...</span>
              ) : (
                <span>Add Account</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
