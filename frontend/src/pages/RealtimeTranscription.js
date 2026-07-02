import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import RecordRTC from 'recordrtc';

const RealtimeTranscription = () => {
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef(null);
  const recorderRef = useRef(null);

  useEffect(() => {
    // Connect to the WebSocket server
    socketRef.current = io('http://localhost:3001'); // Adjust the URL to your backend

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socketRef.current.on('transcription', (data) => {
      setTranscription((prev) => prev + data.text + ' ');
    });

    socketRef.current.on('server_error', (error) => {
      console.error('Server error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (recorderRef.current) {
        recorderRef.current.stopRecording(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        sampleRate: 16000,
        desiredSampRate: 16000,
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        timeSlice: 1000, // Send data every 1 second
        ondataavailable: (blob) => {
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('stream', blob);
          }
        },
      });
      recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
      setTranscription('');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        setIsRecording(false);
      });
    }
  };

  return (
    <div>
      <h1>Real-time Transcription</h1>
      <div>
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
      <div>
        <h2>Transcription:</h2>
        <p>{transcription}</p>
      </div>
    </div>
  );
};

export default RealtimeTranscription;
