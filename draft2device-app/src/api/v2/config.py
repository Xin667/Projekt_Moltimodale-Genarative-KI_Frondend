"""
Gemeinsame Konfiguration, die von mehreren Endpoints genutzt wird
(aktuell /analyze, später z.B. auch der Hardware-Endpoint).

Wird hier zentral an EINER Stelle definiert, damit nicht jeder Endpoint
seinen eigenen OpenAI-Client oder eigene grundsätzliche Verhaltens-Schalter
separat definiert.

WICHTIG: Was hier NICHT reingehört, ist alles, was nur zu EINEM bestimmten
Endpoint gehört (z.B. das JSON-Schema oder der Systemprompt für /analyze) -
das liegt stattdessen im jeweiligen Ordner unter endpoints/<name>/.
"""

from openai import OpenAI
from key import API_KEY

client = OpenAI(api_key=API_KEY)

# Der Modellname, der bei jedem Aufruf genutzt wird - an EINER Stelle
# änderbar, statt in jedem Endpoint einzeln.
model = "gpt-5.4-mini"

# ---------------------------------------------------------------------
# SCHALTER: Sollen bei JEDEM Modell-Aufruf ALLE bisher hochgeladenen Bilder
# des Projekts erneut mitgeschickt werden (True), oder nur das Bild, das
# GENAU JETZT (in diesem Request) neu hochgeladen wurde (False)?
#
# Das ist ein GRUNDSÄTZLICHES Verhalten (nicht spezifisch für /analyze) -
# falls später weitere Endpoints ebenfalls mit Bildern arbeiten, gilt
# derselbe Schalter für alle.
#
# False (günstiger): Ältere Bilder werden dem Modell nur einmal gezeigt,
#   direkt beim Upload. Spätere Rückfragen wie "schau nochmal ins Bild"
#   funktionieren dann nicht mehr zuverlässig, sparen aber Tokens/Kosten.
# True (teurer, mehr Kontext): Bei jedem einzelnen Refinement-Schritt werden
#   ALLE bisherigen Bilder des Projekts erneut an das Modell geschickt -
#   Kosten wachsen mit (Anzahl Bilder x Anzahl weiterer Chat-Runden).
# ---------------------------------------------------------------------
RESEND_ALL_IMAGES_EVERY_REQUEST = False
