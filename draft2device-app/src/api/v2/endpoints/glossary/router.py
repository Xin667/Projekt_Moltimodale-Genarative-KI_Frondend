from fastapi import APIRouter
from pydantic import BaseModel
from openai import OpenAI
import json
from key import API_KEY

router = APIRouter(prefix="/api/glossary", tags=["Glossary"])

client = OpenAI(api_key=API_KEY)

class TextAnalysisRequest(BaseModel):
    text: str

@router.post("/extract-and-explain")
def extract_and_explain_iot_terms(req: TextAnalysisRequest):
    if not req.text or len(req.text.strip()) < 3:
        return {"terms": []}

    prompt = f"""
Analysiere folgenden Text aus einer Hardware-/IoT-Projektansicht:
"{req.text}"

AUFGABE:
Finde ALLE Fachbegriffe, Bauteilnamen, Pin-Bezeichnungen und Protokolle aus den Bereichen Elektronik, Hardware, Sensorik und IoT.
Beispiele für Begriffe, die du finden sollst:
- Pins/Versorgung: VCC, GND, AO, Signal, 3.3V - 5.5V, Logikpegel, Pegel
- Bauformen/Schnittstellen: Grove, Grove 4-Pin, Header, Analog, Analog-Eingang, Port, Port: Analog
- Sensortypen/Mechanik: kapazitiv, Bodenfeuchtesensor, korrosionsbeständig, Widerstandsfühler, Metallsonden, Messprinzip, SEN0193
- Chips & Funk: ESP32, Pico, GPIO, ADC, PWM, WiFi, Bluetooth, BLE

REGELN:
- Ignoriere nur reine Füllwörter und Allgemeinbegriffe (z. B. "sehr", "gut", "einfache", "Wahl", "Schritt").
- Gib für JEDEN gefundenen Begriff eine einfache, kurze Erklärung (1 prägnanter Satz).
- Gib immer gültiges JSON mit dem Root-Key "terms" zurück.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Du bist ein technischer Glossar-Extraktor. "
                        "Antworte ausschließlich im JSON-Format: "
                        "{\"terms\": [{\"term\": \"exakter Begriff aus dem Text\", \"explanation\": \"kurze Erklärung\", \"category\": \"Elektronik/Sensorik/Hardware\"}]}"
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )

        data = json.loads(response.choices[0].message.content)
        return data
    except Exception as e:
        print(f"Fehler bei KI-Glossar Backend: {e}")
        return {"terms": []}