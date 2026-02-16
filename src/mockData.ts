// Mock Data for TaskFlow Pro
// Designed to be easily swapped for a real backend (Firebase/Supabase)

import type { User, Task, Project } from './types';

export const mockUsers: User[] = [
    {
        id: 'user-1',
        username: 'Admin User',
        role: 'Admin',
        permissions: ['View', 'Edit', 'Settings'],
        color: '#6366f1' // Indigo
    },
    {
        id: 'user-2',
        username: 'Sarah Moderator',
        role: 'Moderator',
        permissions: ['View', 'Edit'],
        color: '#8b5cf6' // Violet
    },
    {
        id: 'user-3',
        username: 'John Developer',
        role: 'User',
        permissions: ['View'],
        color: '#06b6d4' // Cyan
    },
    {
        id: 'user-4',
        username: 'Emily Designer',
        role: 'User',
        permissions: ['View', 'Edit'],
        color: '#f43f5e' // Rose
    }
];

export const mockProjects: Project[] = [
    { id: 'proj-general', name: 'Genel' },
    { id: 'proj-marketing', name: 'Marketing' },
    { id: 'proj-development', name: 'Development' },
    { id: 'proj-design', name: 'Design' }
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

export const mockTasks: Task[] = [
    {
        id: 'task-1',
        title: 'Review Q4 marketing strategy',
        description: 'Analyze the current marketing approach and suggest improvements.',
        status: 'OFF',
        priority: 'high',
        deadline: tomorrow.toISOString(),
        groupId: 'proj-marketing',
        assignedTo: ['user-1', 'user-2'],
        subtasks: [
            { id: 'sub-1', text: 'Gather analytics data', completed: true },
            { id: 'sub-2', text: 'Create presentation', completed: false }
        ],
        files: [],
        comments: []
    },
    {
        id: 'task-2',
        title: 'Fix login page responsive issues',
        description: 'The login page breaks on mobile devices.',
        status: 'OFF',
        priority: 'medium',
        deadline: today.toISOString(),
        groupId: 'proj-development',
        assignedTo: ['user-3'],
        subtasks: [],
        files: [],
        comments: [
            { userId: 'user-1', text: 'Check Safari as well', timestamp: Date.now() - 3600000 }
        ]
    },
    {
        id: 'task-3',
        title: 'Design new onboarding flow',
        description: 'Create mockups for the new user onboarding experience.',
        status: 'DONE',
        priority: 'high',
        deadline: yesterday.toISOString(),
        groupId: 'proj-design',
        assignedTo: ['user-4'],
        subtasks: [
            { id: 'sub-3', text: 'Research competitors', completed: true },
            { id: 'sub-4', text: 'Create wireframes', completed: true },
            { id: 'sub-5', text: 'Build high-fidelity mockups', completed: true }
        ],
        files: [],
        comments: []
    },
    {
        id: 'task-4',
        title: 'Update team meeting notes',
        description: 'Document decisions from weekly standup.',
        status: 'OFF',
        priority: 'low',
        deadline: today.toISOString(),
        groupId: 'proj-general',
        assignedTo: ['user-2'],
        subtasks: [],
        files: [],
        comments: []
    },
    {
        id: 'task-5',
        title: 'Prepare client presentation',
        description: 'Finalize slides for the upcoming client meeting.',
        status: 'OFF',
        priority: 'high',
        deadline: twoDaysAgo.toISOString(),
        groupId: 'proj-marketing',
        assignedTo: ['user-1'],
        subtasks: [],
        files: [],
        comments: []
    }
];

// Helper to get current user (default to admin)
export const getCurrentUser = (): User => mockUsers[0];
