// Core Data Models for TaskFlow Pro
// Based on Section 2 of the handover specification

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'OFF' | 'DONE';
export type ViewType = 'home' | 'calendar' | 'users' | 'settings';

export interface User {
    id: string;
    username: string;
    role: 'Admin' | 'Moderator' | 'User';
    permissions: string[]; // Fixed by role: Admin(Settings/Edit/View), Moderator(Edit/View), User(View)
    color: string; // Hex code for avatars
    avatarUrl?: string;
    password?: string;
}

export interface Attachment {
    name: string;
    url: string;
    type: string;
}

export interface Comment {
    userId: string;
    text: string;
    timestamp: number;
    file?: Attachment;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    deadline: string; // ISO Date
    groupId: string; // Project ID
    assignedTo: string[]; // Array of User IDs
    subtasks: { id: string; text: string; completed: boolean }[];
    files: Attachment[];
    comments: Comment[];
}

export interface Project {
    id: string;
    name: string;
}
