import { invoke } from "@tauri-apps/api/core";
import type {
  Account,
  CreateAccountInput,
  SystemInfo,
  UpdateAccountInput,
  WebviewBounds,
} from "../types";

export async function getAccounts(): Promise<Account[]> {
  return await invoke<Account[]>("get_accounts");
}

export async function createAccount(
  input: CreateAccountInput
): Promise<Account> {
  return await invoke<Account>("create_account", { input });
}

export async function updateAccount(
  input: UpdateAccountInput
): Promise<Account> {
  return await invoke<Account>("update_account", { input });
}

export async function deleteAccount(id: string): Promise<void> {
  await invoke("delete_account", { id });
}

export async function switchAccount(
  id: string,
  bounds: WebviewBounds
): Promise<void> {
  await invoke("switch_account", { id, bounds });
}

export async function setWebviewsVisible(visible: boolean): Promise<void> {
  await invoke("set_webviews_visible", { visible });
}

export async function updateActiveWebviewBounds(
  bounds: WebviewBounds
): Promise<void> {
  await invoke("update_active_webview_bounds", { bounds });
}

export async function reloadAccount(id: string): Promise<void> {
  await invoke("reload_account", { id });
}

export async function logoutAccount(id: string): Promise<void> {
  await invoke("logout_account", { id });
}

export async function getActiveAccountId(): Promise<string | null> {
  return await invoke<string | null>("get_active_account_id");
}

export async function getSystemInfo(): Promise<SystemInfo> {
  return await invoke<SystemInfo>("get_system_info");
}

export async function saveSecureNote(
  accountId: string,
  note: string
): Promise<void> {
  await invoke("save_secure_note", { accountId, note });
}

export async function getSecureNote(
  accountId: string
): Promise<string | null> {
  return await invoke<string | null>("get_secure_note", { accountId });
}

export async function getSetting(key: string): Promise<string | null> {
  return await invoke<string | null>("get_setting", { key });
}

export async function setSetting(key: string, value: string): Promise<void> {
  await invoke("set_setting", { key, value });
}
