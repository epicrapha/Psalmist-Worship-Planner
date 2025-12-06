export type Theme = 'light' | 'dark' | 'system';

export interface RoleGroup {
    id: string;
    name: string;
    color: string;
    icon: string;
    order: number;
}

export interface RoleDefinition {
    id: string;
    name: string;
    color: string;
    icon: string; // Lucide icon name
    order: number;
    permissions: string[];
    groupId?: string;
}

export interface Team {
    id: string;
    name: string;
    icon: string;
    color: string;
    members: TeamMember[];
    roles: RoleDefinition[];
    roleGroups: RoleGroup[];
    admins: string[]; // User IDs
    plans: ServicePlan[];
    songs: Song[];
    venues: string[];
    customTags: string[];
}

export interface User {
    id: string;
    name: string;
    avatar: string;
    email?: string;
    roles: string[]; // Array of RoleDefinition IDs or names
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    key: string;
    bpm: number;
    tags: string[];
    lyrics: string;
    chords: string;
    youtubeLink?: string;
    spotifyLink?: string;
    driveLink?: string;
}

export interface PlanItem {
    id: string;
    type: 'song' | 'reading' | 'media';
    itemId?: string;
    title: string;
    duration: number; // in seconds
    notes?: string;
    description?: string;
    icon?: string; // Lucide icon name
    color?: string; // Tailwind class or hex
    assignees?: string[]; // List of Member IDs
}

export interface PlanTeamMember {
    memberId: string;
    role: string; // Role name/ID for this specific event
}

export interface ServicePlan {
    id: string;
    date: string;
    title: string;
    leaderId: string;
    items: PlanItem[];
    team: PlanTeamMember[];
    icon?: string; // Lucide icon name
    color?: string; // Tailwind class or hex
    isArchived?: boolean;
}

export interface TeamMember extends User {
    availability: Record<string, 'available' | 'unavailable' | 'maybe'>; // date string key
}
