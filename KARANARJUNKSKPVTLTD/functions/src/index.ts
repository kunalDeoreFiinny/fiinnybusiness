import * as admin from 'firebase-admin';
admin.initializeApp();
export { karanArjunAIChat } from './karanArjunAI.js';
export { dailyFirestoreBackup, dailyMetrics } from './monitoring.js';