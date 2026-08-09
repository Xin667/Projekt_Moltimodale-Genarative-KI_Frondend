"""
Einfache SQLite-Datenbank-Anbindung für unser Projekt.
 
 
VIER getrennten Tabellen:
 
1. "projects"   -> Für jedes Projekt nur eine ID und ein Erstellungsdatum.
 
2. "messages"   -> Die komplette CHAT-Historie zu einem Projekt (Text-Ebene).
                   Wird gebraucht, damit das Modell bei /analyze-Aufrufen den
                   bisherigen Gesprächsverlauf kennt.
 
3. "artifacts"  -> Die strukturierten ERGEBNISSE der einzelnen Verarbeitungs-
                   Schritte (z.B. die Konzept-Struktur aus diesem Endpoint,
                   später die Hardware-Auswahl aus einem anderen Endpoint,
                   später generierter Code aus einem dritten Endpoint).
 
4. "images"     -> Hochgeladene Bilder, als Binärdaten (BLOB) gespeichert -
                   dauerhaft, nicht nur für den einen Moment des Uploads.
"""
 
import sqlite3
import uuid
import json
from datetime import datetime, timezone
 
# Der Dateiname der SQLite-Datenbank. Wird beim ersten Start automatisch
# als leere Datei angelegt, falls sie noch nicht existiert.
DB_PATH = "db/draft2device.db"
 
 
def _get_connection() -> sqlite3.Connection:
    # Öffnet eine Verbindung zur SQLite-Datenbank-Datei.
    # Wir öffnen bei JEDER Funktion unten eine neue, kurze Verbindung und
    # schließen sie danach wieder - das ist bei SQLite der übliche
    connection = sqlite3.connect(DB_PATH)
    # Das sorgt dafür, dass wir Zeilen wie Dictionaries ansprechen können
    # (z.B. row["role"] statt nur row[1]) - einfacher zu lesen.
    connection.row_factory = sqlite3.Row
    return connection
 
 
def init_db() -> None:
    # Legt alle vier Tabellen an, FALLS sie noch nicht existieren.
    # Wird einmal beim Start des FastAPI-Servers aufgerufen (siehe main.py).
    connection = _get_connection()
    cursor = connection.cursor()
 
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
 
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    """)
 
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS artifacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            artifact_type TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    """)
 
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id TEXT NOT NULL,
            message_id INTEGER NOT NULL,
            mime_type TEXT NOT NULL,
            data BLOB NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (message_id) REFERENCES messages(id)
        )
    """)
 
    connection.commit()
    connection.close()
 
 
# =====================================================================
# PROJECTS
# =====================================================================
 
def create_project(name: str) -> str:
    # Legt ein neues, leeres Projekt an und gibt dessen neue (zufällige) ID zurück.
    project_id = str(uuid.uuid4())  # z.B. "a1b2c3d4-...-...-..."
    name = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
 
    connection = _get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO projects (id, name, created_at) VALUES (?, ?, ?)",
        (project_id, name, now),
    )
    connection.commit()
    connection.close()
 
    return project_id
 
 
def project_exists(project_id: str) -> bool:
    # Prüft, ob eine project_id überhaupt existiert.
    connection = _get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    connection.close()
    return row is not None
 
 
# =====================================================================
# MESSAGES (Chat-Historie)
# =====================================================================
 
def add_message(project_id: str, role: str, content: str) -> int:
    # Speichert eine einzelne Nachricht in der Chat-Historie eines Projekts
    # und gibt deren neue message_id zurück
    # role:    "user"      -> was der Nutzer geschrieben hat
    #          "assistant" -> die Antwort des Modells (als JSON-Text)
    # content: der eigentliche Text der Nachricht
    now = datetime.now(timezone.utc).isoformat()
 
    connection = _get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO messages (project_id, role, content, created_at) VALUES (?, ?, ?, ?)",
        (project_id, role, content, now),
    )
    connection.commit()
    new_message_id = cursor.lastrowid
    connection.close()
 
    return new_message_id
 
 
def get_messages(project_id: str) -> list[dict]:
    # Holt die KOMPLETTE Chat-Historie eines Projekts, älteste zuerst.
    #
    # Rückgabe: [{"id": 1, "role": "user", "content": "..."}, ...]
    # Das "id"-Feld brauchen wir, um später (in main.py) nachzuschauen, ob
    # zu einer bestimmten Nachricht ein Bild gehört (siehe get_images unten).
    connection = _get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "SELECT id, role, content FROM messages WHERE project_id = ? ORDER BY id ASC",
        (project_id,),
    )
    rows = cursor.fetchall()
    connection.close()
 
    return [
        {"id": row["id"], "role": row["role"], "content": row["content"]}
        for row in rows
    ]
 
 
# =====================================================================
# ARTIFACTS (strukturierte Zwischenergebnisse, z.B. die Konzept-Struktur)
# =====================================================================
 
def save_artifact(project_id: str, artifact_type: str, content: dict) -> None:
    # Speichert ein strukturiertes Ergebnis (z.B. die Konzept-Struktur) unter
    # einem bestimmten Typ ab. Wir überschreiben NICHT das alte Artefakt,
    # sondern legen einen neuen Eintrag an - so bleibt bei Bedarf die ganze
    # Versions-Historie erhalten (z.B. für ein späteres "Undo"-Feature).
    #
    # artifact_type: z.B. "concept_structure", "hardware_selection", "code"
    # content: das Ergebnis als Python-Dictionary (wird hier zu JSON-Text)
    now = datetime.now(timezone.utc).isoformat()
    content_as_text = json.dumps(content, ensure_ascii=False)
 
    connection = _get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO artifacts (project_id, artifact_type, content, created_at) VALUES (?, ?, ?, ?)",
        (project_id, artifact_type, content_as_text, now),
    )
    connection.commit()
    connection.close()
 
 
def get_latest_artifact(project_id: str, artifact_type: str) -> dict | None:
    # Holt das ZULETZT gespeicherte Artefakt eines bestimmten Typs zu einem
    # Projekt, bereits als Python-Dictionary. Gibt None zurück, falls noch
    # keins existiert.
    #
    # Das ist die Funktion, die z.B. der SPÄTERE Hardware-Endpoint aufrufen
    # würde, um sich "die aktuellste Konzept-Struktur" zu holen:
    #     structure = db.get_latest_artifact(project_id, "concept_structure")
    connection = _get_connection()
    cursor = connection.cursor()
    cursor.execute(
        """
        SELECT content FROM artifacts
        WHERE project_id = ? AND artifact_type = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (project_id, artifact_type),
    )
    row = cursor.fetchone()
    connection.close()
 
    if row is None:
        return None
 
    return json.loads(row["content"])
 
 
# =====================================================================
# IMAGES (dauerhaft gespeicherte Bild-Uploads)
# =====================================================================
 
def save_image(project_id: str, message_id: int, mime_type: str, data: bytes) -> int:
    # Speichert ein hochgeladenes Bild dauerhaft als Binärdaten (BLOB),
    # verknüpft mit der konkreten Nachricht (message_id), zu der es gehört -
    # so bleibt im Chatverlauf nachvollziehbar, WANN genau dieses Bild
    # geschickt wurde, nicht nur zu welchem Projekt.
    # Gibt die neue Bild-ID zurück.
    now = datetime.now(timezone.utc).isoformat()
 
    connection = _get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO images (project_id, message_id, mime_type, data, created_at) VALUES (?, ?, ?, ?, ?)",
        (project_id, message_id, mime_type, data, now),
    )
    connection.commit()
    new_id = cursor.lastrowid
    connection.close()
 
    return new_id
 
 
def get_images(project_id: str) -> list[dict]:
    # Holt alle gespeicherten Bilder zu einem Projekt.
    connection = _get_connection()
    cursor = connection.cursor()
    cursor.execute(
        "SELECT message_id, mime_type, data FROM images WHERE project_id = ? ORDER BY id ASC",
        (project_id,),
    )
    rows = cursor.fetchall()
    connection.close()
 
    return [
        {"message_id": row["message_id"], "mime_type": row["mime_type"], "data": row["data"]}
        for row in rows
    ]