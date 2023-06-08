import * as vscode from 'vscode';
import * as path from 'path';
import { Client as MinioClient, CopyConditions } from 'minio';
import { log } from 'console';

export class MinioFileSystemProvider implements vscode.FileSystemProvider {
    private emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this.emitter.event;

    constructor(private minioClient: MinioClient) { }

    watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[]; }): vscode.Disposable {
        return new vscode.Disposable(() => { });
    }

    stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat> {
        return this._stat(uri);
    }

    readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
        return this._readDirectory(uri);
    }

    createDirectory(uri: vscode.Uri): void | Thenable<void> {
        // Not implemented
    }

    readFile(uri: vscode.Uri): Uint8Array | Thenable<Uint8Array> {
        return this._readFile(uri);
    }

    writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): void | Thenable<void> {
        return this._writeFile(uri, content, options);
    }

    delete(uri: vscode.Uri, options: { recursive: boolean; }): void | Thenable<void> {
        const bucketName = uri.authority;
        const objectName = uri.path.slice(1);

        if (options && options.recursive) {
            return this._deleteDirectoryRecursive(bucketName, objectName);
        } else {
            return this._deleteObject(bucketName, objectName);
        }
    }

    rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): void | Thenable<void> {
        return this._rename(oldUri, newUri, options);
    }

    async checkBucket(bucketName: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.minioClient.bucketExists(bucketName, (err, exists) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(exists);
                }
            });
        });
    }

    private _stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        const bucketName = uri.authority;
        const objectName = uri.path.substring(1); // Remove the leading slash

        // If the object name is empty, it means we're trying to stat the bucket
        if (objectName === '') {
            return new Promise<vscode.FileStat>((resolve, reject) => {
                resolve({ type: vscode.FileType.Directory, ctime: Date.now(), mtime: Date.now(), size: 0 });
            });
        }

        return new Promise<vscode.FileStat>((resolve, reject) => {
            this.minioClient.statObject(bucketName, objectName, (err, stat) => {
                if (err) {
                    let isDirectory = path.extname(objectName) === '';

                    if (!isDirectory) {
                        return reject(err);
                    } else {
                        return resolve({ type: vscode.FileType.Directory, ctime: Date.now(), mtime: Date.now(), size: 0 });
                    }
                }
                resolve({ type: vscode.FileType.File, ctime: stat.metaData['last-modified'], mtime: stat.metaData['last-modified'], size: stat.size });
            });
        });
    }

    private async _readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
        const bucket = uri.authority;
        const prefix = uri.path.substring(1); // Remove the leading slash

        return new Promise<[string, vscode.FileType][]>((resolve, reject) => {
            const children: [string, vscode.FileType][] = [];

            const stream = this.minioClient.listObjects(bucket, prefix + '/', false);
            stream.on('data', (obj) => {
                const isDirectory: boolean = obj.prefix ? true : false;
                const filePath = isDirectory ? obj.prefix.substring(prefix.length) : obj.name.substring(prefix.length);
                const type = isDirectory ? vscode.FileType.Directory : vscode.FileType.File;

                children.push([filePath, type]);
            });

            stream.on('error', (err) => { reject(err); });

            stream.on('end', () => {
                resolve(children);
            });
        });
    }

    private async _readFile(uri: vscode.Uri): Promise<Uint8Array> {
        const bucketName = uri.authority;
        const objectName = uri.path.slice(1);

        try {
            const dataStream = await this.minioClient.getObject(bucketName, objectName);
            const chunks: Uint8Array[] = [];
            return new Promise<Uint8Array>((resolve, reject) => {
                dataStream.on('data', (chunk) => chunks.push(chunk));
                dataStream.on('end', () => resolve(Buffer.concat(chunks)));
                dataStream.on('error', (error) => reject(error));
            });
        } catch (error) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
    }

    private async _writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): Promise<void> {
        const bucketName = uri.authority;
        const objectName = uri.path.slice(1);

        return new Promise<void>(async (resolve, reject) => {
            try {
                // Check if the file already exists and overwrite is not allowed
                if (!options.create && !options.overwrite) {
                    try {
                        await this.stat(uri);
                        throw vscode.FileSystemError.FileExists(uri);
                    } catch (error) {
                        // If stat throws an error, it means the file doesn't exist, so we can proceed with writing
                    }
                }

                await this.minioClient.putObject(bucketName, objectName, Buffer.from(content));

                this.emitter.fire([{ type: vscode.FileChangeType.Changed, uri }]);

                resolve();
            } catch (error) {
                reject(vscode.FileSystemError.Unavailable(uri));
            }
        });
    }

    private async _deleteObject(bucketName: string, objectName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(bucketName, objectName);
        } catch (error) {
            console.error(`Failed to delete object: ${objectName}`, error);
            throw error;
        }
    }

    private async _deleteDirectoryRecursive(bucketName: string, objectName: string): Promise<void> {
        try {
            const objects: any[] = [];

            await new Promise<void>((resolve, reject) => {
                const stream = this.minioClient.listObjectsV2(bucketName, objectName, true);

                stream.on('data', (obj) => objects.push(obj));
                stream.on('error', (error) => reject(error));
                stream.on('end', () => resolve());
            });

            const objectNames = objects.map((obj) => obj.name);

            await Promise.all(objectNames.map((name) => this._deleteObject(bucketName, name)));
        } catch (error) {
            console.error(`Failed to delete directory: ${objectName}`, error);
            throw error;
        }
    }

    private async _rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): Promise<void> {
        const oldBucketName = oldUri.authority;
        const oldObjectName = oldUri.path.slice(1);
        const newObjectName = newUri.path.slice(1);

        try {
            // Copy the object to the new name
            await this.minioClient.copyObject(oldBucketName, newObjectName, `${oldBucketName}/${oldObjectName}`, new CopyConditions());

            // Delete the old object
            await this.minioClient.removeObject(oldBucketName, oldObjectName);
        } catch (error) {
            console.error(`Failed to rename object: ${oldObjectName} to ${newObjectName}`, error);
            throw error;
        }
    }
}