/**
 * TFLitePoseDetector - MoveNet SINGLEPOSE_LIGHTNING inference with react-native-fast-tflite
 * Handles preprocessing, model inference, and output parsing
 */

import { Keypoint } from '../logic/SquatProcessor';

interface TFLiteModel {
  runSync: (inputs: any[]) => any;
  dispose: () => void;
}

interface InputTensor {
  shape: number[];
  data: Float32Array | Uint8Array;
  type?: string;
}

export class TFLitePoseDetector {
  private model: TFLiteModel | null = null;
  private lastInferenceTime = 0;
  private frameCount = 0;
  private startTime = Date.now();

  constructor() {
    console.log('[TFLitePoseDetector] Initialized');
  }

  /**
   * Set the loaded TFLite model
   */
  setModel(model: TFLiteModel): void {
    this.model = model;
    console.log('[TFLitePoseDetector] Model set successfully');
  }

  /**
   * Get performance stats
   */
  getStats(): { fps: number; avgInferenceTime: number } {
    const now = Date.now();
    const elapsed = (now - this.startTime) / 1000;
    const fps = this.frameCount / elapsed;
    
    return {
      fps: Math.round(fps * 10) / 10,
      avgInferenceTime: this.lastInferenceTime
    };
  }

  /**
   * Main inference function - takes RGB buffer and returns keypoints
   */
  inferFromRGB(rgbBuffer: Uint8Array, width: number, height: number): Keypoint[] {
    if (!this.model) {
      console.warn('[TFLitePoseDetector] No model loaded');
      return [];
    }

    const startTime = performance.now();

    try {
      // Preprocess: resize and normalize to model input format
      const inputTensor = this.preprocessResizeNormalize(rgbBuffer, width, height);
      
      // Run inference
      const outputs = this.model.runSync([inputTensor]);
      
      // Parse outputs to keypoints
      const keypoints = this.parseMoveNetOutputs(outputs);
      
      // Map to MediaPipe indices (only hip/knee/ankle for squat detection)
      const mappedKeypoints = this.mapMoveNetToMediaPipe(keypoints);
      
      this.lastInferenceTime = Math.round(performance.now() - startTime);
      this.frameCount++;
      
      // Debug: uncomment to log first few keypoints
      // console.log('[MoveNet] kp0-2', mappedKeypoints.slice(0, 3));
      
      return mappedKeypoints;
      
    } catch (error) {
      console.error('[TFLitePoseDetector] Inference error:', error);
      return [];
    }
  }

  /**
   * Preprocess RGB buffer: resize to 192x192 and normalize to [-1, 1]
   */
  private preprocessResizeNormalize(rgbBuffer: Uint8Array, width: number, height: number): InputTensor {
    // Resize to 192x192 (MoveNet input size)
    const targetSize = 192;
    const resizedRGB = this.resizeRGBNN(rgbBuffer, width, height, targetSize, targetSize);
    
    // Normalize to [-1, 1] range (float32)
    const normalizedData = new Float32Array(targetSize * targetSize * 3);
    for (let i = 0; i < resizedRGB.length; i++) {
      normalizedData[i] = (resizedRGB[i] / 127.5) - 1.0;
    }
    
    return {
      shape: [1, targetSize, targetSize, 3],
      data: normalizedData,
      type: 'float32'
    };
  }

  /**
   * Parse MoveNet outputs - expects [1, 17, 3] with [y, x, score]
   */
  private parseMoveNetOutputs(outputs: any): Keypoint[] {
    try {
      // Handle different output formats from different fast-tflite versions
      let outputData: Float32Array;
      
      if (Array.isArray(outputs)) {
        outputData = outputs[0];
      } else if (outputs.data) {
        outputData = outputs.data;
      } else {
        outputData = outputs;
      }
      
      // Debug: log output structure (uncomment if needed)
      // const sample = Array.isArray(outputs) ? outputs[0] : outputs;
      // console.log('[MoveNet] raw out type:', typeof sample, 'keys:', sample && Object.keys(sample));
      // console.log('[MoveNet] raw out sample:', sample);
      
      if (!outputData || outputData.length !== 51) { // 17 keypoints * 3 values
        console.warn('[TFLitePoseDetector] Unexpected output format, length:', outputData?.length);
        return [];
      }
      
      const keypoints: Keypoint[] = [];
      
      // Parse 17 keypoints: [y, x, score]
      for (let i = 0; i < 17; i++) {
        const baseIdx = i * 3;
        keypoints.push({
          y: outputData[baseIdx],     // y coordinate (normalized 0-1)
          x: outputData[baseIdx + 1], // x coordinate (normalized 0-1)
          score: outputData[baseIdx + 2] // confidence score
        });
      }
      
      return keypoints;
      
    } catch (error) {
      console.error('[TFLitePoseDetector] Error parsing outputs:', error);
      return [];
    }
  }

  /**
   * Map MoveNet 17 keypoints to MediaPipe format (33 keypoints)
   * Only fills indices 23-28 (hips, knees, ankles) for squat detection
   */
  private mapMoveNetToMediaPipe(moveNetKeypoints: Keypoint[]): (Keypoint | null)[] {
    // Initialize 33-element array (MediaPipe format) with nulls
    const mediaPipeKeypoints: (Keypoint | null)[] = new Array(33).fill(null);
    
    if (moveNetKeypoints.length !== 17) {
      return mediaPipeKeypoints;
    }
    
    // MoveNet to MediaPipe mapping for lower body
    const mapping = {
      11: 23, // left_hip
      12: 24, // right_hip
      13: 25, // left_knee
      14: 26, // right_knee
      15: 27, // left_ankle
      16: 28  // right_ankle
    };
    
    // Map the relevant keypoints
    for (const [moveNetIdx, mediaPipeIdx] of Object.entries(mapping)) {
      const keypoint = moveNetKeypoints[parseInt(moveNetIdx)];
      if (keypoint && keypoint.score > 0.1) { // minimum confidence threshold
        mediaPipeKeypoints[mediaPipeIdx] = keypoint;
      }
    }
    
    return mediaPipeKeypoints;
  }

  /**
   * Resize RGB buffer using nearest neighbor interpolation
   */
  private resizeRGBNN(
    srcBuffer: Uint8Array,
    srcWidth: number,
    srcHeight: number,
    dstWidth: number,
    dstHeight: number
  ): Uint8Array {
    const dstBuffer = new Uint8Array(dstWidth * dstHeight * 3);
    
    const scaleX = srcWidth / dstWidth;
    const scaleY = srcHeight / dstHeight;
    
    for (let dstY = 0; dstY < dstHeight; dstY++) {
      for (let dstX = 0; dstX < dstWidth; dstX++) {
        const srcX = Math.floor(dstX * scaleX);
        const srcY = Math.floor(dstY * scaleY);
        
        const srcIdx = (srcY * srcWidth + srcX) * 3;
        const dstIdx = (dstY * dstWidth + dstX) * 3;
        
        dstBuffer[dstIdx] = srcBuffer[srcIdx];         // R
        dstBuffer[dstIdx + 1] = srcBuffer[srcIdx + 1]; // G
        dstBuffer[dstIdx + 2] = srcBuffer[srcIdx + 2]; // B
      }
    }
    
    return dstBuffer;
  }

  /**
   * Helper function for YUV420 to RGB conversion (if needed outside worklet)
   */
  yuv420ToRGB(
    yBuffer: Uint8Array,
    uBuffer: Uint8Array,
    vBuffer: Uint8Array,
    width: number,
    height: number,
    uvPixelStride: number
  ): Uint8Array {
    const rgbBuffer = new Uint8Array(width * height * 3);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const yIdx = y * width + x;
        const uvIdx = Math.floor(y / 2) * Math.floor(width / 2) + Math.floor(x / 2);
        
        const Y = yBuffer[yIdx];
        const U = uBuffer[uvIdx * uvPixelStride];
        const V = vBuffer[uvIdx * uvPixelStride];
        
        // YUV to RGB conversion
        const R = Math.max(0, Math.min(255, Y + 1.402 * (V - 128)));
        const G = Math.max(0, Math.min(255, Y - 0.344 * (U - 128) - 0.714 * (V - 128)));
        const B = Math.max(0, Math.min(255, Y + 1.772 * (U - 128)));
        
        const rgbIdx = yIdx * 3;
        rgbBuffer[rgbIdx] = R;
        rgbBuffer[rgbIdx + 1] = G;
        rgbBuffer[rgbIdx + 2] = B;
      }
    }
    
    return rgbBuffer;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}