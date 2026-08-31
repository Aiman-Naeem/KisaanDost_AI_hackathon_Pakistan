import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
  createAudioPlayer,
} from 'expo-audio';

/** Props for the VoiceRecorder component. */
export interface VoiceRecorderProps {
  /**
   * Called after a recording is successfully stopped with the local file URI.
   * The parent can use this to trigger API calls or other side effects.
   */
  onRecordingStop?: (uri: string) => void;
}

/**
 * Self-contained voice recorder component.
 * Records audio as .m4a using expo-audio, plays it back locally.
 * Fires onRecordingStop callback when a recording completes.
 */
export default function VoiceRecorder({ onRecordingStop }: VoiceRecorderProps) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null
  );
  const [isPreparing, setIsPreparing] = useState(false);

  // Ref to hold the dynamically-created audio player
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  // ── Request permissions & configure audio mode on mount ──────────────
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      setPermissionGranted(status.granted);

      if (status.granted) {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      }
    })();

    // Clean up the player on unmount
    return () => {
      playerRef.current?.remove();
    };
  }, []);

  // ── Start recording ─────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      setIsPreparing(true);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      console.warn('Failed to start recording:', err);
    } finally {
      setIsPreparing(false);
    }
  };

  // ── Stop recording ──────────────────────────────────────────────────
  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      // After stop(), the recording URI is available on the recorder
      const uri = audioRecorder.uri;
      if (uri) {
        // Release any previous player before creating a new one
        playerRef.current?.remove();
        playerRef.current = createAudioPlayer(uri);
        setRecordingUri(uri);

        // Notify parent that a recording is ready for processing
        onRecordingStop?.(uri);
      }
    } catch (err) {
      console.warn('Failed to stop recording:', err);
    }
  };

  // ── Play back the last recording ────────────────────────────────────
  const playRecording = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
    playerRef.current.play();
    setIsPlaying(true);

    // Simple timeout-based stop detection — poll until done
    const checkPlayback = setInterval(() => {
      if (!playerRef.current) {
        clearInterval(checkPlayback);
        setIsPlaying(false);
        return;
      }
      // AudioPlayer exposes `currentTime` and `duration`
      const { currentTime, duration } = playerRef.current;
      if (duration > 0 && currentTime >= duration - 0.1) {
        setIsPlaying(false);
        clearInterval(checkPlayback);
      }
    }, 200);
  };

  // ── Permission denied UI ────────────────────────────────────────────
  if (permissionGranted === false) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.errorIcon}>🔇</Text>
        <Text style={styles.errorTitle}>Microphone Access Denied</Text>
        <Text style={styles.errorMessage}>
          KisaanDost needs microphone permission to record your voice.
          Please enable it in your device settings and restart the app.
        </Text>
      </View>
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────
  return (
    <View style={styles.wrapper}>
      {/* Recording indicator */}
      {recorderState.isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.redDot} />
          <Text style={styles.recordingText}>Recording...</Text>
        </View>
      )}

      {/* Record / Stop toggle button */}
      <TouchableOpacity
        style={[
          styles.recordButton,
          recorderState.isRecording && styles.recordButtonActive,
        ]}
        onPress={recorderState.isRecording ? stopRecording : startRecording}
        disabled={isPreparing}
      >
        {isPreparing ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text style={styles.recordButtonText}>
            {recorderState.isRecording ? '⏹  Stop Recording' : '🎙️  Start Recording'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Play recording button */}
      {recordingUri && (
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={playRecording}
          disabled={isPlaying}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? '🔊  Playing...' : '▶️  Play Recording'}
          </Text>
        </TouchableOpacity>
      )}

      {/* URI debug info (handy during development) */}
      {recordingUri && (
        <Text style={styles.uriText} numberOfLines={2}>
          Last recording: {recordingUri}
        </Text>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: 24,
    width: '100%',
  },

  // Recording indicator
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e53935',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e53935',
  },

  // Record button
  recordButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 220,
    alignItems: 'center',
    elevation: 3,
  },
  recordButtonActive: {
    backgroundColor: '#c62828',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Play button
  playButton: {
    marginTop: 20,
    backgroundColor: '#1565c0',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 220,
    alignItems: 'center',
    elevation: 3,
  },
  playButtonActive: {
    backgroundColor: '#0d47a1',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Debug URI text
  uriText: {
    marginTop: 16,
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  // Permission denied
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#c62828',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});
