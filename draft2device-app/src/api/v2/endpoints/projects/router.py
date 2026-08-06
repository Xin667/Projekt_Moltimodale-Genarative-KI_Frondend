"""
Router für den /projects Endpoint.

Winziger Endpoint, der NUR ein neues, leeres Projekt anlegt und dessen
project_id zurückgibt. Kein Modell-Aufruf, keine komplexe Logik - nur eine
neue Datenbank-Zeile. Braucht deshalb kein eigenes Schema und keinen
eigenen Prompt.
"""

from fastapi import APIRouter
import db.db as db

import logging
from fastapi import APIRouter

router = APIRouter()

# Verwendet das vorhandene Uvicorn-Logging
logger = logging.getLogger("uvicorn.error")


@router.post("/projects")
def create_project_endpoint():
    # Legt ein neues, leeres Projekt an in der DB an und gibt die ID zurück.
    project_id = db.create_project()


    logger.info("Neues Projekt erstellt | project_id=%s", project_id)


    return {"project_id": project_id}
