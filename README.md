# MinIO S3 Explorer (VSCODE)

This extension allows to connect with a MinIO S3 bucket to explore, view, edit and create files and folders.

## Features

- Define your MinIO parameters in `.env` file at the root project workspace.
```
MINIO_ENDPOINT=some.minio.endpoint
MINIO_ACCESS_KEY=access_key
MINIO_SECRET_KEY=secret_key
MINIO_BUCKET_NAME=bucket_name
```
- Call `Connect to MinIO Bucket defined in .env file`
- Now a new workspace folder is created that is connected to your MinIO bucket
- View, Edit, and Create files

> Tip: folders are not supported by minio, you will need to create a file within the folder for it to persits

## Requirements

None

## Extension Settings

