import React from "react";
import { Plus, ShieldCheck, Laptop, Lock, Users } from "lucide-react";
import { Logo } from "./Logo";

interface EmptyStateProps {
  onAddAccount: () => void;
  theme: "dark" | "light";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onAddAccount,
  theme,
}) => {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center p-8 select-none text-center">
      <div className="max-w-md space-y-6">
        {/* App Logo */}
        <div className="mx-auto flex justify-center">
          <Logo size={72} />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Multi-Account WhatsApp Desktop
          </h2>
          <p
            className={`text-xs leading-relaxed ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Run multiple independent WhatsApp Web accounts securely on your Mac.
            Each account operates in a dedicated, hardware-isolated browser
            profile.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div
            className={`p-3.5 rounded-2xl border transition-colors ${
              theme === "dark"
                ? "bg-[#18181c] border-[#2a2a32]"
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
              <Users size={15} />
            </div>
            <div className="font-semibold text-xs mb-0.5">Separate Accounts</div>
            <div className="text-[11px] text-gray-400 leading-normal">
              Personal, Sales, Support, and Business side-by-side.
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border transition-colors ${
              theme === "dark"
                ? "bg-[#18181c] border-[#2a2a32]"
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
              <ShieldCheck size={15} />
            </div>
            <div className="font-semibold text-xs mb-0.5">True Isolation</div>
            <div className="text-[11px] text-gray-400 leading-normal">
              WKWebsiteDataStore prevents cookie contamination.
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border transition-colors ${
              theme === "dark"
                ? "bg-[#18181c] border-[#2a2a32]"
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2">
              <Lock size={15} />
            </div>
            <div className="font-semibold text-xs mb-0.5">Official & Private</div>
            <div className="text-[11px] text-gray-400 leading-normal">
              Direct connection to official WhatsApp Web servers.
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl border transition-colors ${
              theme === "dark"
                ? "bg-[#18181c] border-[#2a2a32]"
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
              <Laptop size={15} />
            </div>
            <div className="font-semibold text-xs mb-0.5">Native macOS</div>
            <div className="text-[11px] text-gray-400 leading-normal">
              Lightweight Rust engine with instant keyboard shortcuts.
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div>
          <button
            type="button"
            onClick={onAddAccount}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Add Your First Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
