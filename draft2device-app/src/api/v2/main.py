"""
FastAPI-Einstiegspunkt.
- endpoints/projects/router.py   -> POST /projects
- endpoints/analyze/router.py    -> POST /analyze

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
