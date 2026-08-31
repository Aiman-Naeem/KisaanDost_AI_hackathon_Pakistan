import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { createAudioPlayer } from 'expo-audio';
import VoiceRecorder from '../components/VoiceRecorder';
import { sendVoiceQuery, type VoiceResponse, type ApiResponse } from '../services/api';
import { decodeBase64Audio, deleteTempAudio } from '../utils/audio';

/** Hardcoded farmer ID placeholder — will come from auth context later. */
const PLACEHOLDER_FARMER_ID = 'farmer_001';

export default function VoiceAssistantScreen() {
  const [isQuerying, setIsQuerying] = useState(false);
  const [response, setResponse] = useState<(VoiceResponse & { success: true }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ref to hold the TTS audio player so we can clean up on unmount
  const ttsPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const ttsFileUriRef = useRef<string | null>(null);

  // Clean up TTS resources on unmount
  useEffect(() => {
    return () => {
      ttsPlayerRef.current?.remove();
      if (ttsFileUriRef.current) {
        deleteTempAudio(ttsFileUriRef.current);
      }
    };
  }, []);

  /**
   * Called by VoiceRecorder when the user stops recording.
   * Sends the audio to the API, decodes the response audio, and autoplays it.
   */
  const handleRecordingStop = async (audioUri: string) => {
    // Reset previous state
    setError(null);
    setResponse(null);
    ttsPlayerRef.current?.remove();
    if (ttsFileUriRef.current) {
      deleteTempAudio(ttsFileUriRef.current);
      ttsFileUriRef.current = null;
    }

    setIsQuerying(true);

    try {
      const result = await sendVoiceQuery(audioUri, PLACEHOLDER_FARMER_ID);

      // Handle failure shape ({ success: false, error })
      if ((result as ApiResponse).success === false) {
        setError((result as any).error ?? 'Something went wrong, please try again.');
        return;
      }

      // Success path — cast to VoiceResponse
      const voiceResult = result as VoiceResponse;
      setResponse(voiceResult);

      // Decode base64 audio to a temp file and autoplay
      if (voiceResult.audio_base64) {
        try {
          const fileUri = await decodeBase64Audio(voiceResult.audio_base64);
          ttsFileUriRef.current = fileUri;

          const player = createAudioPlayer(fileUri);
          ttsPlayerRef.current = player;
          player.play();
        } catch (audioErr) {
          // Audio decode/play failure is non-critical — text is still shown
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Voice Assistant</Text>
      <Text style={styles.subtitle}>
        Speak to KisaanDost — your AI farming helper.
      </Text>

      <VoiceRecorder onRecordingStop={handleRecordingStop} />

      {/* ── Loading state ─────────────────────────────────────────────── */}
      {isQuerying && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Analyzing your question...</Text>
        </View>
      )}

      {/* ── Error state (success: false from API) ─────────────────────── */}
      {error && !isQuerying && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Something went wrong, please try again.
          </Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      )}

      {/* ── Response display ──────────────────────────────────────────── */}
      {response && !isQuerying && (
        <View style={styles.responseContainer}>
          {/* Language badge */}
          <View
            style={[
              styles.badge,
              response.language === 'unrecognized'
                ? styles.badgeWarning
                : styles.badgeSuccess,
            ]}
          >
            <Text style={styles.badgeText}>
              {response.language === 'unrecognized'
                ? 'Unrecognized'
                : response.language.charAt(0).toUpperCase() + response.language.slice(1)}
            </Text>
          </View>

          {/* Transcription (only show if we got one) */}
          {response.transcription ? (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>You said</Text>
              <Text style={styles.transcriptionText}>
                {response.transcription}
              </Text>
            </View>
          ) : null}

          {/* Answer */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>KisaanDost says</Text>
            <Text style={styles.answerText}>{response.answer}</Text>
          </View>

          {/* Replay TTS button */}
          {ttsPlayerRef.current && (
            <TouchableOpacity
              style={styles.replayButton}
              onPress={() => {
                ttsPlayerRef.current?.seekTo(0);
                ttsPlayerRef.current?.play();
              }}
            >
              <Text style={styles.replayButtonText}>Replay Audio Answer</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Idle hint ─────────────────────────────────────────────────── */}
      {!response && !error && !isQuerying && (
        <Text style={styles.hint}>
          Tap "Start Recording" and ask a farming question in Urdu.
        </Text>
      )}
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#2e7d32',
    fontWeight: '500',
  },

  // Error
  errorContainer: {
    marginTop: 24,
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e65100',
    textAlign: 'center',
  },
  errorDetail: {
    marginTop: 6,
    fontSize: 12,
    color: '#bf360c',
    textAlign: 'center',
  },

  // Response
  responseContainer: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },

  // Language badge
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeSuccess: {
    backgroundColor: '#e8f5e9',
  },
  badgeWarning: {
    backgroundColor: '#fff8e1',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },

  // Cards
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  answerText: {
    fontSize: 16,
    color: '#2e7d32',
    lineHeight: 26,
    fontWeight: '500',
  },

  // Replay button
  replayButton: {
    marginTop: 4,
    backgroundColor: '#1565c0',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 2,
  },
  replayButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
