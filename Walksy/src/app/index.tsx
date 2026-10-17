import { Image, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import  { Redirect, useRouter } from "expo-router";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SpeechBubble } from "@/components/SpeechBubble";
import { colors, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

const pandaImage = require("../../assets/images/Frame 113.png");

export default function WelcomeScreen() {
  const router = useRouter();
  const { status } = useAuth();

  const handleEnter = () => {
    router.push('/language');
  };

  // already logged in: skip the welcome and onboarding
  if (status === 'signedIn') return <Redirect href="/home" />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.topBlock}>
          <Text style={styles.title}>Walksy</Text>

          <View style={styles.hero}>
            <Image
              source={pandaImage}
              style={styles.panda}
              resizeMode="contain"
              accessibilityLabel="Walksy the red panda waving hello"
            />
            <View style={styles.bubbleWrapper}>
              <SpeechBubble text="Hello!" />
            </View>
          </View>

          <Text style={styles.subTitleSecondary}>
            Your friendly companion that helps you navigate errands, appointments and everyday journeys.
          </Text>
        </View>

        <PrimaryButton label="Enter" onPress={handleEnter} />      
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    justifyContent: 'space-between', // top block up top, button pinned to bottom
  },
  topBlock: { alignItems: 'center' },
  title: { ...typography.title, color: colors.brand, marginTop: spacing.lg },
  hero: {
    width: '100%',
    marginTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panda: { width: '78%', aspectRatio: 1, maxHeight: 300 },
  bubbleWrapper: { position: 'absolute', top: '17%', left: '0%', zIndex: 2 },
  subTitleSecondary: {
    ...typography.subTitleSecondary,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
});
