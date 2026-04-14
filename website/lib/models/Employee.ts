export interface Employee {
    id?: string;
    username: string;
    password: string; // Stored as plain text for now as per user request for "internal ultra-simple"
    name: string;
    role: 'admin' | 'editor';
    createdAt?: any;
    lastLogin?: any;
}
