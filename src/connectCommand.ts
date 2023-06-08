import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as minio from 'minio';

export function connectCommand() {
    const workspaceConfig = vscode.workspace.getConfiguration();

    const MINIO_ENDPOINT = workspaceConfig.get('minio-vscode.minioEndpoint', '');
    const MINIO_ACCESS_KEY = workspaceConfig.get('minio-vscode.minioAccessKey', '');
    const MINIO_SECRET_KEY = workspaceConfig.get('minio-vscode.minioSecretKey', '');
    const MINIO_BUCKET_NAME = workspaceConfig.get('minio-vscode.minioBucketName', '');

    // Validate that all parameters are defined
    if (!MINIO_ENDPOINT || !MINIO_ACCESS_KEY || !MINIO_SECRET_KEY || !MINIO_BUCKET_NAME) {
        vscode.window.showErrorMessage('All required parameters (MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET_NAME) were set workspace settings.');
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
}
