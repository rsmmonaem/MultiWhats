use crate::models::{AccountRecord, CreateAccountInput, UpdateAccountInput};
use chrono::Utc;
use rusqlite::{Connection, params};
use std::path::Path;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Clone)]
pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self, String> {
        let conn =
            Connection::open(path).map_err(|e| format!("Failed to open SQLite db: {}", e))?;
        let db = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        db.init_tables()?;
        Ok(db)
    }

    pub fn in_memory() -> Result<Self, String> {
        let conn = Connection::open_in_memory()
            .map_err(|e| format!("Failed to open in-memory SQLite db: {}", e))?;
        let db = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        db.init_tables()?;
        Ok(db)
    }

    fn init_tables(&self) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS accounts (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                color TEXT NOT NULL,
                icon TEXT NOT NULL,
                data_store_bytes BLOB NOT NULL,
                order_index INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                last_active_at TEXT,
                notes TEXT
            );",
            [],
        )
        .map_err(|e| format!("Failed to create accounts table: {}", e))?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY NOT NULL,
                value TEXT NOT NULL
            );",
            [],
        )
        .map_err(|e| format!("Failed to create settings table: {}", e))?;

        Ok(())
    }

    pub fn get_accounts(&self) -> Result<Vec<AccountRecord>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare(
                "SELECT id, name, color, icon, order_index, created_at, last_active_at, notes 
                 FROM accounts ORDER BY order_index ASC, created_at ASC",
            )
            .map_err(|e| format!("Query prepare error: {}", e))?;

        let account_iter = stmt
            .query_map([], |row| {
                Ok(AccountRecord {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    icon: row.get(3)?,
                    order_index: row.get(4)?,
                    created_at: row.get(5)?,
                    last_active_at: row.get(6)?,
                    notes: row.get(7)?,
                })
            })
            .map_err(|e| format!("Query map error: {}", e))?;

        let mut results = Vec::new();
        for acc in account_iter {
            results.push(acc.map_err(|e| format!("Row parse error: {}", e))?);
        }
        Ok(results)
    }

    pub fn get_account_data_store(&self, id: &str) -> Result<[u8; 16], String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT data_store_bytes FROM accounts WHERE id = ?1")
            .map_err(|e| e.to_string())?;

        let bytes: Vec<u8> = stmt
            .query_row(params![id], |row| row.get(0))
            .map_err(|e| format!("Account data store lookup failed: {}", e))?;

        if bytes.len() != 16 {
            return Err("Invalid data store byte length in database".to_string());
        }

        let mut arr = [0u8; 16];
        arr.copy_from_slice(&bytes);
        Ok(arr)
    }

    pub fn create_account(&self, input: CreateAccountInput) -> Result<AccountRecord, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        let new_id = Uuid::new_v4();
        let id_str = new_id.to_string();
        let data_store_bytes = new_id.into_bytes().to_vec();
        let now_str = Utc::now().to_rfc3339();

        let count: i32 = conn
            .query_row("SELECT COUNT(*) FROM accounts", [], |row| row.get(0))
            .unwrap_or(0);

        conn.execute(
            "INSERT INTO accounts (id, name, color, icon, data_store_bytes, order_index, created_at, last_active_at, notes)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                id_str,
                input.name.trim(),
                input.color.trim(),
                input.icon.trim(),
                data_store_bytes,
                count,
                now_str,
                None::<String>,
                None::<String>
            ],
        )
        .map_err(|e| format!("Failed to insert account: {}", e))?;

        Ok(AccountRecord {
            id: id_str,
            name: input.name.trim().to_string(),
            color: input.color.trim().to_string(),
            icon: input.icon.trim().to_string(),
            order_index: count,
            created_at: now_str,
            last_active_at: None,
            notes: None,
        })
    }

    pub fn update_account(&self, input: UpdateAccountInput) -> Result<AccountRecord, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        conn.execute(
            "UPDATE accounts SET name = ?1, color = ?2, icon = ?3 WHERE id = ?4",
            params![
                input.name.trim(),
                input.color.trim(),
                input.icon.trim(),
                input.id.trim()
            ],
        )
        .map_err(|e| format!("Failed to update account: {}", e))?;

        let mut stmt = conn
            .prepare("SELECT id, name, color, icon, order_index, created_at, last_active_at, notes FROM accounts WHERE id = ?1")
            .map_err(|e| e.to_string())?;

        let rec = stmt
            .query_row(params![input.id.trim()], |row| {
                Ok(AccountRecord {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    icon: row.get(3)?,
                    order_index: row.get(4)?,
                    created_at: row.get(5)?,
                    last_active_at: row.get(6)?,
                    notes: row.get(7)?,
                })
            })
            .map_err(|e| format!("Failed to reload updated account: {}", e))?;

        Ok(rec)
    }

    pub fn update_last_active(&self, id: &str) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let now = Utc::now().to_rfc3339();
        conn.execute(
            "UPDATE accounts SET last_active_at = ?1 WHERE id = ?2",
            params![now, id],
        )
        .map_err(|e| format!("Failed to update last_active: {}", e))?;
        Ok(())
    }

    pub fn delete_account(&self, id: &str) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM accounts WHERE id = ?1", params![id])
            .map_err(|e| format!("Failed to delete account: {}", e))?;
        Ok(())
    }

    pub fn get_setting(&self, key: &str) -> Result<Option<String>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT value FROM app_settings WHERE key = ?1")
            .map_err(|e| e.to_string())?;

        let res = stmt.query_row(params![key], |row| row.get(0));
        match res {
            Ok(val) => Ok(Some(val)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(format!("Settings read error: {}", e)),
        }
    }

    pub fn set_setting(&self, key: &str, value: &str) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT INTO app_settings (key, value) VALUES (?1, ?2) 
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            params![key, value],
        )
        .map_err(|e| format!("Settings write error: {}", e))?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_database_crud_lifecycle() {
        let db = Database::in_memory().expect("in-memory db initialization failed");

        // 1. Initial state has 0 accounts
        let initial = db.get_accounts().unwrap();
        assert_eq!(initial.len(), 0);

        // 2. Create accounts
        let acc1 = db
            .create_account(CreateAccountInput {
                name: "Personal".to_string(),
                color: "#10b981".to_string(),
                icon: "user".to_string(),
            })
            .unwrap();

        let acc2 = db
            .create_account(CreateAccountInput {
                name: "Business".to_string(),
                color: "#3b82f6".to_string(),
                icon: "briefcase".to_string(),
            })
            .unwrap();

        // 3. Verify accounts and data store bytes
        let accounts = db.get_accounts().unwrap();
        assert_eq!(accounts.len(), 2);
        assert_eq!(accounts[0].name, "Personal");
        assert_eq!(accounts[1].name, "Business");

        let store_bytes1 = db.get_account_data_store(&acc1.id).unwrap();
        let store_bytes2 = db.get_account_data_store(&acc2.id).unwrap();
        assert_ne!(store_bytes1, store_bytes2);
        assert_eq!(store_bytes1.len(), 16);

        // 4. Update account
        let updated = db
            .update_account(UpdateAccountInput {
                id: acc1.id.clone(),
                name: "Personal VIP".to_string(),
                color: "#f59e0b".to_string(),
                icon: "star".to_string(),
            })
            .unwrap();
        assert_eq!(updated.name, "Personal VIP");
        assert_eq!(updated.color, "#f59e0b");

        // 5. Update last active
        assert!(db.update_last_active(&acc1.id).is_ok());

        // 6. Delete account
        assert!(db.delete_account(&acc2.id).is_ok());
        let accounts_after_delete = db.get_accounts().unwrap();
        assert_eq!(accounts_after_delete.len(), 1);
        assert_eq!(accounts_after_delete[0].id, acc1.id);

        // 7. Test Settings KV
        assert!(db.set_setting("theme", "dark").is_ok());
        let theme_setting = db.get_setting("theme").unwrap();
        assert_eq!(theme_setting, Some("dark".to_string()));
    }
}
