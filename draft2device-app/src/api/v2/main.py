"""
FastAPI-Einstiegspunkt.
- endpoints/projects/router.py        -> POST /projects
- endpoints/analyze/router.py         -> POST /analyze
- endpoints/hardware/router.py        -> POST /hardware, POST /hardware/select, GET /hardware/{project_id}
- endpoints/glossary/router.py        -> POST /api/glossary/extract-and-explain
- endpoints/circuit_diagram/router.py -> POST /circuit-diagram, GET /circuit-diagram/{project_id}

Vorbereitung:
1. Installieren:
   pip install fastapi uvicorn openai python-multipart

2. Starten:
   uvicorn main:app --reload

3. Testen im Browser (automatische Doku):
   http://127.0.0.1:8000/docs
"""

from fastapi import FastAPI
from contextlib import asynccontextmanager

import db.db as db
from endpoints.projects import router as projects_router
from endpoints.analyze import router as analyze_router
from endpoints.hardware import router as hardware_router
from endpoints.glossary import router as glossary_router
from endpoints.circuit_diagram import router as circuit_diagram_router  # <-- 1. Hier importieren


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Der Code VOR "yield" läuft einmalig beim Serverstart.
    db.init_db()
    yield
    # Der Code NACH "yield" würde beim Herunterfahren des Servers laufen.


app = FastAPI(lifespan=lifespan)

# Jeden Endpoint-Router einzeln in die App einbinden.
app.include_router(projects_router.router)
app.include_router(analyze_router.router)
app.include_router(hardware_router.router)
app.include_router(glossary_router.router)
app.include_router(circuit_diagram_router.router)  # <-- 2. Hier registrieren