import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useStore } from '../store';
import { Loader2, Camera, CameraOff } from 'lucide-react';

export const WebcamHandler: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isWebcamActive, setRotation, toggleWebcam } = useStore();
  const [loading, setLoading] = useState(false);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>();

  // Initialize MediaPipe
  useEffect(() => {
    const initMediaPipe = async () => {
      setLoading(true);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
      } catch (err) {
        console.error("Failed to load MediaPipe:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isWebcamActive && !handLandmarkerRef.current) {
      initMediaPipe();
    }
  }, [isWebcamActive]);

  // Handle Webcam Stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startWebcam = async () => {
      if (isWebcamActive && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        } catch (err) {
          console.error("Webcam error:", err);
          toggleWebcam(false);
        }
      }
    };

    if (isWebcamActive) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => stopWebcam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWebcamActive]);

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  const predictWebcam = async () => {
    if (!handLandmarkerRef.current || !videoRef.current || !isWebcamActive) return;

    const nowInMs = Date.now();
    const results = handLandmarkerRef.current.detectForVideo(videoRef.current, nowInMs);

    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      // Use the wrist (index 0) or average of palm for rotation
      // Map x (0..1) to Rotation Y (-PI/2 to PI/2)
      // Map y (0..1) to Rotation X (-PI/4 to PI/4)
      
      const wrist = landmarks[0];
      
      // Invert X because webcam is usually mirrored logic for user
      const rotY = (wrist.x - 0.5) * Math.PI * 2; 
      const rotX = (wrist.y - 0.5) * Math.PI; 

      setRotation([rotX, rotY, 0]);
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Hidden Video Element for processing */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className={`w-32 h-24 object-cover rounded-lg border border-white/20 shadow-lg transition-opacity duration-300 ${isWebcamActive ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'}`}
      ></video>

      <button
        onClick={() => toggleWebcam(!isWebcamActive)}
        className={`p-3 rounded-full shadow-xl transition-all ${
          isWebcamActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-500'
        } text-white`}
        title="Toggle Webcam Gesture Control"
      >
        {loading ? (
          <Loader2 className="animate-spin w-6 h-6" />
        ) : isWebcamActive ? (
          <CameraOff className="w-6 h-6" />
        ) : (
          <Camera className="w-6 h-6" />
        )}
      </button>
      
      {isWebcamActive && !loading && (
        <div className="text-xs text-white/70 bg-black/50 p-2 rounded backdrop-blur-sm">
          Move hand to rotate scene
        </div>
      )}
    </div>
  );
};
