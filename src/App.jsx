//install dependencies
//Import dependencies
// setup webcam and canvas 
//Define references to those
//Load Facemesh
//Detect function
//Drawing utilities
//Load triangulation
//setup triangle path
//setup point drawing 
//Add drawMesh to detect function


// function App() {
//   //setup webcam and canvas references
//   const webcamRef = useRef(null);
//   const canvasRef = useRef(null);

//   //load facemesh
//   const runFacemesh = async () => {
//     const net = await facemesh.load({
//       inputResolution: { width: 640, height: 480 },
//       scale: 0.8
//     });
//     setInterval(() => {
//       detect(net)
//     }, 10);
//   }

//   //detect function
//   const detect = async (net) => {
//     if (
//       typeof webcamRef.current !== "undefined" &&
//       webcamRef.current !== null &&
//       webcamRef.current.video.readyState === 4
//     ) {
//       //get video properties
//       const video = webcamRef.current.video;
//       const videoWidth = webcamRef.current.video.videoWidth;
//       const videoHeight = webcamRef.current.video.videoHeight;
//       //set video width
//       webcamRef.current.video.width = videoWidth;
//       webcamRef.current.video.height = videoHeight;
//       //set canvas height and width
//       canvasRef.current.width = videoWidth;
//       canvasRef.current.height = videoHeight;
//       //make detections
//       const face = await net.estimateFaces(video);
//       console.log(face);

//       //get canvas context for drawing
//       const ctx = canvasRef.current.getContext('2d');
//       drawMesh(face, ctx);

//     }
//   }


//   useEffect(() => {
//     runFacemesh();
//   }, []);

//   return (
//     <>
//       <div>
//         <header className="App-header">
//           <Webcam ref={webcamRef} style={{
//             position: 'absolute',
//             marginLeft: 'auto',
//             marginRight: 'auto',
//             left: 0,
//             right: 0,
//             textAlign: 'center',
//             zindex: 9,
//             width: 640,
//             height: 480
//           }}/>
//           <canvas ref={canvasRef} style={{
//             position: 'absolute',
//             marginLeft: 'auto',
//             marginRight: 'auto',
//             left: 0,
//             right: 0,
//             textAlign: 'center',
//             zindex: 9,
//             width: 640,
//             height: 480
//           }}/>
//         </header>
//       </div>
//     </>
//   )
// }

import './App.css'
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import Webcam from 'react-webcam'
import { useRef, useEffect, useState } from 'react';
import { drawMesh } from './utilites.js';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [net, setNet] = useState(null);
  const detectionInterval = useRef(null);

  const runFacemesh = async () => {
    const net = await faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      {
        runtime: 'tfjs',
        refineLandmarks: true,
        maxFaces: 1
      }
    );
    setNet(net);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      
      const faces = await net.estimateFaces(video);
      const ctx = canvasRef.current.getContext('2d');
      requestAnimationFrame(() => {
        drawMesh(faces, ctx);
      });
    }
  };

  const startDetection = () => {
    if (net && !isDetecting) {
      detectionInterval.current = setInterval(() => {
        detect(net);
      }, 10);
      setIsDetecting(true);
    }
  };

  const stopDetection = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setIsDetecting(false);
    }
  };

  useEffect(() => {
    runFacemesh();
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  return (
    <div className="container">
      <div className="frame-container">
        <Webcam 
          ref={webcamRef} 
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 9,
            width: 640,
            height: 480
          }}
        />
        <canvas 
          ref={canvasRef} 
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 9,
            width: 640,
            height: 480
          }}
        />
      </div>
      <div className="button-container">
        <button 
          className="control-button"
          onClick={startDetection}
          disabled={isDetecting}
        >
          Start Detection
        </button>
        <button 
          className="control-button"
          onClick={stopDetection}
          disabled={!isDetecting}
        >
          Stop Detection
        </button>
      </div>
    </div>
  );
}

export default App;

