import { useState, useRef, useCallback, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { base44 } from '@/api/base44Client';

// Disable Agora logs in production
AgoraRTC.setLogLevel(3);

export default function useAgora() {
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [localAudioMuted, setLocalAudioMuted] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [error, setError] = useState(null);
  const [speakingUids, setSpeakingUids] = useState([]);

  const clientRef = useRef(null);
  const localAudioRef = useRef(null);
  const screenClientRef = useRef(null);
  const screenTrackRef = useRef(null);
  const channelRef = useRef(null);
  const localUidRef = useRef(null);

  // Initialize client once
  useEffect(() => {
    clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    const client = clientRef.current;

    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
      setRemoteUsers(prev => {
        const filtered = prev.filter(u => u.uid !== user.uid);
        return [...filtered, user];
      });
    });

    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'audio') {
        user.audioTrack?.stop();
      }
      setRemoteUsers(prev => {
        const filtered = prev.filter(u => u.uid !== user.uid);
        return [...filtered, user];
      });
    });

    client.on('user-left', (user) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    });

    // Volume indicator for speaking detection
    client.enableAudioVolumeIndicator();
    client.on('volume-indicator', (volumes) => {
      const speaking = volumes.filter(v => v.level > 5).map(v => v.uid);
      setSpeakingUids(speaking);
    });

    return () => {
      client.removeAllListeners();
    };
  }, []);

  const join = useCallback(async (channelName, audioSettings) => {
    if (joined || !clientRef.current) return;
    setError(null);

    // Get token from backend
    const res = await base44.functions.invoke('agoraToken', { channelName });
    const { token, appId, uid } = res.data;

    await clientRef.current.join(appId, channelName, token, uid);
    localUidRef.current = uid;

    // Create and publish local audio track with audio processing settings
    const trackConfig = {};
    if (audioSettings?.noiseSuppression !== undefined) trackConfig.ANS = audioSettings.noiseSuppression;
    if (audioSettings?.echoCancellation !== undefined) trackConfig.AEC = audioSettings.echoCancellation;
    if (audioSettings?.autoGainControl !== undefined) trackConfig.AGC = audioSettings.autoGainControl;

    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack(
      Object.keys(trackConfig).length > 0 ? trackConfig : undefined
    );
    localAudioRef.current = audioTrack;
    await clientRef.current.publish([audioTrack]);

    channelRef.current = channelName;
    setJoined(true);
    setLocalAudioMuted(false);
  }, [joined]);

  const leave = useCallback(async () => {
    // Stop screen sharing first
    if (screenClientRef.current) {
      screenTrackRef.current?.close();
      await screenClientRef.current.leave().catch(() => {});
      screenClientRef.current = null;
      screenTrackRef.current = null;
      setScreenSharing(false);
    }

    // Close local audio
    localAudioRef.current?.close();
    localAudioRef.current = null;

    // Leave channel
    await clientRef.current?.leave().catch(() => {});

    setRemoteUsers([]);
    setJoined(false);
    setLocalAudioMuted(false);
    channelRef.current = null;
  }, []);

  const toggleMute = useCallback(async () => {
    if (!localAudioRef.current) return;
    const newMuted = !localAudioMuted;
    await localAudioRef.current.setEnabled(!newMuted);
    setLocalAudioMuted(newMuted);
  }, [localAudioMuted]);

  const toggleScreenShare = useCallback(async () => {
    if (!joined || !channelRef.current) return;

    if (screenSharing) {
      // Stop screen share
      screenTrackRef.current?.close();
      await screenClientRef.current?.leave().catch(() => {});
      screenClientRef.current = null;
      screenTrackRef.current = null;
      setScreenSharing(false);
      return;
    }

    // Start screen share with a separate client (Agora best practice)
    const screenClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    screenClientRef.current = screenClient;

    // Get token for screen share uid
    const res = await base44.functions.invoke('agoraToken', { channelName: channelRef.current });
    const { token, appId } = res.data;

    // Use a large UID to differentiate screen share
    const screenUid = Math.floor(Math.random() * 100000) + 100000;
    await screenClient.join(appId, channelRef.current, token, screenUid);

    const screenTrack = await AgoraRTC.createScreenVideoTrack({
      encoderConfig: '1080p_1',
    }, 'disable').catch((err) => {
      // User cancelled screen share picker
      screenClient.leave().catch(() => {});
      screenClientRef.current = null;
      return null;
    });

    if (!screenTrack) return;

    screenTrackRef.current = screenTrack;
    await screenClient.publish([screenTrack]);

    // Listen for browser's native "stop sharing" button
    screenTrack.on('track-ended', async () => {
      screenTrack.close();
      await screenClient.leave().catch(() => {});
      screenClientRef.current = null;
      screenTrackRef.current = null;
      setScreenSharing(false);
    });

    setScreenSharing(true);
  }, [joined, screenSharing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localAudioRef.current?.close();
      screenTrackRef.current?.close();
      clientRef.current?.leave().catch(() => {});
      screenClientRef.current?.leave().catch(() => {});
    };
  }, []);

  return {
    joined,
    remoteUsers,
    localAudioMuted,
    screenSharing,
    error,
    speakingUids,
    localUid: localUidRef.current,
    join,
    leave,
    toggleMute,
    toggleScreenShare,
  };
}