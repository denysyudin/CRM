# Project Management Backend

This is the backend API for the Project Management application.

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set up environment variables by creating a `.env` file with the following content:
   ```
   # Supabase credentials
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key

   # Google Drive API
   GOOGLE_DRIVE_SERVICE_ACCOUNT=path/to/your/service-account-credentials.json

   # Server settings
   PORT=8000
   HOST=0.0.0.0
   ```

3. Google Drive API Setup:
   - Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Google Drive API for your project
   - Create a Service Account:
     - Go to "IAM & Admin" > "Service Accounts"
     - Create a new service account
     - Grant it appropriate roles (at least "Drive File Creator")
     - Create and download a key in JSON format
   - Save the JSON key file in a secure location
   - Update the `GOOGLE_DRIVE_SERVICE_ACCOUNT` variable in your `.env` file with the path to the JSON key file

4. Run the application:
   ```
   python main.py
   ```

## API Documentation

The API provides endpoints for managing projects, tasks, notes, events, reminders, files, and employees.

### File Uploads

Files can be uploaded to Google Drive through the following endpoints:
- `/notes`: When creating or updating notes
- `/tasks`: When creating or updating tasks

When uploading files, the API will:
1. Check if the note or task is associated with a project
2. If yes: 
   - Look for a folder with the project name in Google Drive
   - Create the folder if it doesn't exist
   - Upload the file to that project folder
3. If no project is associated:
   - Upload the file to a "General" folder
4. Return the Google Drive file URL 