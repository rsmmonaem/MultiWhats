export interface Account {
  id: string;
  name: string;
  color: string;
  icon: string;
  order_index: number;
  created_at: string;
  last_active_at?: string | null;
  notes?: string | null;
}

export interface CreateAccountInput {
  name: string;
  color: string;
  icon: string;
}

export interface UpdateAccountInput {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface SystemInfo {
  app_version: string;
  tauri_version: string;
  macos_version: string;
  isolation_engine: string;
}

export interface WebviewBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
