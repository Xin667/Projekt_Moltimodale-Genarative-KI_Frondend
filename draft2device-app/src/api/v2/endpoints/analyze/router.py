"""
Router für den /analyze Endpoint.
 
Der eigentliche Arbeits-Endpoint. Braucht IMMER eine project_id (aus
POST /projects). Nimmt eine Nachricht (+ optional ein Bild) entgegen und
gibt die aktualisierte Struktur zurück. Funktioniert für den ALLERERSTEN
Aufruf genauso wie für jeden weiteren Refinement-Schritt - das Modell sieht
dabei jedes Mal die gesamte bisherige Chat-Historie.
"""
 
from fastapi import APIRouter, Form, File, UploadFile
from typing import Optional
 
import db.db as db
from config import client, model, RESEND_ALL_IMAGES_EVERY_REQUEST
from .schema import schema2
from .prompt import SYSTEM_PROMPT
 
import json
import base64

ARTIFACT_TYPE = "concept_structure"
 
router = APIRouter()
 
# Erzwingt das Schema aus schema.py bei jedem Modell-Aufruf DIESES Endpoints.
# Bleibt hier lokal, weil jeder Endpoint sein eigenes Schema hat.
RESPONSE_FORMAT = {
    "type": "json_schema",
    "json_schema": {
        "name": "iot_projekt_struktur",
        "schema": schema2,
        "strict": True,
    },
}
 
 
@router.post("/analyze")
async def analyze(
    project_id: str = Form(...),
    message: str = Form(...),
    image: Optional[UploadFile] = File(default=None),
):
    # --- Schritt 1: Existiert das Projekt überhaupt? ---
    if not db.project_exists(project_id):
        return {"error": f"No Project with ID '{project_id}' found. Please call POST /projects first."}
 
    # --- Schritt 2: Neue Nutzer-Nachricht in der Chat-Historie speichern ---
    # WICHTIG: Das muss VOR der Bild-Verarbeitung passieren, weil wir die
    # neue message_id brauchen, um das Bild (falls vorhanden) korrekt damit
    # zu verknüpfen (siehe Schritt 3).
    new_message_id = db.add_message(project_id, role="user", content=message)
 
    # --- Schritt 3: Bild (falls vorhanden) dauerhaft speichern ---
    if image:
        raw_data = await image.read()
        mime_type = image.content_type
        # Verknüpft mit der Nachricht von Schritt 2 - so bleibt im
        # Chatverlauf klar: "DIESES Bild gehört zu GENAU DIESER Nachricht".
        db.save_image(project_id, new_message_id, mime_type, raw_data)
 
    # --- Schritt 4: Komplette bisherige Historie + alle gespeicherten Bilder laden ---
    previous_messages = db.get_messages(project_id)
    all_images = db.get_images(project_id)
 
    # Bilder nach ihrer message_id gruppieren, damit wir gleich pro Nachricht
    # nachschauen können: "gehört zu DIESER Nachricht ein Bild?"
    # Aufbau: {message_id: [bild1, bild2, ...]}
    images_by_message: dict[int, list[dict]] = {}
    for image_row in all_images:
        images_by_message.setdefault(image_row["message_id"], []).append(image_row)
 
    # --- Schritt 5: Nachrichten-Liste für den Modell-Aufruf zusammenbauen ---
    messages_for_model = []
    last_index = len(previous_messages) - 1
 
    for index, msg in enumerate(previous_messages):
        is_latest_message = (index == last_index)
        images_for_this_message = images_by_message.get(msg["id"], [])
 
        # Entscheidung: Hängen wir bei DIESER Nachricht Bilder an?
        # - Bei der neuesten Nachricht: IMMER, falls gerade ein Bild hochgeladen wurde
        # - Bei allen älteren Nachrichten: NUR, falls der Schalter in config.py auf True steht
        attach_images = images_for_this_message and (
            is_latest_message or RESEND_ALL_IMAGES_EVERY_REQUEST
        )
 
        if attach_images:
            image_blocks = []
            for image_row in images_for_this_message:
                b64_image = base64.b64encode(image_row["data"]).decode("utf-8")
                image_blocks.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:{image_row['mime_type']};base64,{b64_image}"}
                })
 
            messages_for_model.append({
                "role": msg["role"],
                "content": [{"type": "text", "text": msg["content"]}] + image_blocks,
            })
        else:
            # Normale, reine Text-Nachricht
            messages_for_model.append({"role": msg["role"], "content": msg["content"]})
 
    # --- Schritt 6: Modell aufrufen ---
    response = client.chat.completions.create(
        model=model,
        reasoning_effort="low",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            *messages_for_model,
        ],
        response_format=RESPONSE_FORMAT,
    )
 
    result = json.loads(response.choices[0].message.content)
 
    # --- Schritt 7: Antwort speichern - sowohl in der Chat-Historie ... ---
    db.add_message(project_id, role="assistant", content=json.dumps(result, ensure_ascii=False))
 
    # --- ... als auch als eigenständiges Artefakt, für andere Endpoints ---
    db.save_artifact(project_id, ARTIFACT_TYPE, result)
 
    # --- Schritt 8: Ergebnis an den Client zurückgeben ---
    return {
        "project_id": project_id,
        **result,
    }
 
