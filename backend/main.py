import os
import json
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import uuid
from supabase import create_client, Client
from fastapi.responses import JSONResponse
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2 import service_account
from google.auth.transport.requests import Request as GoogleAuthRequest
from google_auth_oauthlib.flow import InstalledAppFlow
import io
import pickle

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Define Pydantic models
class ProjectBase(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: str
    created_at: Optional[str] = None

class TaskBase(BaseModel):
    id: Optional[str] = None
    title: str
    status: str
    category: Optional[str] = None
    priority: str
    due_date: str
    project_id: Optional[str] = None
    description: Optional[str] = None
    employee_id: Optional[str] = None
    created_at: Optional[str] = None
    file_name: Optional[str] = None
    file: Optional[str] = None

class NoteBase(BaseModel):
    id: Optional[str] = None
    title: str
    category: Optional[str] = None
    description: Optional[str] = None
    employee_id: Optional[str] = None
    project_id: Optional[str] = None
    created_at: Optional[str] = None
    file: Optional[str] = None

class EventBase(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    due_date: datetime
    type: str
    project_id: Optional[str] = None
    employee_id: Optional[str] = None

class ReminderBase(BaseModel):
    id: Optional[str] = None
    title: str
    due_date: str
    priority: str
    status: bool
    project_id: Optional[str] = None
    employee_id: Optional[str] = None

class FileBase(BaseModel):
    id: Optional[str] = None
    title: str
    file_type: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[str] = None
    project_id: Optional[str] = None
    employee_id: Optional[str] = None
    note_id: Optional[str] = None
    task_id: Optional[str] = None
    created_at: Optional[str] = None

class EmployeeBase(BaseModel):
    id: Optional[str] = None
    name: str
    project_id: Optional[str] = None
    role: Optional[str] = None
    status: bool

class TaskStatusUpdate(BaseModel):
    status: str

# Initialize FastAPI
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper functions
def generate_id() -> str:
    return str(uuid.uuid4())

def get_current_timestamp() -> str:
    return datetime.now().isoformat()

def convert_datetime_to_string(data: dict) -> dict:
    for key, value in data.items():
        if isinstance(value, datetime):
            data[key] = value.isoformat()
    return data

def upload_file(file: UploadFile, project_id: Optional[str] = None):
    # Setup Google Drive API
    SCOPES = ['https://www.googleapis.com/auth/drive']
    creds = None
    # Load saved credentials if they exist
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If credentials don't exist or are invalid, get new ones
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            request = GoogleAuthRequest()
            creds.refresh(request)
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save credentials for future use
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    # Build the Drive API client
    drive_service = build('drive', 'v3', credentials=creds)

    if project_id:
        project_query = supabase.table("projects").select("*").eq("id", project_id).execute()
        if project_query.data:
            project_data = project_query.data[0]
            project_name = project_data["title"]
    
    # Check if directory exists
    # folder_id = None
    # query = f"name='{project_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    # response = drive_service.files().list(q=query).execute()
    
    # if response.get('files'):
    #     # Directory exists
    #     folder_id = response['files'][0]['id']
    # else:
    #     # Create directory
    #     folder_metadata = {
    #         'name': project_name,
    #         'mimeType': 'application/vnd.google-apps.folder'
    #     }
    #     folder = drive_service.files().create(body=folder_metadata, fields='id').execute()
    #     folder_id = folder.get('id')
    # Upload file to the directory
    file_content = io.BytesIO(file.file.read())
    
    # Create file metadata
    file_metadata = {
        'name': file.filename,
        'parents': ['root']
    }
    # Upload the file
    media = MediaIoBaseUpload(file_content, mimetype=file.content_type, resumable=True)
    uploaded_file = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()
    file_id = uploaded_file.get('id')
    file_url = f"https://drive.google.com/file/d/{file_id}/view"
    
    return {
        "file_id": file_id,
        "file_url": file_url,
        "project_name": project_name,
        "file_size": file.size,
        "file_type": file.content_type
    }

def delete_file_from_drive(file_id: str):
    # Setup Google Drive API
    SCOPES = ['https://www.googleapis.com/auth/drive']
    creds = None
    
    # Load saved credentials if they exist
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    # If credentials don't exist or are invalid, get new ones
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            request = GoogleAuthRequest()
            creds.refresh(request)
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    drive_service = build('drive', 'v3', credentials=creds)
    drive_service.files().delete(fileId=file_id).execute()
    print("File deleted successfully")
    return {"message": "File deleted successfully"}

# API Routes
@app.get("/")
def read_root():
    return {"message": "Welcome to Project Management API"}

# Projects
@app.get("/projects")
async def get_projects(status: Optional[str] = None):
    query = supabase.table("projects").select("*")
    if status:
        query = query.neq("status", status)
    response = query.execute()
    if response.data is None:
        return []
    return response.data

@app.get("/projects/{project_id}", response_model=ProjectBase)
async def get_project(project_id: str):
    query = supabase.table("projects").select("*").eq("id", project_id)
    response = query.execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    project_data = response.data[0]
    return project_data

@app.post("/projects", response_model=ProjectBase)
async def create_project(project: ProjectBase):
    project_data = project.dict()
    
    if not project_data.get("id"):
        project_data["id"] = generate_id()
    
    now = get_current_timestamp()
    project_data["created_at"] = now
    if project_data.get("start_date") == "":
        project_data["start_date"] = None
    if project_data.get("end_date") == "":
        project_data["end_date"] = None
    response = supabase.table("projects").insert(project_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create project")
    
    created_project = response.data[0]
    return created_project

@app.put("/projects/{project_id}", response_model=ProjectBase)
async def update_project(project_id: str, project: ProjectBase):
    # Verify the project exists
    check_response = supabase.table("projects").select("*").eq("id", project_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_data = project.dict(exclude_unset=True)
    
    response = supabase.table("projects").update(project_data).eq("id", project_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update project")
    
    updated_project = response.data[0]
    return updated_project

@app.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    # Verify the project exists
    check_response = supabase.table("projects").select("*").eq("id", project_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    response = supabase.table("projects").delete().eq("id", project_id).execute()
    return {"message": "Project deleted successfully"}

# Tasks
@app.get("/tasks")
async def get_tasks(project_id: Optional[str] = None, employee_id: Optional[str] = None):
    query = supabase.table("tasks").select("*")
    
    if project_id:
        query = query.eq("project_id", project_id)
    
    if employee_id:
        query = query.eq("employee_id", employee_id)

    response = query.execute()
    if response.data is None:
        return []
    return response.data

@app.get("/tasks/{task_id}", response_model=TaskBase)
async def get_task(task_id: str):
    response = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    task_data = response.data[0]
    return task_data

@app.post("/tasks", response_model=TaskBase)
async def create_task(
    title: str = Form(...),
    status: str = Form(...),
    category:str = Form(None),
    priority: str = Form(...),
    due_date: str = Form(...),
    project_id: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    employee_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    task_data = {
        "id": generate_id(),
        "title": title,
        "status": status,
        "category": category,
        "priority": priority,
        "due_date": due_date,
        "project_id": project_id,
        "description": description,
        "employee_id": employee_id,
        "created_at": get_current_timestamp(),
        "file_id": None
    }
    
    # Insert task first to get the task_id
    response = supabase.table("tasks").insert(task_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create task")
    
    created_task = response.data[0]
    
    # Handle file upload if provided
    if file and file.filename:
        try:
            upload_result = upload_file(file, project_id=project_id)
            # Update the task with the file URL
            supabase.table("tasks").update({"file_id": upload_result["file_id"]}).eq("id", created_task["id"]).execute()
            file_data = {
                "id": upload_result['file_id'],
                "title": file.filename,
                "file_path": upload_result['file_url'],
                "file_type": upload_result['file_type'],
                "file_size": upload_result['file_size'],
                "project_id": project_id,
                "task_id": created_task["id"],
                "created_at": get_current_timestamp()
            }
            response = supabase.table("files").insert(file_data).execute()
            if not response.data:
                raise HTTPException(status_code=400, detail="Failed to create file")
        except Exception as e:
            # Log the error but don't fail the request
            print(f"File upload failed: {str(e)}")
            # Update the error message in the response
            created_task["file_upload_error"] = str(e)
    
    return created_task

@app.put("/tasks/{task_id}")
async def update_task(
    task_id: str,
    title: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    priority: Optional[str] = Form(None),
    due_date: Optional[str] = Form(None),
    project_id: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    employee_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    # Verify the task exists
    check_response = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Build update data from form fields
    task_data = {}
    if title is not None:
        task_data["title"] = title
    if status is not None:
        task_data["status"] = status
    if category is not None:
        task_data["category"] = category
    if priority is not None:
        task_data["priority"] = priority
    if due_date is not None:
        task_data["due_date"] = due_date
    if project_id is not None:
        task_data["project_id"] = project_id
    if description is not None:
        task_data["description"] = description
    if employee_id is not None:
        task_data["employee_id"] = employee_id
    
    # Handle file upload if provided
    if file and file.filename:
        try:
            upload_result = upload_file(file, project_id=project_id)
            task_data["file"] = upload_result["file_url"]
        except Exception as e:
            print(f"File upload failed: {str(e)}")
    
    response = supabase.table("tasks").update(task_data).eq("id", task_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update task")
    
    updated_task = response.data[0]
    
    # If file upload failed, add error message to response
    if file and file.filename and "file_id" not in task_data:
        updated_task["file_upload_error"] = "File upload failed"
    
    return updated_task

@app.put("/tasks/{task_id}/status")
async def update_task_status(task_id: str, task_status: TaskStatusUpdate):
    # Verify the task exists
    check_response = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = {
        "status": task_status.status,
    }
    response = supabase.table("tasks").update(update_data).eq("id", task_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update task status")
    
    updated_task = response.data[0]
    return updated_task

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    # Verify the task exists
    check_response = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    response = supabase.table("tasks").delete().eq("id", task_id).execute()
    return {"message": "Task deleted successfully"}

# Notes
@app.get("/notes")
async def get_notes(project_id: Optional[str] = None, employee_id: Optional[str] = None):
    query = supabase.table("notes").select("*")
    
    if project_id:
        query = query.eq("project_id", project_id)
    if employee_id:
        query = query.eq("employee_id", employee_id)
    
    response = query.execute()
    if response.data is None:
        return []
    return response.data

@app.get("/notes/{note_id}", response_model=NoteBase)
async def get_note(note_id: str):
    response = supabase.table("notes").select("*").eq("id", note_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Note not found")
    note_data = response.data[0]
    return note_data

@app.post("/notes", response_model=NoteBase)
async def create_note(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    employee_id: Optional[str] = Form(None),
    project_id: Optional[str] = Form(None),
    created_at: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    note_data = {
        "id": generate_id(),
        "title": title,
        "description": description,
        "employee_id": employee_id,
        "project_id": project_id,
        "created_at": created_at or get_current_timestamp(),
        "file_url": None
    }
    
    # Handle file upload if provided
    if file and file.filename:
        try:
            upload_result = upload_file(file=file, project_id=project_id)
            
            file_data = {
                "id": upload_result['file_id'],
                "title": file.filename,
                "file_path": upload_result['file_url'],
                "file_type": file.content_type,
                "file_size": file.size,
                "task_id": None,
                "note_id": note_data["id"],
                "project_id": project_id if project_id else None,
                "created_at": get_current_timestamp()
            }
            
            # Update the note with the file URL
            if upload_result['file_url']:
                note_data['file_url'] = upload_result['file_url']
                response = supabase.table("notes").insert(note_data).execute()
                if not response.data:
                    raise HTTPException(status_code=400, detail="Failed to create note")
                
                response_file = supabase.table("files").insert(file_data).execute()
                if not response_file.data:
                    raise HTTPException(status_code=400, detail="Failed to create file")
        except Exception as e:
            # Log the error but don't fail the request
            print(f"File upload failed: {str(e)}")
            # Update the error message in the response
            note_data["file_upload_error"] = str(e)
            raise HTTPException(status_code=400, detail="Failed to create note")
    else:
        # No file upload, just create the note
        response = supabase.table("notes").insert(note_data).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create note")
        note_data = response.data[0]  # Get the full note data from the database
    
    return note_data

@app.put("/notes/{note_id}", response_model=NoteBase)
async def update_note(
    note_id: str,
    title: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    employee_id: Optional[str] = Form(None),
    project_id: Optional[str] = Form(None),
    created_at: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    # Verify the note exists
    check_response = supabase.table("notes").select("*").eq("id", note_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Build update data from form fields
    note_data = {}
    if title is not None:
        note_data["title"] = title
    if category is not None:
        note_data["category"] = category
    if description is not None:
        note_data["description"] = description
    if employee_id is not None:
        note_data["employee_id"] = employee_id
    if project_id is not None:
        note_data["project_id"] = project_id
    if created_at is not None:
        note_data["created_at"] = created_at
    
    # Handle file upload if provided
    if file and file.filename:
        try:
            upload_result = upload_file(file, project_id=project_id)
            note_data["file_url"] = upload_result["file_url"]
            
            # Create a file record in the database
            file_data = {
                "id": upload_result['file_id'],
                "title": file.filename,
                "file_path": upload_result['file_url'],
                "file_type": file.content_type,
                "file_size": file.size,
                "task_id": None,
                "note_id": note_id,
                "project_id": project_id if project_id else None,
                "created_at": get_current_timestamp()
            }
            
            response_file = supabase.table("files").insert(file_data).execute()
            if not response_file.data:
                raise HTTPException(status_code=400, detail="Failed to create file")
                
        except Exception as e:
            print(f"File upload failed: {str(e)}")
            # Don't update the file field if upload failed
    
    # Only update if there are fields to update
    if note_data:
        #delete the file from drive
        try:
            file_url = note_data["file_url"]
            try:
                delete_file_from_drive(file_url)
                response_file = supabase.table("files").delete().eq("file_url", file_url).execute()
                if not response_file.data:
                    raise HTTPException(status_code=400, detail="Failed to delete file")
            except Exception as e:
                print(f"File deletion failed: {str(e)}")
                print(f"File deletion failed: {str(e)}")
        except Exception as e:  #delete the file from supabase
            print(f"File deletion failed: {str(e)}")
        response = supabase.table("notes").update(note_data).eq("id", note_id).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to update note")
        updated_note = response.data[0]
    else:
        # No changes to make
        updated_note = check_response.data[0]
    
    return updated_note

@app.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    # Verify the note exists
    check_response = supabase.table("notes").select("*").eq("id", note_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Delete the file from Google Drive
    try:
        file_url = check_response.data[0]["file_url"]
        if file_url:
            file_id = supabase.table("files").select("*").eq("file_path", file_url).execute().data[0]["id"]
            delete_file_from_drive(file_id)
            response_file = supabase.table("files").delete().eq("id", file_id).execute()
            if not response_file.data:
                raise HTTPException(status_code=400, detail="Failed to delete file")
            response = supabase.table("notes").delete().eq("id", note_id).execute()
            if not response.data:
                raise HTTPException(status_code=400, detail="Failed to delete note")
            return {"message": "Note deleted successfully"}
    except Exception as e:
        print(f"File deletion failed: {str(e)}")
    #delete the note from supabase
# Events
@app.get("/events")
async def get_events(project_id: Optional[str] = None, employee_id: Optional[str] = None):
    query = supabase.table("events").select("*")
    
    if project_id:
        query = query.eq("project_id", project_id)
    
    if employee_id:
        query = query.eq("employee_id", employee_id)
    
    response = query.execute()
    if response.data is None:
        return []
    return response.data

@app.get("/events/{event_id}", response_model=EventBase)
async def get_event(event_id: str):
    response = supabase.table("events").select("*").eq("id", event_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Event not found")
    event_data = response.data[0]
    return event_data

@app.post("/events", response_model=EventBase)
async def create_event(event: EventBase):
    event_data = event.dict()
    
    if not event_data.get("id"):
        event_data["id"] = generate_id()
    
    event_data = convert_datetime_to_string(event_data)
    
    response = supabase.table("events").insert(event_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create event")
    
    created_event = response.data[0]
    return created_event

@app.put("/events/{event_id}", response_model=EventBase)
async def update_event(event_id: str, event: EventBase):
    # Verify the event exists
    check_response = supabase.table("events").select("*").eq("id", event_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Event not found")
    event_data = convert_datetime_to_string(event.dict(exclude_unset=True))
    response = supabase.table("events").update(event_data).eq("id", event_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update event")
    
    updated_event = response.data[0]
    return updated_event

@app.delete("/events/{event_id}")
async def delete_event(event_id: str):
    # Verify the event exists
    check_response = supabase.table("events").select("*").eq("id", event_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Event not found")
    
    response = supabase.table("events").delete().eq("id", event_id).execute()
    return {"message": "Event deleted successfully"}

# Reminders
@app.get("/reminders")
async def get_reminders(project_id: Optional[str] = None, employee_id: Optional[str] = None, status: Optional[str] = None):
    query = supabase.table("reminders").select("*")
    
    if project_id:
        query = query.eq("project_id", project_id)
    if employee_id:
        query = query.eq("employee_id", employee_id)
    if status:
        if status == "false":
            query = query.eq("status", False)
        else:
            query = query.eq("status", True)
    
    response = query.execute()
    if response.data is None:
        return []
    return response.data

@app.get("/reminders/{reminder_id}", response_model=ReminderBase)
async def get_reminder(reminder_id: str):
    response = supabase.table("reminders").select("*").eq("id", reminder_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Reminder not found")
    reminder_data = response.data[0]
    return reminder_data

@app.post("/reminders", response_model=ReminderBase)
async def create_reminder(reminder: ReminderBase):
    reminder_data = reminder.dict()
    
    if not reminder_data.get("id"):
        reminder_data["id"] = generate_id()
    
    response = supabase.table("reminders").insert(reminder_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create reminder")
    
    created_reminder = response.data[0]
    return created_reminder

@app.put("/reminders/{reminder_id}", response_model=ReminderBase)
async def update_reminder(reminder_id: str, reminder: ReminderBase):
    # Verify the reminder exists
    check_response = supabase.table("reminders").select("*").eq("id", reminder_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    reminder_data = reminder.dict(exclude_unset=True)
    
    response = supabase.table("reminders").update(reminder_data).eq("id", reminder_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update reminder")
    
    updated_reminder = response.data[0]
    return updated_reminder

@app.delete("/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str):
    # Verify the reminder exists
    check_response = supabase.table("reminders").select("*").eq("id", reminder_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    response = supabase.table("reminders").delete().eq("id", reminder_id).execute()
    return {"message": "Reminder deleted successfully"}

# Files
@app.get("/files", response_model=List[FileBase])
async def get_files(project_id: Optional[str] = None):
    query = supabase.table("files").select("*")
    
    if project_id:
        query = query.eq("project_id", project_id)
    
    response = query.execute()
    
    if response.data is None:
        return []
    return response.data

@app.get("/files/{file_id}", response_model=FileBase)
async def get_file(file_id: str):
    response = supabase.table("files").select("*").eq("id", file_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="File not found")
    file_data = response.data[0]
    return file_data

@app.delete("/files/{file_id}")
async def delete_file(file_id: str):
    # Get file info
    delete_file_from_drive(file_id)
    check_response = supabase.table("files").delete().eq("id", file_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="File not found")
    return {"message": "File deleted successfully"}

# Employees
# Get all employees
@app.get("/employees", response_model=List[EmployeeBase])
async def get_employees():
    response = supabase.table("employees").select("*").execute()
    return response.data

# Get employee by ID
@app.get("/employees/{employee_id}", response_model=EmployeeBase)
async def get_employee(employee_id: str):
    response = supabase.table("employees").select("*").eq("id", employee_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Employee not found")
    employee_data = response.data[0]
    return employee_data

# Create employee
@app.post("/employees", response_model=EmployeeBase)
async def create_employee(employee: EmployeeBase):
    employee.id = generate_id()
    response = supabase.table("employees").insert(employee.dict()).execute()
    return response.data[0]

# Update employee
@app.put("/employees/{employee_id}", response_model=EmployeeBase)
async def update_employee(employee_id: str, employee: EmployeeBase):
    response = supabase.table("employees").update(employee.dict()).eq("id", employee_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update employee")
    updated_employee = response.data[0]
    return updated_employee

# Delete employee
@app.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str):
    response = supabase.table("employees").delete().eq("id", employee_id).execute()
    return {"message": "Employee deleted successfully"}

# Run the application with uvicorn
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port) 