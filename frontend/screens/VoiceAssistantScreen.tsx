import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { createAudioPlayer } from 'expo-audio';
import VoiceRecorder from '../components/VoiceRecorder';
import { StateCard, PrimaryButton } from '../components/ui';
import { sendVoiceQuery, type VoiceResponse, type ApiResponse } from '../services/api';
import { decodeBase64Audio, deleteTempAudio } from '../utils/audio';
import { useFarmerContext } from '../contexts/FarmerContext';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { fontSize, fontWeight, lineHeight } from '../theme/typography';

export default function VoiceAssistantScreen() {
  const { farmerId } = useFarmerContext();
  const [isQuerying, setIsQuerying] = useState(false);
  const [response, setResponse] = useState<(VoiceResponse & { success: true }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAudio, setHasAudio] = useState(false);

  const ttsPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const ttsFileUriRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      ttsPlayerRef.current?.remove();
      if (ttsFileUriRef.current) {
        deleteTempAudio(ttsFileUriRef.current);
      }
    };
  }, []);

  const resetState = useCallback(() => {
    setError(null);
    setResponse(null);
    setHasAudio(false);
    ttsPlayerRef.current?.remove();
    ttsPlayerRef.current = null;
    if (ttsFileUriRef.current) {
      deleteTempAudio(ttsFileUriRef.current);
      ttsFileUriRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => { resetState(); }, [resetState]);
  const handleTryAgain = useCallback(() => { resetState(); }, [resetState]);

  const handleReplay = useCallback(() => {
    if (ttsPlayerRef.current) {
      ttsPlayerRef.current.seekTo(0);
      ttsPlayerRef.current.play();
    }
  }, []);

  const handleRecordingStop = async (audioUri: string) => {
    resetState();
    setIsQuerying(true);

    try {
      const result = await sendVoiceQuery(audioUri, farmerId ?? undefined);

      if ((result as ApiResponse).success === false) {
        setError((result as any).error ?? 'Something went wrong, please try again.');
        return;
      }

      const voiceResult = result as VoiceResponse;
      setResponse(voiceResult);

      if (voiceResult.audio_base64) {
        try {
          const fileUri = await decodeBase64Audio(voiceResult.audio_base64);
          ttsFileUriRef.current = fileUri;
          const player = createAudioPlayer(fileUri);
          ttsPlayerRef.current = player;
          setHasAudio(true);
          player.play();
        } catch (audioErr) {
          console.warn('Failed to decode/play TTS audio:', audioErr);
        }
      }
    } catch (err) {
      setError('Something went wrong, please try again.');
      console.warn('Voice query failed:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  const isIdle = !isQuerying && !response && !error;
  const isSending = isQuerying;
  const isUnrecognized = response?.language === 'unrecognized';
  const hasResponse = !!response && !isQuerying;
  const hasError = !!error && !isQuerying;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Voice Assistant</Text>
      <Text style={styles.subtitle}>
        Ask KisaanDost any farming question in Urdu.
      </Text>

      <VoiceRecorder
        onRecordingStop={handleRecordingStop}
        onCancel={handleCancel}
        disabled={isQuerying}
      />

      {/* ── Sending/Thinking ─────────────────────────────────────────── */}
      {isSending && (
        <View style={styles.sendingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.sendingText}>KisaanDost is thinking...</Text>
        </View>
      )}

      {/* ── Error state ─────────────────────────────────────────────── */}
      {hasError && (
        <StateCard
          variant="error"
          icon="⚠️"
          title="Oops! Something went wrong"
          description={error ?? undefined}
          actionLabel="🎙️ Try Again"
          onAction={handleTryAgain}
        />
      )}

      {/* ── Unrecognized language ───────────────────────────────────── */}
      {hasResponse && isUnrecognized && (
        <StateCard
          variant="info"
          icon="🤔"
          title="I didn't quite catch that"
          description={response.answer}
          actionLabel="🎙️ Try Again"
          onAction={handleTryAgain}
        />
      )}

      {/* ── Successful response ─────────────────────────────────────── */}
      {hasResponse && !isUnrecognized && (
        <View style={styles.responseContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {response.language.charAt(0).toUpperCase() + response.language.slice(1)}
            </Text>
          </View>

          {response.transcription ? (
            <View style={styles.transcriptionCard}>
              <Text style={styles.cardLabel}>🗣️ You said</Text>
              <Text style={styles.transcriptionText}>{response.transcription}</Text>
            </View>
          ) : null}

          <View style={styles.answerCard}>
            <Text style={styles.cardLabel}>🌾 KisaanDost says</Text>
            <Text style={styles.answerText}>{response.answer}</Text>
          </View>

          {hasAudio && (
            <PrimaryButton
              label="Replay Answer"
              icon="🔊"
              variant="secondary"
              onPress={handleReplay}
              style={styles.actionBtn}
            />
          )}

          <PrimaryButton
            label="Ask Another Question"
            variant="primary"
            onPress={handleTryAgain}
            style={styles.actionBtn}
          />
        </View>
      )}

      {/* ── Idle state ──────────────────────────────────────────────── */}
      {isIdle && (
        <StateCard
          variant="neutral"
          icon="🌱"
          title="Ask a Farming Question"
          description={
            "Tap the microphone button above and speak your question in Urdu.\nKisaanDost will listen and give you farming advice."
          }
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: lineHeight.normal,
    marginBottom: spacing.sm,
  },

  // Sending
  sendingContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.accentLight,
    borderRadius: radius.lg,
    width: '100%',
  },
  sendingText: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
    color: colors.accentDark,
    fontWeight: fontWeight.semibold,
  },

  // Response
  responseContainer: {
    marginTop: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: spacing.base,
    paddingVertical: 6,
    borderRadius: radius.xl,
    backgroundColor: colors.successLight,
    marginBottom: spacing.base,
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  transcriptionCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    padding: spacing.base,
    marginBottom: spacing.md,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: colors.neutral,
  },
  answerCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    padding: spacing.base,
    marginBottom: spacing.base,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  transcriptionText: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
    lineHeight: lineHeight.normal,
    fontStyle: 'italic',
  },
  answerText: {
    fontSize: fontSize.bodyLg,
    color: colors.primaryDark,
    lineHeight: lineHeight.relaxed,
    fontWeight: fontWeight.medium,
  },
  actionBtn: {
    marginBottom: spacing.md,
    minWidth: 200,
  },
});
