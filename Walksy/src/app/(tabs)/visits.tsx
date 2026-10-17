import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AssistantView } from '../../components/assistant/AssistantView';
import { HelpView } from '../../components/help/HelpView';
import { PlaceSearchView } from '../../components/places/PlaceSearchView';
import { ScheduleView } from '../../components/schedule/ScheduleView';
import { ScreenHeader } from '../../components/ScreenHeader';
import { VisitsOverview } from '../../components/visits/VisitsOverview';
import { colors } from '../../constants/theme';
import { useVisits } from '../../context/VisitsContext';
import type { VisitGuide } from '../../types/assistant';
import type { Place } from '../../types/place';
import type { Visit, VisitTab } from '../../types/visit';
import { getRecentPlaces } from '../../utils/visits';

// Visits tab:
//   overview  Active / Upcoming / Past
//   creating a visit: 1. search "Create a new visit"  2. assistant "How can I help?"  3. schedule "When is your visit?"
//   help  "Help Me" on a visit: its steps one at a time, then "All done!"
type Step =
  | { name: 'overview' }
  | { name: 'search' }
  | { name: 'assistant'; place: Place }
  | { name: 'schedule'; place: Place; purpose: string | null; guide: VisitGuide | null; fromAssistant: boolean }
  | { name: 'help'; visitId: string };

export default function VisitsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { visits } = useVisits();
  const [step, setStep] = useState<Step>({ name: 'overview' });
  const [tab, setTab] = useState<VisitTab>('active');

  const recentPlaces = useMemo(() => getRecentPlaces(visits), [visits]);
  const showOverview = (nextTab?: VisitTab) => {
    if (nextTab) setTab(nextTab);
    setStep({ name: 'overview' });
  };

  // other screens can open a tab directly, e.g. Statistics → /visits?tab=past
  const { tab: requestedTab } = useLocalSearchParams<{ tab?: VisitTab }>();
  useEffect(() => {
    if (requestedTab === 'active' || requestedTab === 'upcoming' || requestedTab === 'past') showOverview(requestedTab);
  }, [requestedTab]);

  // the visit is saved: show it in the right tab
  const handleCreated = (_visit: Visit, action: 'start' | 'schedule') => {
    showOverview(action === 'start' ? 'active' : 'upcoming');
  };

  return (
    // wraps the whole screen, so the content is lifted by exactly the part the keyboard covers
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <SafeAreaView style={styles.screen} edges={['top']}>
        <StatusBar style="dark" />

        <ScreenHeader
          title={t('tabs.visits')}
          onNotificationsPress={() => {
            // TODO: open notifications once the screen exists
          }}
          onSosPress={() => {
            // TODO: emergency flow
          }}
        />

        {step.name === 'overview' && (
          <VisitsOverview
            tab={tab}
            onTabChange={setTab}
            onCreate={() => setStep({ name: 'search' })}
            onHelp={(visit) => setStep({ name: 'help', visitId: visit.id })}
            // TODO: show the place on the map once the Map tab exists
            onMap={() => router.navigate('/map')}
            // plan the same visit again: straight to "When is your visit?", with the same steps
            onRestore={(visit) =>
              setStep({ name: 'schedule', place: visit.place, purpose: visit.title, guide: visit.guide, fromAssistant: false })
            }
          />
        )}

        {step.name === 'search' && (
          <PlaceSearchView
            recentPlaces={recentPlaces}
            onSelect={(place) => setStep({ name: 'assistant', place })}
            onClose={() => showOverview()}
          />
        )}

        {(step.name === 'assistant' || (step.name === 'schedule' && step.fromAssistant)) && (
          // stays mounted (only hidden) during scheduling, so X brings back the same conversation
          <View style={[styles.screen, step.name === 'schedule' && styles.hidden]}>
            <AssistantView
              key={step.place.id} // a new place starts a fresh conversation
              place={step.place}
              onClose={() => setStep({ name: 'search' })}
              onReady={(purpose, guide) =>
                setStep({ name: 'schedule', place: step.place, purpose, guide, fromAssistant: true })
              }
            />
          </View>
        )}

        {step.name === 'schedule' && (
          <ScheduleView
            place={step.place}
            purpose={step.purpose}
            guide={step.guide}
            onClose={() => (step.fromAssistant ? setStep({ name: 'assistant', place: step.place }) : showOverview())}
            onCreated={handleCreated}
          />
        )}

        {step.name === 'help' && (
          <HelpView visitId={step.visitId} onPause={() => showOverview()} onReturn={() => showOverview('past')} />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hidden: { display: 'none' },
});
