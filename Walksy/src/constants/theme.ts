export const colors = {
    background: '#FFFFFF',
    brand: '#CC4C09',
    brandText: '#FFFFFF',
    speechBubble: '#8E380B',
    speechBubbleText: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#707070',
    textMuted: '#9A9A9A',
    card: '#FFFFFF',
    border: '#555',
    borderCard: '#AEAEAE',
    error: '#C62828',
    sos: '#E5383B',
    onImage: '#FFFFFF', // text and icons drawn on top of photos
    divider: '#DDDDDD',
    badgeSoft: '#FBE3D6',
    tabInactive: '#555555',
    disabled: '#AFAFAF', // greyed-out buttons
    badgeMuted: '#E6E6E6',
    avatar: '#E2725B', // warm background behind profile initials
    softSurface: '#F7F2EE', // warm grey card background ("You said")
    star: '#FFC83D',
    progressTrack: '#E6E6E6',
    switchOn: '#34C759',
    switchOff: '#D1D1D6',
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const radius = {
    sm: 8,
    md: 12,
    lg: 20,
    bg: 24,
    pill: 999,
} as const;

export const typography = {
    title : { fontSize: 34, fontFamily: 'Fredoka_500Medium', letterSpacing: 0.5},
    subTitleFirst: { fontSize: 19, fontWeight: '600', lineHeight: 24 },
    subTitleSecondary: { fontSize: 14, fontWeight: '400', lineHeight: 22},
    heading: { fontSize: 22, fontWeight: '700'},
    body: { fontSize: 14, fontWeight: '400' },
    label: { fontSize: 16, fontWeight: '600' },
    input: { fontSize: 16, fontWeight: '400' },
    consent: { fontSize: 14, fontWeight: '600', lineHeight: 22 },
    error: { fontSize: 13, fontWeight: '400' },
    logo: { fontSize: 32, fontFamily: 'Fredoka_500Medium' },
    cardTitle: { fontSize: 22, fontWeight: '600' },
    cardBody: { fontSize: 15, fontWeight: '400' },
    badge: { fontSize: 15, fontWeight: '600' },
    tile: { fontSize: 15, fontWeight: '700' },
    tabLabel: { fontSize: 14, fontWeight: '600' },
    listItem: { fontSize: 16, fontWeight: '700' },
    button: { fontSize:17, fontWeight: '700'},
    bubble: { fontSize: 17, fontWeight: '600'},
    screenTitle: { fontSize: 26, fontWeight: '700' },
    chip: { fontSize: 17, fontWeight: '600' },
    chat: { fontSize: 16, fontWeight: '400', lineHeight: 23 },
} as const;
