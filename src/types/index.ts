export type Theme = 'light' | 'dark' | 'system';

export interface User {
    id: string;
    name: string;
    avatar: string;
    role: string; // Custom roles allowed
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
}

export interface ServicePlan {
    id: string;
    date: string;
    title: string;
    leaderId: string;
    items: PlanItem[];
}

export interface TeamMember extends User {
    availability: Record<string, 'available' | 'unavailable' | 'maybe'>; // date string key
}
