import type { User } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

interface SupabaseUserRow {
    id: string;
    username: string;
    role: User['role'];
    permissions: string[];
    color: string;
    avatar_url: string | null;
    password: string | null;
}

const USERS_TABLE = 'users';

const fromSupabaseRow = (row: SupabaseUserRow): User => ({
    id: row.id,
    username: row.username,
    role: row.role,
    permissions: row.permissions,
    color: row.color,
    avatarUrl: row.avatar_url ?? undefined,
    password: row.password ?? undefined,
});

const toSupabaseRow = (user: User): SupabaseUserRow => ({
    id: user.id,
    username: user.username,
    role: user.role,
    permissions: user.permissions,
    color: user.color,
    avatar_url: user.avatarUrl ?? null,
    password: user.password ?? null,
});

const ensureConfigured = () => {
    if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    return supabase;
};

export const createUserInSupabase = async (user: User) => {
    const client = ensureConfigured();
    const { error } = await client.from(USERS_TABLE).insert(toSupabaseRow(user));
    if (error) throw error;
};

export const getUsersFromSupabase = async (): Promise<User[]> => {
    const client = ensureConfigured();
    const { data, error } = await client
        .from(USERS_TABLE)
        .select('id, username, role, permissions, color, avatar_url, password')
        .order('username', { ascending: true });

    if (error) throw error;

    return (data as SupabaseUserRow[] | null)?.map(fromSupabaseRow) ?? [];
};

export const updateUserInSupabase = async (user: User) => {
    const client = ensureConfigured();
    const { error } = await client
        .from(USERS_TABLE)
        .update(toSupabaseRow(user))
        .eq('id', user.id);

    if (error) throw error;
};

export const deleteUserFromSupabase = async (userId: string) => {
    const client = ensureConfigured();
    const { error } = await client.from(USERS_TABLE).delete().eq('id', userId);
    if (error) throw error;
};
