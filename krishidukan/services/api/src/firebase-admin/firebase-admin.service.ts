import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: admin.app.App;

  onModuleInit() {
    if (admin.apps.length === 0) {
      const credPath = process.env['GOOGLE_APPLICATION_CREDENTIALS'];
      const projectId = process.env['FIREBASE_PROJECT_ID'];

      this.app = admin.initializeApp({
        credential: credPath
          ? admin.credential.cert(credPath)
          : admin.credential.applicationDefault(),
        projectId,
        storageBucket: process.env['FIREBASE_STORAGE_BUCKET'],
      });
      this.logger.log(`Firebase Admin initialized for project: ${projectId}`);
    } else {
      this.app = admin.apps[0]!;
    }
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return this.app.auth().verifyIdToken(idToken);
  }

  async getSignedStorageUrl(filePath: string, expiresMs: number): Promise<string> {
    const bucket = this.app.storage().bucket();
    const file = bucket.file(filePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresMs,
    });
    return url;
  }

  async uploadBuffer(
    buffer: Buffer,
    mimeType: string,
    storagePath: string,
  ): Promise<string> {
    const bucket = this.app.storage().bucket();
    const file = bucket.file(storagePath);
    await file.save(buffer, {
      metadata: { contentType: mimeType },
      resumable: false,
    });
    return storagePath;
  }

  async deleteFile(storagePath: string): Promise<void> {
    const bucket = this.app.storage().bucket();
    await bucket.file(storagePath).delete({ ignoreNotFound: true });
  }
}
