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
    files: Optional[str] = None

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
    created_at: Optional[str] = None
    project_id: Optional[str] = None

class FileBase(BaseModel):
    id: Optional[str] = None
    title: str
    type: Optional[str] = None
    project_id: Optional[str] = None
    employee_id: Optional[str] = None
    note_id: Optional[str] = None
    event_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    size: Optional[str] = None

class EmployeeBase(BaseModel):
    id: Optional[str] = None
    name: str
    project_id: Optional[str] = None
    role: Optional[str] = None

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
    return response.data[0]

@app.post("/projects", response_model=ProjectBase)
async def create_project(project: ProjectBase):
    project_data = project.dict()
    
    if not project_data.get("id"):
        project_data["id"] = generate_id()
    
    now = get_current_timestamp()
    project_data["created_at"] = now
    
    response = supabase.table("projects").insert(project_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create project")
    
    return response.data[0]

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
    
    return response.data[0]

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
    return response.data[0]

@app.post("/tasks", response_model=TaskBase)
async def create_task(task: TaskBase):
    task_data = task.dict()
    
    if not task_data.get("id"):
        task_data["id"] = generate_id()
    
    now = get_current_timestamp()
    task_data["created_at"] = now
    
    response = supabase.table("tasks").insert(task_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create task")
    
    return response.data[0]

@app.put("/tasks/{task_id}")
async def update_task(task_id: str, task: Union[TaskBase, TaskStatusUpdate]):
    # Verify the task exists
    check_response = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_data = task.dict(exclude_unset=True)
    
    response = supabase.table("tasks").update(task_data).eq("id", task_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update task")
    
    return response.data[0]

@app.put("/tasks/{task_id}/status")
async def update_task_status(task_id: str, status: str):
    # Verify the task exists
    check_response = supabase.table("tasks").select("*").eq("id", task_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = {
        "status": status,
    }
    
    response = supabase.table("tasks").update(update_data).eq("id", task_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update task status")
    
    return response.data[0]

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
    
    response = query.execute()
    if response.data is None:
        return []
    return response.data

@app.get("/notes/{note_id}", response_model=NoteBase)
async def get_note(note_id: str):
    response = supabase.table("notes").select("*").eq("id", note_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Note not found")
    return response.data[0]

@app.post("/notes", response_model=NoteBase)
async def create_note(note: NoteBase):
    note_data = note.dict()
    
    if not note_data.get("id"):
        note_data["id"] = generate_id()
    
    now = get_current_timestamp()
    note_data["created_at"] = now
    
    response = supabase.table("notes").insert(note_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create note")
    
    return response.data[0]

@app.put("/notes/{note_id}", response_model=NoteBase)
async def update_note(note_id: str, note: NoteBase):
    # Verify the note exists
    check_response = supabase.table("notes").select("*").eq("id", note_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Note not found")
    
    note_data = note.dict(exclude_unset=True)
    
    response = supabase.table("notes").update(note_data).eq("id", note_id).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update note")
    
    return response.data[0]

@app.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    # Verify the note exists
    check_response = supabase.table("notes").select("*").eq("id", note_id).execute()
    if not check_response.data:
        raise HTTPException(status_code=404, detail="Note not found")
    
    response = supabase.table("notes").delete().eq("id", note_id).execute()
    return {"message": "Note deleted successfully"}

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
    return response.data[0]

@app.post("/events", response_model=EventBase)
async def create_event(event: EventBase):
    event_data = event.dict()
    
    if not event_data.get("id"):
        event_data["id"] = generate_id()
    
    event_data = convert_datetime_to_string(event_data)
    
    response = supabase.table("events").insert(event_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create event")
    
    return response.data[0]

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
    
    return response.data[0]

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
    return response.data[0]

@app.post("/reminders", response_model=ReminderBase)
async def create_reminder(reminder: ReminderBase):
    reminder_data = reminder.dict()
    
    if not reminder_data.get("id"):
        reminder_data["id"] = generate_id()
    
    now = get_current_timestamp()
    reminder_data["created_at"] = now
    
    response = supabase.table("reminders").insert(reminder_data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create reminder")
    
    return response.data[0]

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
    
    return response.data[0]

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
    return response.data[0]

@app.post("/files")
async def upload_file(file: FileBase):
    file_data = file.dict()
    file_data["id"] = generate_id()
    response = supabase.table("files").insert(file_data).execute()
    return response.data[0]

@app.delete("/files/{file_id}")
async def delete_file(file_id: str):
    # Get file info
    check_response = supabase.table("files").delete("*").eq("id", file_id).execute()
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
    return response.data[0]

# Create employee
@app.post("/employees", response_model=EmployeeBase)
async def create_employee(employee: EmployeeBase):
    response = supabase.table("employees").insert(employee.dict()).execute()
    return response.data[0]

# Update employee
@app.put("/employees/{employee_id}", response_model=EmployeeBase)
async def update_employee(employee_id: str, employee: EmployeeBase):
    response = supabase.table("employees").update(employee.dict()).eq("id", employee_id).execute()
    return response.data[0]

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