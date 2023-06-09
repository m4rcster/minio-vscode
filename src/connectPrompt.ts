import * as vscode from 'vscode';

export async function setMinioParametersInWorkspace() {
    /* Implementation not used as it's not safe to store credentials in workspace settings */
    /*
        //file: extension.ts
        let connectPromptDisposable = vscode.commands.registerCommand('minio-vscode.setMinioParameters', () => {
            setMinioParametersInWorkspace();
        });
        context.subscriptions.push(connectPromptDisposable);
        // package.json
        "commands": [{
            "command": "minio-vscode.setMinioParameters",
            "title": "Set MinIO connection parameters"
            }],
        "configuration": {
            "title": "MinIO",
            "properties": {
                "minio-vscode.minioEndpoint": {
                "type": "string",
                "default": "",
                "description": "Minio Endpoint URL"
                },
                "minio-vscode.minioAccessKey": {
                "type": "string",
                "default": "",
                "description": "Minio Access Key"
                },
                "minio-vscode.minioSecretKey": {
                "type": "string",
                "default": "",
                "description": "Minio Secret Key"
                },
                "minio-vscode.minioBucketName": {
                "type": "string",
                "default": "",
                "description": "Minio Bucket Name"
                }
            }
        }
    */
    /*
    const workspaceConfig = vscode.workspace.getConfiguration();

    const existingEndpoint = workspaceConfig.get('minio-vscode.minioEndpoint', '');
    const existingAccessKey = workspaceConfig.get('minio-vscode.minioAccessKey', '');
    const existingSecretKey = workspaceConfig.get('minio-vscode.minioSecretKey', '');
    const existingBucketName = workspaceConfig.get('minio-vscode.minioBucketName', '');

    const minioEndpoint = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        prompt: 'Enter Minio Endpoint',
        placeHolder: 'e.g., http://minio.example.com',
        value: existingEndpoint,
    });

    const minioAccessKey = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        prompt: 'Enter Minio Access Key',
        placeHolder: 'e.g., your-access-key',
        value: existingAccessKey,
    });

    const minioSecretKey = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        prompt: 'Enter Minio Secret Key',
        placeHolder: 'e.g., your-secret-key',
        password: true,
        value: existingSecretKey,
    });

    const minioBucketName = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        prompt: 'Enter Minio Bucket Name',
        placeHolder: 'e.g., your-bucket-name',
        value: existingBucketName,
    });

    if (minioEndpoint && minioAccessKey && minioSecretKey && minioBucketName) {
        workspaceConfig.update('minio-vscode.minioEndpoint', minioEndpoint, vscode.ConfigurationTarget.Workspace);
        workspaceConfig.update('minio-vscode.minioAccessKey', minioAccessKey, vscode.ConfigurationTarget.Workspace);
        workspaceConfig.update('minio-vscode.minioSecretKey', minioSecretKey, vscode.ConfigurationTarget.Workspace);
        workspaceConfig.update('minio-vscode.minioBucketName', minioBucketName, vscode.ConfigurationTarget.Workspace);
        

        vscode.window.showInformationMessage('MinIO parameters saved successfully.');
        vscode.commands.executeCommand('minio-vscode.connectCommand');
    } else {
        vscode.window.showErrorMessage('Please fill in all input fields.');
    }
    */
}