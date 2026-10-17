import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

type SpeechBubbleProps = {
    text: string;
};

export function SpeechBubble({ text }: SpeechBubbleProps) {
    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                <Text style={styles.text}>{text}</Text>
            </View>
            <View style={styles.tail} />
        </View>
    );
}

const tail_Height = 14;
const tail_Width = 18;

const styles = StyleSheet.create({
    container: { 
        alignItems: 'flex-end' 
    },
    bubble: {
        backgroundColor: colors.speechBubble,
        borderRadius: radius.lg,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    text: { ...typography.bubble, color: colors.speechBubbleText },
    tail: {
        width: 0,
        height: 0,
        marginRight: 15,
        marginTop: -1,
        borderTopWidth: tail_Height,
        borderLeftColor: 'transparent',
        borderRightWidth: 0,
        borderLeftWidth: tail_Width,
        borderTopColor: colors.speechBubble,
    },
});


