import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors, typography } from '../../constants/theme';

export type DonutSegment = { key: string; value: number; color: string };

type DonutChartProps = {
    segments: DonutSegment[]; // drawn clockwise from the top, in this order
    centerValue: string;
    centerLabel: string;
    accessibilityLabel: string; // the whole chart in words (screen readers)
    size?: number;
    thickness?: number;
};

// white space between segments, so neighbouring colors never touch
const GAP = 2;

export function DonutChart({
    segments,
    centerValue,
    centerLabel,
    accessibilityLabel,
    size = 180,
    thickness = 44,
}: DonutChartProps) {
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    const visible = segments.filter((segment) => segment.value > 0);

    let offset = 0;
    const arcs = visible.map((segment) => {
        const length = (segment.value / total) * circumference;
        // one segment = a full ring, no gap needed
        const dash = visible.length > 1 ? Math.max(length - GAP, 1) : length;
        const arc = { ...segment, dash, offset };
        offset += length;
        return arc;
    });

    return (
        <View
            style={{ width: size, height: size }}
            accessible
            accessibilityRole="image"
            accessibilityLabel={accessibilityLabel}
        >
            <Svg width={size} height={size}>
                {/* start at 12 o'clock instead of 3 o'clock */}
                <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    {arcs.map((arc) => (
                        <Circle
                            key={arc.key}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={arc.color}
                            strokeWidth={thickness}
                            strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
                            strokeDashoffset={-arc.offset}
                        />
                    ))}
                </G>
            </Svg>
            <View style={styles.center} pointerEvents="none">
                <Text style={styles.value}>{centerValue}</Text>
                <Text style={styles.label}>{centerLabel}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
    value: { ...typography.cardTitle, fontSize: 26, fontWeight: '700', color: colors.textPrimary },
    label: { ...typography.body, color: colors.textPrimary },
});
