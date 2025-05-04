from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import pickle
import os
import io

# Define the scopes
SCOPES = ['https://www.googleapis.com/auth/drive']

def authenticate():
    """Authenticate with Google Drive API"""
    creds = None
    
    # Check if token.pickle exists
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    # If there are no valid credentials, let the user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save the credentials for next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    
    return build('drive', 'v3', credentials=creds)

def upload_file(service, file_path, folder_id=None):
    """Upload a file to Google Drive
    
    Args:
        service: Authenticated Google Drive service instance
        file_path: Path of the file to upload
        folder_id: ID of the folder to upload to (None for root folder)
        
    Returns:
        Uploaded file ID
    """
    file_metadata = {
        'name': os.path.basename(file_path)
    }
    
    # If folder_id is provided, set the parent folder
    if folder_id:
        file_metadata['parents'] = [folder_id]
    
    # Create media
    media = MediaFileUpload(file_path, resumable=True)
    
    # Upload the file
    file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()
    
    print(f"File '{os.path.basename(file_path)}' uploaded with ID: {file.get('id')}")
    return file.get('id')

def download_file(service, file_id, output_path):
    """Download a file from Google Drive
    
    Args:
        service: Authenticated Google Drive service instance
        file_id: ID of the file to download
        output_path: Path to save the downloaded file
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Get file metadata to get the name
        file_metadata = service.files().get(fileId=file_id).execute()
        file_name = file_metadata.get('name')
        
        # Create request to download file
        request = service.files().get_media(fileId=file_id)
        
        # Download the file
        with io.FileIO(output_path or file_name, 'wb') as fh:
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                status, done = downloader.next_chunk()
                print(f"Download {int(status.progress() * 100)}%")
        
        print(f"File downloaded to: {output_path or file_name}")
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

def list_files(service, folder_id=None, query=None):
    """List files in Google Drive folder
    
    Args:
        service: Authenticated Google Drive service instance
        folder_id: ID of the folder to list files from (None for root)
        query: Additional query parameters
        
    Returns:
        List of files
    """
    q = ""
    
    # If folder_id is provided, set the parent folder query
    if folder_id:
        q += f"'{folder_id}' in parents"
    
    # Add custom query if provided
    if query:
        if q:
            q += " and "
        q += query
    
    # List files
    results = service.files().list(
        q=q,
        pageSize=100,
        fields="nextPageToken, files(id, name, mimeType, size, modifiedTime)"
    ).execute()
    
    return results.get('files', [])

def main():
    """Main function to demonstrate usage"""
    service = authenticate()
    
    while True:
        print("\nGoogle Drive API Menu:")
        print("1. List files")
        print("2. Upload a file")
        print("3. Download a file")
        print("4. Exit")
        
        choice = input("Enter your choice (1-4): ")
        
        if choice == '1':
            folder_id = input("Enter folder ID (leave empty for root): ").strip() or None
            print("Files:")
            files = list_files(service, folder_id)
            for file in files:
                print(f"{file['name']} ({file['id']}) - {file.get('mimeType')}")
            
        elif choice == '2':
            file_path = input("Enter the path of the file to upload: ")
            folder_id = input("Enter folder ID (leave empty for root): ").strip() or None
            if os.path.exists(file_path):
                upload_file(service, file_path, folder_id)
            else:
                print(f"File not found: {file_path}")
            
        elif choice == '3':
            file_id = input("Enter the ID of the file to download: ")
            output_path = input("Enter the path to save the file: ")
            download_file(service, file_id, output_path)
            
        elif choice == '4':
            print("Exiting program.")
            break
            
        else:
            print("Invalid choice. Please enter a number between 1 and 4.")

if __name__ == '__main__':
    main()