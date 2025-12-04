import { create } from 'zustand';
import type { Song, ServicePlan, TeamMember, User, RoleDefinition } from '../types';

interface Notification {
    id: string;
    message: string;
    type: 'assignment' | 'update' | 'info';
    timestamp: string;
    read: boolean;
}

interface AppState {
    user: User | null;
    songs: Song[];
    plans: ServicePlan[];
    team: TeamMember[];
    customRoles: RoleDefinition[];
    customTags: string[];
    venues: string[];
    notifications: Notification[];
    setUser: (user: User | null) => void;
    addSong: (song: Song) => void;
    updateSong: (id: string, song: Partial<Song>) => void;
    deleteSong: (id: string) => void;
    addPlan: (plan: ServicePlan) => void;
    updatePlan: (id: string, plan: Partial<ServicePlan>) => void;
    deletePlan: (id: string) => void;
    addTeamMember: (member: TeamMember) => void;
    updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
    deleteTeamMember: (id: string) => void;
    addCustomRole: (role: RoleDefinition) => void;
    updateCustomRole: (id: string, role: Partial<RoleDefinition>) => void;
    deleteCustomRole: (id: string) => void;
    reorderRoles: (roles: RoleDefinition[]) => void;
    addCustomTag: (tag: string) => void;
    updateCustomTag: (oldTag: string, newTag: string) => void;
    addVenue: (venue: string) => void;
    addNotification: (notification: Notification) => void;
    markNotificationRead: (id: string) => void;
    spotifyConnected: boolean;
    setSpotifyConnected: (connected: boolean) => void;
}

const MOCK_SONGS: Song[] = [
    {
        id: '1',
        title: 'Way Maker',
        artist: 'Sinach',
        key: 'E',
        bpm: 68,
        tags: ['Contemporary', 'Worship'],
        lyrics: "You are here moving in our midst\nI worship You I worship You\nYou are here working in this place\nI worship You I worship You\n\n[Chorus]\nWay Maker Miracle Worker Promise Keeper\nLight in the darkness my God that is who You are",
        chords: "E B C#m A",
        youtubeLink: "https://youtu.be/iJCV_2H9xD0"
    },
    {
        id: '2',
        title: '10,000 Reasons',
        artist: 'Matt Redman',
        key: 'G',
        bpm: 72,
        tags: ['Hymn', 'Contemporary'],
        lyrics: "Bless the Lord O my soul O my soul\nWorship His Holy name\nSing like never before O my soul\nI'll worship Your Holy name",
        chords: "C G D Em C G D",
    },
    {
        id: '3',
        title: 'Goodness of God',
        artist: 'Bethel Music',
        key: 'Ab',
        bpm: 63,
        tags: ['Worship'],
        lyrics: "I love You Lord\nFor Your mercy never fails me\nAll my days\nI've been held in Your hands",
        chords: "Ab Db Eb Fm",
    },
    {
        id: '4',
        title: 'Build My Life',
        artist: 'Housefires',
        key: 'G',
        bpm: 68,
        tags: ['Worship'],
        lyrics: "Worthy of every song we could ever sing\nWorthy of all the praise we could ever bring\nWorthy of every breath we could ever breathe\nWe live for You",
        chords: "G C Em D",
    },
    {
        id: '5',
        title: 'Great Are You Lord',
        artist: 'All Sons & Daughters',
        key: 'A',
        bpm: 72,
        tags: ['Worship'],
        lyrics: "You give life You are love\nYou bring light to the darkness\nYou give hope You restore every heart that is broken\nAnd great are You Lord",
        chords: "D F#m E",
    }
];

const MOCK_PLANS: ServicePlan[] = [
    {
        id: '1',
        date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        title: 'Sunday Service',
        leaderId: 'u1',
        items: [
            { id: 'p1', type: 'song', itemId: '1', title: 'Way Maker', duration: 300 },
            { id: 'p2', type: 'reading', title: 'Call to Worship', duration: 120 },
            { id: 'p3', type: 'song', itemId: '2', title: '10,000 Reasons', duration: 240 },
            { id: 'p4', type: 'media', title: 'Announcements Video', duration: 180 },
            { id: 'p5', type: 'song', itemId: '4', title: 'Build My Life', duration: 360 },
        ],
        team: [
            { memberId: 'u1', role: 'Worship Leader' },
            { memberId: 'u2', role: 'Vocalist' },
            { memberId: 'u3', role: 'Guitarist' },
            { memberId: 'u4', role: 'Drummer' }
        ]
    }
];

const DEFAULT_ROLES: RoleDefinition[] = [
    { id: 'admin', name: 'Admin', color: 'bg-red-500', icon: 'Shield', order: 0 },
    { id: 'leader', name: 'Worship Leader', color: 'bg-orange-500', icon: 'Mic2', order: 1 },
    { id: 'vocal', name: 'Vocalist', color: 'bg-pink-500', icon: 'Mic', order: 2 },
    { id: 'guitar', name: 'Guitarist', color: 'bg-blue-500', icon: 'Guitar', order: 3 },
    { id: 'keys', name: 'Keyboardist', color: 'bg-purple-500', icon: 'Piano', order: 4 },
    { id: 'drums', name: 'Drummer', color: 'bg-yellow-500', icon: 'Drum', order: 5 },
    { id: 'bass', name: 'Bassist', color: 'bg-indigo-500', icon: 'Music4', order: 6 },
    { id: 'media', name: 'Media', color: 'bg-green-500', icon: 'Monitor', order: 7 },
];

const MOCK_TEAM: TeamMember[] = [
    { id: 'u1', name: 'Raphael', avatar: 'https://i.pravatar.cc/150?u=u1', roles: ['Admin', 'Worship Leader'], availability: {} },
    { id: 'u2', name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=u2', roles: ['Worship Leader', 'Vocalist'], availability: {} },
    { id: 'u3', name: 'John', avatar: 'https://i.pravatar.cc/150?u=u3', roles: ['Guitarist'], availability: {} },
    { id: 'u4', name: 'Emily', avatar: 'https://i.pravatar.cc/150?u=u4', roles: ['Drummer'], availability: {} },
];

export const useAppStore = create<AppState>((set) => ({
    user: MOCK_TEAM[0],
    songs: MOCK_SONGS,
    plans: MOCK_PLANS,
    team: MOCK_TEAM,
    customRoles: DEFAULT_ROLES,
    customTags: ['Worship', 'Contemporary', 'Hymn', 'Fast', 'Slow', 'Intimate', 'Praise', 'Gospel'],
    venues: ['Main Sanctuary', 'Chapel', 'Youth Hall', 'Outdoor Pavilion'],
    notifications: [
        { id: 'n1', message: 'Admin assigned you as Worship Leader for Sunday Service', type: 'assignment', timestamp: new Date().toISOString(), read: false },
        { id: 'n2', message: 'Sarah added "Way Maker" to the song library', type: 'update', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
    ],
    setUser: (user) => set({ user }),
    addSong: (song) => set((state) => ({ songs: [...state.songs, song] })),
    updateSong: (id, song) => set((state) => ({
        songs: state.songs.map((s) => (s.id === id ? { ...s, ...song } : s))
    })),
    deleteSong: (id) => set((state) => ({
        songs: state.songs.filter((s) => s.id !== id)
    })),
    addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
    updatePlan: (id, plan) => set((state) => ({
        plans: state.plans.map((p) => (p.id === id ? { ...p, ...plan } : p))
    })),
    deletePlan: (id) => set((state) => ({
        plans: state.plans.filter((p) => p.id !== id)
    })),
    addTeamMember: (member) => set((state) => ({ team: [...state.team, member] })),
    updateTeamMember: (id, member) => set((state) => ({
        team: state.team.map((m) => (m.id === id ? { ...m, ...member } : m))
    })),
    deleteTeamMember: (id) => set((state) => ({
        team: state.team.filter((m) => m.id !== id)
    })),
    addCustomRole: (role) => set((state) => ({
        customRoles: [...state.customRoles, role]
    })),
    updateCustomRole: (id, role) => set((state) => ({
        customRoles: state.customRoles.map(r => r.id === id ? { ...r, ...role } : r)
    })),
    deleteCustomRole: (id) => set((state) => ({
        customRoles: state.customRoles.filter(r => r.id !== id)
    })),
    reorderRoles: (roles) => set({ customRoles: roles }),
    addCustomTag: (tag) => set((state) => ({
        customTags: state.customTags.includes(tag) ? state.customTags : [...state.customTags, tag]
    })),
    updateCustomTag: (oldTag, newTag) => set((state) => ({
        customTags: state.customTags.map(t => t === oldTag ? newTag : t)
    })),
    addVenue: (venue) => set((state) => ({
        venues: state.venues.includes(venue) ? state.venues : [...state.venues, venue]
    })),
    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications]
    })),
    markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    })),
    spotifyConnected: false,
    setSpotifyConnected: (connected) => set({ spotifyConnected: connected }),
}));

