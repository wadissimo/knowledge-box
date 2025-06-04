import ScreenContainer from '@/src/components/common/ScreenContainer';
import TrainingResults from '@/src/components/TrainingResults';
import { Session, SessionStatus, useSessionModel } from '@/src/data/SessionModel';
import { stripTimeFromDate } from '@/src/lib/TimeUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

const TrainingResultsPage = () => {
  const { collectionId, sessionId } = useLocalSearchParams();
  const { getSessionById, updateSession, getStartedSession } = useSessionModel();
  const [session, setSession] = useState<Session | null>(null);

  const router = useRouter();
  useEffect(() => {
    const run = async () => {
      const session = await getSessionById(Number(sessionId));
      console.log('TrainingResultsPage session', session);
      setSession(session);
    };
    run();
  }, [sessionId]);
  const handleTrainingReset = async () => {
    const curDateStripped = stripTimeFromDate(new Date());
    var session = await getStartedSession(Number(collectionId), curDateStripped);
    if (session !== null) {
      session.status = SessionStatus.Abandoned;
      await updateSession(session);
    }
    router.replace(`../train`);
  };
  if (session === null)
    return (
      <ScreenContainer>
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  return (
    <ScreenContainer>
      <TrainingResults session={session!} onResetTraining={handleTrainingReset} />
    </ScreenContainer>
  );
};

export default TrainingResultsPage;
