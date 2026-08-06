"""
Router für den /projects Endpoint.

Winziger Endpoint, der NUR ein neues, leeres Projekt anlegt und dessen
project_id zurückgibt. Kein Modell-Aufruf, keine komplexe Logik - nur eine
neue Datenbank-Zeile. Braucht deshalb kein eigenes Schema und keinen
eigenen Prompt.
"""

from fastapi import APIRouter
import db.db as db

router = APIRouter()


@router.post("/projects")
def create_project_endpoint():
    # Legt ein neues, leeres Projekt an in der DB an und gibt die ID zurück.
    project_id = db.create_project()
    return {"project_id": project_id}
