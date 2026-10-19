import { check, Update } from "@tauri-apps/plugin-updater";
import { invoke } from "@tauri-apps/api/core";

let activeUpdate: Update | null = null;

export interface UpdateCheckResult {
  hasUpdate: boolean;
  version?: string;
  notes?: string;
  date?: string;
  error?: string;
}

/**
 * Check if a new version of MultiWhats is available via GitHub Releases
 */
export async function checkForAppUpdates(): Promise<UpdateCheckResult> {
  try {
    const update = await check();
    if (update && update.available) {
      activeUpdate = update;
      return {
        hasUpdate: true,
        version: update.version,
        notes: update.body,
        date: update.date,
      };
    }
    activeUpdate = null;
    return { hasUpdate: false };
  } catch (err: any) {
    console.warn("Update check skipped/failed:", err);
    return {
      hasUpdate: false,
      error: err?.message || String(err),
    };
  }
}

/**
 * Download and install the active update, then restart MultiWhats
 */
export async function installAndRelaunch(
  onProgress?: (downloaded: number, total?: number) => void
): Promise<void> {
  if (!activeUpdate) {
    throw new Error("No update ready to install");
  }

  let downloadedBytes = 0;
  let totalBytes: number | undefined;

  await activeUpdate.downloadAndInstall((event) => {
    switch (event.event) {
      case "Started":
        totalBytes = event.data.contentLength;
        break;
      case "Progress":
        downloadedBytes += event.data.chunkLength;
        if (onProgress) {
          onProgress(downloadedBytes, totalBytes);
        }
        break;
      case "Finished":
        break;
    }
  });

  // Native app restart
  try {
    await invoke("restart_app");
  } catch {
    window.location.reload();
  }
}
