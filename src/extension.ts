import * as vscode from 'vscode';
import * as minio from 'minio';
import { connectCommand } from './connectCommand';

import { MinioFileSystemProvider } from './MinioFileSystemProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "minio-vscode" is now active!');

	let minioClient: minio.Client | undefined;
	let bucketName: string | undefined;
	let minioFileSystemProvider: MinioFileSystemProvider | undefined;



	const connectDisposable = vscode.commands.registerCommand('minio-vscode.connectCommand', async () => {
		const connectResult = connectCommand();

		if (!connectResult) {
			vscode.window.showErrorMessage('Could not connect to MinIO server, please check credentials!');
			return;
		}

		minioClient = connectResult?.minioClient;
		bucketName = connectResult?.MINIO_BUCKET_NAME;

		minioFileSystemProvider = new MinioFileSystemProvider(minioClient);

		const bucketExists = await minioFileSystemProvider.checkBucket(bucketName);

		if(!bucketExists) {
			return vscode.window.showErrorMessage(`Could not connect to ${bucketName}. Please check your credentials and try again.`);
		};

		vscode.window.showInformationMessage(`Successfully connected to ${bucketName}.`);

		const fileSystemRegistration = vscode.workspace.registerFileSystemProvider('minio', minioFileSystemProvider, { isCaseSensitive: true });
		context.subscriptions.push(fileSystemRegistration);

		const minioBucketUri = vscode.Uri.parse(`minio://${bucketName}/`);
		vscode.workspace.updateWorkspaceFolders(1, null, { uri: minioBucketUri, name: `minio://${bucketName}` });

		vscode.window.showInformationMessage('Connected to MinIO server.');

	});

	context.subscriptions.push(connectDisposable);

	if(vscode.workspace.workspaceFolders?.some((folder) => folder.uri.scheme === 'minio')) {
		vscode.commands.executeCommand('minio-vscode.connectCommand');
	}}

export function deactivate() { }