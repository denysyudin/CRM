import os
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import uuid
from supabase import create_client, Client
from fastapi.responses import JSONResponse
import io
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Initialize Google Drive client
SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = os.environ.get("GOOGLE_SERVICE_ACCOUNT_FILE")
GOOGLE_DRIVE_FOLDER_ID = "17gyX14WCWpOiOyiwBout9-wvkhtuNV7q"

def get_google_drive_service():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build('drive', 'v3', credentials=credentials)

# Define Pydantic models
class ProjectBase(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    start_date: str
    end_date: str
    status: str

class TaskBase(BaseModel):
    id: Optional[str] = None
    title: str
    category: str
    status: str
    priority: str
    employee_id: Optional[str] = None
    due_date: datetime
    project_id: Optional[str] = None
    description: Optional[str] = None
    next_checkin_date: Optional[datetime] = None
    files: Optional[str] = None

class NoteBase(BaseModel):
    id: Optional[str] = None
    title: str
    category: Optional[str] = None
    description: Optional[str] = None
    employee_id: Optional[str] = None
    project_id: Optional[str] = None
    created_at: Optional[datetime] = None
    files: Optional[str] = None

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
    due_date: datetime
    priority: str
    status: str
    project_id: Optional[str] = None
    employee_id: Optional[str] = None

class FileBase(BaseModel):
    id: Optional[str] = None
    title: str
    file_path: str
    file_type: str
    size: int
    category: str

class EmployeeBase(BaseModel):
    id: Optional[str] = None
    name: str
    role: Optional[str] = None


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

def convert_datetimes_to_strings(obj):
    """Recursively convert all datetime objects to ISO format strings"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {key: convert_datetimes_to_strings(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_datetimes_to_strings(item) for item in obj]
    return obj

# API Routes
@app.get("/")
def read_root():
    return {"message": "Welcome to Project Management API"}

# Projects
#get all projects       
@app.get("/projects", response_model=List[ProjectBase])
async def get_projects():
    response = supabase.table("projects").select("*").execute()
    if response.data is None:
        return []
    return response.data

#get project by id
@app.get("/projects/{project_id}", response_model=ProjectBase)
async def get_project(project_id: str):
    response = supabase.table("projects").select("*").eq("id", project_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return response.data[0]

#create project
@app.post("/projects", response_model=ProjectBase)
async def create_project(project: ProjectBase):
    project_data = project.dict()
    
    if not project_data.get("id"):
        project_data["id"] = generate_id()
    
    now = get_current_timestamp()
    project_data["created_at"] = now
    project_data["updated_at"] = now
    
    response = supabase.table("projects").insert(project_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create project")
    
    return response.data[0]

#update project
@app.put("/projects/{project_id}", response_model=ProjectBase)
async def update_project(project_id: str, project: ProjectBase):
    # Verify the project exists
    check_response = supabase.table("projects").select("*").eq("id", project_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_data = project.dict(exclude_unset=True)
    project_data["updated_at"] = get_current_timestamp()
    
    response = supabase.table("projects").update(project_data).eq("id", project_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update project")
    
    return response.data[0]

#delete project
@app.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    # Verify the project exists
    check_response = supabase.table("projects").select("*").eq("id", project_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    response = supabase.table("projects").delete().eq("id", project_id).execute()
    return {"message": "Project deleted successfully"}

# Tasks
#get all tasks
@app.get("/tasks", response_model=List[TaskBase])
async def get_tasks():
    query = supabase.table("tasks").select("*")
    
    response = query.execute()
    if response.data is None:
        return []
    return response.data

#get tasks by project id
@app.get("/tasks/{project_id}", response_model=List[TaskBase])
async def get_tasks_by_project_id(project_id: str):
    query = supabase.table("tasks").select("*").eq("project_id", project_id)
    response = query.execute()
    return response.data

#get tasks by employee id
@app.get("/tasks/employee/{employee_id}", response_model=List[TaskBase])
async def get_tasks_by_employee_id(employee_id: str):
    query = supabase.table("tasks").select("*").eq("employee_id", employee_id)
    response = query.execute()
    return response.data

#get task by id
@app.get("/tasks/{task_id}", response_model=TaskBase)
async def get_task(task_id: str):
    response = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return response.data[0]

#create task
@app.post("/tasks", response_model=TaskBase)
async def create_task(task: TaskBase):
    task_data = task.dict()
    print("this is the task data", task_data)
    if not task_data.get("id"):
        task_data["id"] = generate_id()
    
    # Convert all datetime objects to ISO strings
    task_data = convert_datetimes_to_strings(task_data)
    
    now = get_current_timestamp()
    task_data["created_at"] = now
    
    response = supabase.table("tasks").insert(task_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create task")
    
    return response.data[0]

#update task
@app.put("/tasks/{task_id}", response_model=TaskBase)
async def update_task(task_id: str, task: TaskBase):
    # Verify the task exists
    check_response = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_data = task.dict(exclude_unset=True)
    
    # Convert all datetime objects to ISO strings
    task_data = convert_datetimes_to_strings(task_data)
    
    response = supabase.table("tasks").update(task_data).eq("id", task_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update task")
    
    return response.data[0]

#delete task
@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    # Verify the task exists
    check_response = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    response = supabase.table("tasks").delete().eq("id", task_id).execute()
    return {"message": "Task deleted successfully"}

# Notes
#get all notes
@app.get("/notes", response_model=List[NoteBase])
async def get_notes(project_id: Optional[str] = None):
    query = supabase.table("notes").select("*")
    
    if project_id:
        query = query.eq("project_id", project_id)
    
    response = query.execute()
    if response.data is None:
        return []
    return response.data

#get notes by project id
@app.get("/notes/{project_id}", response_model=List[NoteBase])
async def get_notes_by_project_id(project_id: str):
    query = supabase.table("notes").select("*").eq("project_id", project_id)
    response = query.execute()
    return response.data

#get notes by employee id
@app.get("/notes/employee/{employee_id}", response_model=List[NoteBase])
async def get_notes_by_employee_id(employee_id: str):
    query = supabase.table("notes").select("*").eq("employee_id", employee_id)
    response = query.execute()
    return response.data

#get note by month
@app.get("/notes/by-month/{year}/{month}", response_model=List[NoteBase])
async def get_notes_by_month(year: int, month: int):
    # Validate month range
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    
    # Use PostgreSQL EXTRACT function to filter by month and year
    query = supabase.table("notes").select("*").eq(
        "extract(year from due_date::timestamp)", year
    ).eq(
        "extract(month from due_date::timestamp)", month
    )
    
    response = query.execute()
    if response.data is None:
        return []
    return response.data

#get note by id
@app.get("/notes/{note_id}", response_model=NoteBase)
async def get_note(note_id: str):
    response = supabase.table("notes").select("*").eq("id", note_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Note not found")
    return response.data[0]

#create note
@app.post("/notes", response_model=NoteBase)
async def create_note(note: NoteBase):
    note_data = note.dict()
    
    if not note_data.get("id"):
        note_data["id"] = generate_id()
    
    now = get_current_timestamp()
    note_data["created_at"] = now
    note_data["updated_at"] = now
    
    response = supabase.table("notes").insert(note_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create note")
    
    return response.data[0]

#update note
@app.put("/notes/{note_id}", response_model=NoteBase)
async def update_note(note_id: str, note: NoteBase):
    # Verify the note exists
    check_response = supabase.table("notes").select("*").eq("id", note_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Note not found")
    
    note_data = note.dict(exclude_unset=True)
    note_data["updated_at"] = get_current_timestamp()
    
    response = supabase.table("notes").update(note_data).eq("id", note_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update note")
    
    return response.data[0]

#delete note
@app.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    # Verify the note exists
    check_response = supabase.table("notes").select("*").eq("id", note_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Note not found")
    
    response = supabase.table("notes").delete().eq("id", note_id).execute()
    return {"message": "Note deleted successfully"}

# Events
#get all events
@app.get("/events", response_model=List[EventBase])
async def get_events(project_id: Optional[str] = None):
    query = supabase.table("events").select("*")
    
    if project_id:
        query = query.eq("project_id", project_id)
    
    response = query.execute()
    if response.data is None:
        return []
    return response.data

#get events by project id
@app.get("/events/{project_id}", response_model=List[EventBase])
async def get_events_by_project_id(project_id: str):
    query = supabase.table("events").select("*").eq("project_id", project_id)
    response = query.execute()
    return response.data

#get events by employee id
@app.get("/events/employee/{employee_id}", response_model=List[EventBase])
async def get_events_by_employee_id(employee_id: str):
    query = supabase.table("events").select("*").eq("employee_id", employee_id)
    response = query.execute()
    return response.data

#get event by month
@app.get("/events/by-month/{year}/{month}", response_model=List[EventBase])
async def get_events_by_month(year: int, month: int):
    query = supabase.table("events").select("*").eq(
        "extract(year from due_date::timestamp)", year
    ).eq(
        "extract(month from due_date::timestamp)", month
    )
    
    response = query.execute()
    if response.data is None:
        return []   


#get event by id
@app.get("/events/{event_id}", response_model=EventBase)
async def get_event(event_id: str):
    response = supabase.table("events").select("*").eq("id", event_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Event not found")
    return response.data[0]

#create event
@app.post("/events", response_model=EventBase)
async def create_event(event: EventBase):
    event_data = event.dict()
    
    if not event_data.get("id"):
        event_data["id"] = generate_id()
    
    now = get_current_timestamp()
    event_data["created_at"] = now
    event_data["updated_at"] = now
    
    response = supabase.table("events").insert(event_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create event")
    
    return response.data[0]

#update event
@app.put("/events/{event_id}", response_model=EventBase)
async def update_event(event_id: str, event: EventBase):
    # Verify the event exists
    check_response = supabase.table("events").select("*").eq("id", event_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event_data = event.dict(exclude_unset=True)
    event_data["updated_at"] = get_current_timestamp()
    
    response = supabase.table("events").update(event_data).eq("id", event_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update event")
    
    return response.data[0]

#delete event
@app.delete("/events/{event_id}")
async def delete_event(event_id: str):
    # Verify the event exists
    check_response = supabase.table("events").select("*").eq("id", event_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Event not found")
    
    response = supabase.table("events").delete().eq("id", event_id).execute()
    return {"message": "Event deleted successfully"}

# Reminders
#get all reminders  
@app.get("/reminders", response_model=List[ReminderBase])
async def get_reminders(project_id: Optional[str] = None):
    query = supabase.table("reminders").select("*")
    
    if project_id:
        query = query.eq("project_id", project_id)
    
    response = query.execute()
    if response.data is None:
        return []
    return response.data

#get reminder by id
@app.get("/reminders/{reminder_id}", response_model=ReminderBase)
async def get_reminder(reminder_id: str):
    response = supabase.table("reminders").select("*").eq("id", reminder_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return response.data[0]

#create reminder
@app.post("/reminders", response_model=ReminderBase)
async def create_reminder(reminder: ReminderBase):
    reminder_data = reminder.dict()
    
    if not reminder_data.get("id"):
        reminder_data["id"] = generate_id()
    
    now = get_current_timestamp()
    reminder_data["created_at"] = now
    reminder_data["updated_at"] = now
    
    response = supabase.table("reminders").insert(reminder_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create reminder")
    
    return response.data[0]

#update reminder
@app.put("/reminders/{reminder_id}", response_model=ReminderBase)
async def update_reminder(reminder_id: str, reminder: ReminderBase):
    # Verify the reminder exists
    check_response = supabase.table("reminders").select("*").eq("id", reminder_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    reminder_data = reminder.dict(exclude_unset=True)
    reminder_data["updated_at"] = get_current_timestamp()
    
    response = supabase.table("reminders").update(reminder_data).eq("id", reminder_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update reminder")
    
    return response.data[0]

#delete reminder
@app.delete("/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str):
    # Verify the reminder exists
    check_response = supabase.table("reminders").select("*").eq("id", reminder_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    response = supabase.table("reminders").delete().eq("id", reminder_id).execute()
    return {"message": "Reminder deleted successfully"}

# Files
#get all files
@app.get("/files", response_model=List[FileBase])
async def get_files(project_id: Optional[str] = None):
    query = supabase.table("files").select("*")
    
    if project_id:
        query = query.eq("project_id", project_id)
    
    response = query.execute()
    if response.data is None:
        return []
    return response.data

#get file by id
@app.get("/files/{file_id}", response_model=FileBase)
async def get_file(file_id: str):
    response = supabase.table("files").select("*").eq("id", file_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="File not found")
    return response.data[0]

#upload file
@app.post("/files")
async def upload_file(
    file: UploadFile = File(...),
    project_id: Optional[str] = Form(None)
):
    # Generate a unique file name
    file_id = generate_id()
    file_extension = os.path.splitext(file.filename)[1]
    storage_filename = f"{file_id}{file_extension}"
    
    # Read file content
    file_content = await file.read()
    
    # Upload file to Google Drive
    drive_service = get_google_drive_service()
    media = MediaIoBaseUpload(
        io.BytesIO(file_content),
        mimetype=file.content_type,
        resumable=True
    )
    
    file_metadata = {
        'name': storage_filename,
        'mimeType': file.content_type,
        'parents': [GOOGLE_DRIVE_FOLDER_ID]  # Specify folder ID to upload to
    }
    
    # Upload to Google Drive
    drive_file = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id,webViewLink'
    ).execute()
    
    # Set file permissions to anyone with the link can view
    drive_service.permissions().create(
        fileId=drive_file['id'],
        body={'type': 'anyone', 'role': 'reader'},
        fields='id'
    ).execute()
    
    # Create file record in database
    file_data = {
        "id": file_id,
        "name": file.filename,
        "file_path": drive_file['webViewLink'],
        "file_type": file.content_type,
        "size": len(file_content),
        "project_id": project_id,
        "uploaded_at": get_current_timestamp(),
        "drive_file_id": drive_file['id']
    }
    
    response = supabase.table("files").insert(file_data).execute()
    if not response.data:
        # Attempt to delete the uploaded file if database insert fails
        drive_service.files().delete(fileId=drive_file['id']).execute()
        raise HTTPException(status_code=400, detail="Failed to create file record")
    
    return response.data[0]

#delete file
@app.delete("/files/{file_id}")
async def delete_file(file_id: str):
    # Get file info
    response = supabase.table("files").select("*").eq("id", file_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_info = response.data[0]
    
    # Delete from Google Drive
    if "drive_file_id" in file_info:
        try:
            drive_service = get_google_drive_service()
            drive_service.files().delete(fileId=file_info["drive_file_id"]).execute()
        except Exception as e:
            # Continue with deletion even if Drive removal fails
            pass
    
    # Delete from database
    response = supabase.table("files").delete().eq("id", file_id).execute()
    return {"message": "File deleted successfully"}

#get all employees
@app.get("/employees", response_model=List[EmployeeBase])
async def get_employees():
    response = supabase.table("employees").select("*").execute()
    if response.data is None:
        return []
    return response.data

#add employee
@app.post("/employees", response_model=EmployeeBase)
async def add_employee(employee: EmployeeBase):
    employee_data = employee.dict()
    response = supabase.table("employees").insert(employee_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to add employee")
    return response.data[0]

#delete employee
@app.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str):
    response = supabase.table("employees").delete().eq("id", employee_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to delete employee")
    return {"message": "Employee deleted successfully"}

#update employee
@app.put("/employees/{employee_id}", response_model=EmployeeBase)
async def update_employee(employee_id: str, employee: EmployeeBase):
    employee_data = employee.dict(exclude_unset=True)
    response = supabase.table("employees").update(employee_data).eq("id", employee_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update employee")
    return response.data[0]

# Run the application with uvicorn
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port) 