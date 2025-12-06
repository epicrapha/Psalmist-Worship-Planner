
export interface ChordLine {
    words: string[];
    chords: string[];
}

export function parseChordPro(input: string): ChordLine[] {
    const lines = input.split('\n');
    const result: ChordLine[] = [];

    for (const line of lines) {
        if (!line.trim()) {
            result.push({ words: [], chords: [] });
            continue;
        }

        // Check for directives (e.g., {title: ...}, {c: Chorus})
        if (line.trim().startsWith('{')) {
            // Treat comment directives as special lines or just text for now
            // For simplicity, we might just strip directives or show them as text
            // Let's stripping meta directives but keeping comments/headers
            if (line.includes('{c:') || line.includes('{comment:') || line.includes('{soc}') || line.includes('{eoc}')) {
                // Format: {c: Chorus} -> [Chorus]
                const content = line.replace(/\{(?:c|comment|soc|eoc)(?::\s*(.*))?\}/i, '$1');
                // Only add if it's not a directive we want to hide entirely
                if (!line.toLowerCase().includes('{title') && !line.toLowerCase().includes('{artist')) {
                    result.push({ words: [content || (line.includes('soc') ? 'Chorus' : '')], chords: [] });
                }
            }
            continue;
        }

        // This is a simplified parser. 
        // Real ChordPro puts chords inline: "Amazing [G]Grace how [C]sweet the [G]sound"

        // We will split by chords.
        // For each segment: [Chord]Text

        const parts = line.split(/(\[[^\]]+\])/);

        let lineText = '';

        for (const part of parts) {
            if (part.startsWith('[') && part.endsWith(']')) {
                // unused logic in this skeletal function
            } else {
                lineText += part;
            }
        }

        // Now valid, how do we represent this?
        // We probably want to return a structure that can be rendered.
        // Let's refine the return type for easier React rendering:
        // Segment { text: string, chord?: string }
        // "Amazing " (no chord), "Grace how " (G), "sweet the " (C), "sound" (G)
        // Wait, "Amazing [G]Grace" means G starts at Grace.

    }
    return result;
}

// Better approach for React rendering:
export interface SongSegment {
    text: string;
    chord?: string;
}

export interface SongLine {
    segments: SongSegment[];
    type: 'lyric' | 'header' | 'empty';
}

export function parseChordProToSegments(input: string): SongLine[] {
    const lines = input.split('\n');
    const result: SongLine[] = [];

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            result.push({ segments: [], type: 'empty' });
            continue;
        }

        // Headers like [Chorus], [Verse 1] (Common in text tabs, not strict ChordPro but good to support)
        // Or ChordPro directives {c: Chorus}
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            const lower = trimmed.toLowerCase();
            let content = trimmed.substring(1, trimmed.length - 1);

            if (lower.startsWith('c:') || lower.startsWith('comment:')) {
                content = content.replace(/^(?:c|comment):\s*/i, '');
                result.push({ segments: [{ text: content }], type: 'header' });
            } else if (lower === 'soc' || lower === 'start_of_chorus') {
                result.push({ segments: [{ text: 'Chorus' }], type: 'header' });
            }
            // Ignore other directives for now
            continue;
        }

        // If line is just "Chorus:" or "[Chorus]" (common text format)
        if (/^(?:\[?)(?:Chorus|Verse|Bridge|Intro|Outro)(?:.*)(?:\]?):?$/i.test(trimmed)) {
            result.push({ segments: [{ text: trimmed.replace(/[\[\]:]/g, '') }], type: 'header' });
            continue;
        }

        const segments: SongSegment[] = [];
        const parts = line.split(/(\[[^\]]+\])/);

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part.startsWith('[') && part.endsWith(']')) {
                // It's a chord, it belongs to the NEXT text part
                const chord = part.substring(1, part.length - 1);
                const nextText = parts[i + 1] || ''; // The text immediately following the chord
                segments.push({ text: nextText, chord });
                i++; // Skip next text part as we handled it
            } else if (part) {
                // It's text without a preceding chord (beginning of line)
                segments.push({ text: part });
            }
        }

        if (segments.length > 0) {
            result.push({ segments, type: 'lyric' });
        }
    }

    return result;
}
