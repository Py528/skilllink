/**
 * SquatCounter - Main screen with VisionCamera integration and pose detection
 * Combines camera frame processing, TFLite inference, and squat counting
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
  runOnJS,
} from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';
import * as FastTFLite from 'react-native-fast-tflite';

import { TFLitePoseDetector } from '../pose/TFLitePoseDetector';
import { SquatProcessor, SquatStats, Keypoint } from '../logic/SquatProcessor';
import { KeypointOverlay } from '../components/KeypointOverlay';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const SquatCounter: React.FC = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [squatStats, setSquatStats] = useState<SquatStats>({
    reps: 0,
    stage: 'UP',
    leftKneeAngle: 0,
    rightKneeAngle: 0,
    depthRatio: 0,
    stability: 0,
    formFeedback: ['Loading...']
  });
  const [keypoints, setKeypoints] = useState<(Keypoint | null)[]>([]);
  const [performanceStats, setPerformanceStats] = useState({ fps: 0, avgInferenceTime: 0 });

  const device = useCameraDevice('front');
  const poseDetector = React.useRef(new TFLitePoseDetector()).current;
  const squatProcessor = React.useRef(new SquatProcessor()).current;

  // Request camera permissions
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access for pose detection',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        // iOS permissions handled by react-native-vision-camera
        setHasPermission(true);
      }
    };

    requestPermissions();
  }, []);

  // Load TFLite model
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('[SquatCounter] Loading MoveNet model...');
        
        // Log available fast-tflite keys for debugging
        console.log('fast-tflite keys:', Object.keys(FastTFLite));
        
        let model = null;
        const modelPath = 'movenet_singlepose_lightning.tflite';
        
        // Try different loader functions based on fast-tflite version
        const loaders = [
          () => FastTFLite.TFLiteModel?.createFromAsset?.(modelPath),
          () => FastTFLite.TFLiteModel?.fromAsset?.(modelPath),
          () => FastTFLite.TFLiteModel?.create?.(modelPath),
          () => FastTFLite.TFLiteModel?.fromFile?.(modelPath),
          () => (FastTFLite as any).createModel?.(modelPath),
          () => (FastTFLite as any).loadModel?.(modelPath),
          () => (FastTFLite as any).load?.(modelPath),
        ];

        for (const loader of loaders) {
          try {
            model = await loader();
            if (model) {
              console.log('[SquatCounter] Model loaded successfully with loader:', loader.toString());
              break;
            }
          } catch (error) {
            // Continue to next loader
            continue;
          }
        }

        if (!model) {
          throw new Error('No supported loader found for react-native-fast-tflite');
        }

        poseDetector.setModel(model);
        setIsModelLoaded(true);
        console.log('[SquatCounter] Model setup complete');
        
      } catch (error) {
        console.error('[SquatCounter] Model loading failed:', error);
        Alert.alert(
          'Model Loading Error',
          `Failed to load MoveNet model: ${error.message}\\n\\nEnsure movenet_singlepose_lightning.tflite is in android/app/src/main/assets/`
        );
      }
    };

    loadModel();
  }, []);

  // Process pose detection results
  const processPoseResults = useCallback((detectedKeypoints: (Keypoint | null)[]) => {
    // Update keypoints for overlay
    setKeypoints(detectedKeypoints);
    
    // Process squat logic
    const stats = squatProcessor.processLandmarks(detectedKeypoints);
    setSquatStats(stats);
    
    // Update performance stats
    const perfStats = poseDetector.getStats();
    setPerformanceStats(perfStats);
  }, [squatProcessor, poseDetector]);

  // Frame processor worklet - runs on camera thread
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    if (!isModelLoaded) return;

    try {
      // Cast frame to any to avoid TypeScript issues with different VisionCamera versions
      const frameAny = frame as any;
      
      // Get frame dimensions
      const frameWidth = frameAny.width;
      const frameHeight = frameAny.height;
      
      // Access YUV420 planes
      const planes = frameAny.planes;
      if (!planes || planes.length < 3) return;
      
      const yPlane = planes[0];
      const uPlane = planes[1];
      const vPlane = planes[2];
      
      // Get plane properties
      const yBytesPerRow = yPlane.bytesPerRow;
      const uBytesPerRow = uPlane.bytesPerRow;
      const uPixelStride = uPlane.pixelStride;
      
      // Create RGB buffer (downscaled to reduce bridge payload)
      const targetWidth = 192;
      const targetHeight = 192;
      const rgbBuffer = new Uint8Array(targetWidth * targetHeight * 3);
      
      // YUV420 to RGB conversion with downscaling
      const scaleX = frameWidth / targetWidth;
      const scaleY = frameHeight / targetHeight;
      
      for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
          const srcX = Math.floor(x * scaleX);
          const srcY = Math.floor(y * scaleY);
          
          // Get Y value
          const yIdx = srcY * yBytesPerRow + srcX;
          const Y = yPlane.bytes[yIdx];
          
          // Get U,V values (subsampled)
          const uvX = Math.floor(srcX / 2);
          const uvY = Math.floor(srcY / 2);
          const uvIdx = uvY * uBytesPerRow + uvX * uPixelStride;
          
          const U = uPlane.bytes[uvIdx];
          const V = vPlane.bytes[uvIdx];
          
          // YUV to RGB conversion
          const R = Math.max(0, Math.min(255, Y + 1.402 * (V - 128)));
          const G = Math.max(0, Math.min(255, Y - 0.344 * (U - 128) - 0.714 * (V - 128)));
          const B = Math.max(0, Math.min(255, Y + 1.772 * (U - 128)));
          
          const rgbIdx = (y * targetWidth + x) * 3;
          rgbBuffer[rgbIdx] = R;
          rgbBuffer[rgbIdx + 1] = G;
          rgbBuffer[rgbIdx + 2] = B;
        }
      }
      
      // Send to JS thread for inference
      runOnJS((buffer: Uint8Array) => {
        const detectedKeypoints = poseDetector.inferFromRGB(buffer, targetWidth, targetHeight);
        processPoseResults(detectedKeypoints);
      })(rgbBuffer);
      
    } catch (error) {
      console.error('[FrameProcessor] Error:', error);
    }
  }, [isModelLoaded, processPoseResults]);

  // Reset squat counter
  const resetCounter = useCallback(() => {
    squatProcessor.reset();
    setSquatStats(prev => ({ ...prev, reps: 0, stage: 'UP' }));
  }, [squatProcessor]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera permission required</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        fps={30}
      />
      
      {/* Keypoint Overlay */}
      <KeypointOverlay
        keypoints={keypoints}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        style={styles.overlay}
      />
      
      {/* Stats Overlay */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Reps:</Text>
          <Text style={styles.statsValue}>{squatStats.reps}</Text>
          <Text style={styles.statsLabel}>Stage:</Text>
          <Text style={[styles.statsValue, { color: getStageColor(squatStats.stage) }]}>
            {squatStats.stage}
          </Text>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>L Knee:</Text>
          <Text style={styles.statsValue}>{Math.round(squatStats.leftKneeAngle)}°</Text>
          <Text style={styles.statsLabel}>R Knee:</Text>
          <Text style={styles.statsValue}>{Math.round(squatStats.rightKneeAngle)}°</Text>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Depth:</Text>
          <Text style={styles.statsValue}>{(squatStats.depthRatio * 100).toFixed(0)}%</Text>
          <Text style={styles.statsLabel}>Stability:</Text>
          <Text style={styles.statsValue}>{Math.round(squatStats.stability)}%</Text>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>FPS:</Text>
          <Text style={styles.statsValue}>{performanceStats.fps}</Text>
          <Text style={styles.statsLabel}>Inference:</Text>
          <Text style={styles.statsValue}>{performanceStats.avgInferenceTime}ms</Text>
        </View>
        
        {/* Form Feedback */}
        <View style={styles.feedbackContainer}>
          {squatStats.formFeedback.map((feedback, index) => (
            <Text key={index} style={styles.feedbackText}>
              {feedback}
            </Text>
          ))}
        </View>
        
        {/* Model Status */}
        <Text style={[styles.statusText, { color: isModelLoaded ? '#4CAF50' : '#FF9800' }]}>
          {isModelLoaded ? 'Model Loaded' : 'Loading Model...'}
        </Text>
      </View>
      
      {/* Reset Button */}
      <View style={styles.buttonContainer}>
        <Text style={styles.resetButton} onPress={resetCounter}>
          Reset Counter
        </Text>
      </View>
    </View>
  );
};

const getStageColor = (stage: string): string => {
  switch (stage) {
    case 'UP': return '#4CAF50';
    case 'DOWN': return '#FF5722';
    case 'TRANSITION': return '#FF9800';
    default: return '#FFFFFF';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statsContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  statsLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  statsValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  feedbackContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  feedbackText: {
    color: '#FFEB3B',
    fontSize: 12,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    textAlign: 'center',
    overflow: 'hidden',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
});