import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import jscanify from 'jscanify';
import { Camera, RefreshCw, Check, X, Maximize } from 'lucide-react';

const Scanner = ({ onScan, onCancel }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    try {
      console.log("Initializing jscanify...");
      const js = new jscanify();
      setScanner(js);
      console.log("jscanify initialized");
    } catch (e) {
      console.error("jscanify initialization failed:", e);
    }
  }, []);

  // Video constraints for higher quality
  const videoConstraints = {
    width: 1920,
    height: 1080,
    facingMode: "environment" // Use back camera on mobile
  };

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();

      // Process the image with jscanify
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        try {
          // Attempt to extract the document
          // Basic functionality: Just flatten/warp if paper detected
          // If not detailed enough, we fallback to the raw screenshot
          if (scanner) {
            // Optimized resolution: 1920x1080 is enough for text and much faster than 4K
            const resultCanvas = scanner.extractPaper(image, 1920, 1080);
            const proccessedDataUrl = resultCanvas.toDataURL("image/jpeg", 0.8); // 80% quality
            setCapturedImage(proccessedDataUrl);
          } else {
            console.warn("Scanner not ready, using raw image");
            setCapturedImage(imageSrc);
          }
        } catch (e) {
          console.warn("Scan failed, using raw image", e);
          setCapturedImage(imageSrc);
        }
        setIsScanning(false);
      };
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setIsScanning(true);
  };

  const confirmScan = async () => {
    // Convert Data URL to Blob
    const res = await fetch(capturedImage);
    const blob = await res.blob();

    // Create a File object
    const file = new File([blob], `scanned-doc-${Date.now()}.jpg`, { type: "image/jpeg" });
    onScan(file);
  };

  // Optional: Live detection overlay could go here
  // But jscanify is heavy to run on every frame in JS thread without web workers.
  // We'll stick to capture-time processing for performance.

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Header / Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent z-10">
        <button onClick={onCancel} className="text-white p-2 rounded-full hover:bg-white/10">
          <X className="w-8 h-8" />
        </button>
        <span className="text-white font-medium">Document Scanner</span>
        <div className="w-8" /> {/* Spacer */}
      </div>

      <div className="relative w-full h-full flex items-center justify-center bg-neutral-900 overflow-hidden">
        {isScanning ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="absolute min-w-full min-h-full object-cover"
            />

            {/* Overlay Guide */}
            <div className="absolute inset-0 border-[2px] border-white/30 m-8 rounded-lg pointer-events-none flex items-center justify-center">
              <div className="text-white/50 text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                Align document here
              </div>
            </div>

            {/* Capture Button */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <button
                onClick={capture}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:scale-95 transition-all"
              >
                <div className="w-16 h-16 bg-white rounded-full" />
              </button>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <img
              src={capturedImage}
              alt="Captured"
              className="max-h-[80vh] max-w-[90vw] object-contain shadow-2xl border border-white/20"
            />

            <div className="absolute bottom-0 left-0 right-0 p-8 bg-black/80 backdrop-blur-md flex justify-around items-center space-x-6">
              <button
                onClick={retake}
                className="flex flex-col items-center space-y-1 text-white opacity-80 hover:opacity-100"
              >
                <RefreshCw className="w-8 h-8" />
                <span className="text-xs">Retake</span>
              </button>

              <button
                onClick={confirmScan}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
              >
                <Check className="w-6 h-6" />
                <span>Use Scan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
