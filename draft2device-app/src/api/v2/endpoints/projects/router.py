"""
Router für den /projects Endpoint.

Winziger Endpoint, der NUR ein neues, leeres Projekt anlegt und dessen
project_id zurückgibt. Kein Modell-Aufruf, keine komplexe Logik - nur eine
neue Datenbank-Zeile. Braucht deshalb kein eigenes Schema und keinen
eigenen Prompt.
"""

from fastapi import APIRouter, Form
from typing import Optional
import db.db as db
 
router = APIRouter()
 
 
@router.post("/projects")
def create_project_endpoint(name: Optional[str] = Form(default=None)):
    # Legt ein neues, leeres Projekt an in der DB an und gibt die ID zurück.
    # "name" ist optional - wird keiner angegeben, vergibt db.create_project()
    # automatisch einen Platzhalter-Namen wie "Projekt-3".
    project_id = db.create_project(name=name)
    return {"project_id": project_id}


@router.get("/projects")
def list_projects_endpoint():
    # Gibt ALLE bisher angelegten Projekte zurück (id + name + Erstellungsdatum).
    # Gleicher Pfad wie oben ("/projects"), aber andere HTTP-Methode (GET
    # statt POST) - das ist erlaubt und üblich: POST zum Anlegen, GET zum
    # Abrufen einer Liste.
    return {"projects": db.list_projects()}


@router.delete("/projects/{project_id}")
def delete_project_endpoint(project_id: str):
    # "{project_id}" in der Route ist ein PFAD-Parameter - der Wert steht
    # direkt in der URL, z.B. DELETE /projects/a1b2c3d4-... statt als
    # Formularfeld. FastAPI erkennt das automatisch, weil der Funktions-
    # Parameter "project_id" genauso heißt wie der Platzhalter in der Route.
    if not db.project_exists(project_id):
        return {"error": f"No project with id '{project_id}' found."}
 
    db.delete_project(project_id)
    return {"message": f"Project '{project_id}' and all related data have been deleted."}