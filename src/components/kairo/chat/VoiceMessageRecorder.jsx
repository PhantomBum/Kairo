import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Send, Trash2, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function VoiceMessageRecorder({ onSend, onCancel }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveform, setWaveform] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis for waveform
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start duration counter
      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Start waveform animation
      const updateWaveform = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Sample 20 values for waveform
          const samples = [];
          const step = Math.floor(dataArray.length / 20);
          for (let i = 0; i < 20; i++) {
            samples.push(dataArray[i * step] / 255);
          }
          setWaveform(samples);
        }
        animationRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(intervalRef.current);
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Toggle playback
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Send voice message
  const handleSend = async () => {
    if (!audioBlob) return;

    setIsSending(true);
    try {
      // Upload audio file
      const { file_url } = await base44.integrations.Core.UploadFile({
        file: new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' })
      });

      onSend?.({
        audio_url: file_url,
        duration_seconds: duration,
        waveform: waveform.map(v => Math.round(v * 100))
      });
    } catch (error) {
      console.error('Error sending voice message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      cancelAnimationFrame(animationRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg"
    >
      {/* Recording/Playback state */}
      {isRecording ? (
        <>
          {/* Waveform */}
          <div className="flex-1 flex items-center gap-0.5 h-8">
            {waveform.map((value, i) => (
              <motion.div
                key={i}
                className="w-1 bg-red-500 rounded-full"
                animate={{ height: `${Math.max(4, value * 32)}px` }}
                transition={{ duration: 0.05 }}
              />
            ))}
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white font-mono text-sm">{formatDuration(duration)}</span>
          </div>

          {/* Stop button */}
          <Button
            onClick={stopRecording}
            size="icon"
            className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600"
          >
            <Square className="w-4 h-4 fill-current" />
          </Button>
        </>
      ) : audioUrl ? (
        <>
          {/* Playback controls */}
          <Button
            onClick={togglePlayback}
            size="icon"
            variant="ghost"
            className="w-10 h-10 rounded-full"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          {/* Static waveform */}
          <div className="flex-1 flex items-center gap-0.5 h-8">
            {waveform.map((value, i) => (
              <div
                key={i}
                className="w-1 bg-indigo-500 rounded-full"
                style={{ height: `${Math.max(4, value * 32)}px` }}
              />
            ))}
          </div>

          <span className="text-zinc-400 font-mono text-sm">{formatDuration(duration)}</span>

          {/* Delete */}
          <Button
            onClick={() => {
              setAudioBlob(null);
              setAudioUrl(null);
              setWaveform([]);
              setDuration(0);
            }}
            size="icon"
            variant="ghost"
            className="text-zinc-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* Send */}
          <Button
            onClick={handleSend}
            disabled={isSending}
            size="icon"
            className="w-10 h-10 rounded-full bg-indigo-500 hover:bg-indigo-600"
          >
            <Send className="w-4 h-4" />
          </Button>

          <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
        </>
      ) : (
        <>
          {/* Start recording */}
          <p className="flex-1 text-zinc-400 text-sm">Click to start recording</p>
          <Button
            onClick={startRecording}
            size="icon"
            className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600"
          >
            <Mic className="w-5 h-5" />
          </Button>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="text-zinc-400"
          >
            Cancel
          </Button>
        </>
      )}
    </motion.div>
  );
}