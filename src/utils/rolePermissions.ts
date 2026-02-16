import type { User } from '../types';

export const getRolePermissions = (role: User['role']): string[] => {
    if (role === 'Admin') return ['Settings', 'Edit', 'View'];
    if (role === 'Moderator') return ['Edit', 'View'];
    return ['View'];
};
