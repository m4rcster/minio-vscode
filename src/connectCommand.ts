import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as minio from 'minio';

export function connectCommand() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const rootPath = workspaceFolders && workspaceFolders[0] ? workspaceFolders[0].uri.fsPath : '';
    const dotenvFilePath = path.join(rootPath, '.env');

    if (fs.existsSync(dotenvFilePath)) {
        const { parsed: envConfig } = dotenv.config({ path: dotenvFilePath });

        const MINIO_ENDPOINT = envConfig?.MINIO_ENDPOINT;
        const MINIO_ACCESS_KEY = envConfig?.MINIO_ACCESS_KEY;
        const MINIO_SECRET_KEY = envConfig?.MINIO_SECRET_KEY;
        const MINIO_BUCKET_NAME = envConfig?.MINIO_BUCKET_NAME;

        // Validate that all parameters are defined
        if (!MINIO_ENDPOINT || !MINIO_ACCESS_KEY || !MINIO_SECRET_KEY || !MINIO_BUCKET_NAME) {
            vscode.window.showErrorMessage('All required parameters (MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET_NAME) were not found in .env file.');
            return null;
        }

        vscode.window.showInformationMessage(`Endpoint: ${MINIO_ENDPOINT}, Access Key: ${MINIO_ACCESS_KEY}, Secret Key: ${MINIO_SECRET_KEY}, Bucket Name: ${MINIO_BUCKET_NAME}`);
        
        const minioClient = new minio.Client({
            endPoint: MINIO_ENDPOINT,
            accessKey: MINIO_ACCESS_KEY,
            secretKey: MINIO_SECRET_KEY
        })

        return {
            minioClient,
            MINIO_BUCKET_NAME
        }

    } else {
        vscode.window.showErrorMessage('.env file not found in workspace.');
        return null;
    }
}
