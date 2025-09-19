/**
 * KeypointOverlay - Renders pose keypoints as colored dots over the camera view
 * Focuses on hip/knee/ankle points for squat detection visualization
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Keypoint } from '../logic/SquatProcessor';

interface KeypointOverlayProps {
  keypoints: (Keypoint | null)[];
  screenWidth: number;
  screenHeight: number;
  style?: ViewStyle;
}

export const KeypointOverlay: React.FC<KeypointOverlayProps> = ({
  keypoints,
  screenWidth,
  screenHeight,
  style,
}) => {
  // MediaPipe indices for lower body keypoints we care about
  const lowerBodyIndices = {
    23: { name: 'left_hip', color: '#FF5722' },      // red
    24: { name: 'right_hip', color: '#FF5722' },     // red
    25: { name: 'left_knee', color: '#4CAF50' },     // green
    26: { name: 'right_knee', color: '#4CAF50' },    // green
    27: { name: 'left_ankle', color: '#2196F3' },    // blue
    28: { name: 'right_ankle', color: '#2196F3' },   // blue
  };

  const renderKeypoint = (keypoint: Keypoint | null, index: number) => {
    if (!keypoint || keypoint.score < 0.2) return null;
    
    const config = lowerBodyIndices[index as keyof typeof lowerBodyIndices];
    if (!config) return null;

    // Convert normalized coordinates (0-1) to screen coordinates
    // Note: MoveNet outputs are in [y, x] format
    const screenX = keypoint.x * screenWidth;
    const screenY = keypoint.y * screenHeight;

    // Ensure coordinates are within screen bounds
    if (screenX < 0 || screenX > screenWidth || screenY < 0 || screenY > screenHeight) {
      return null;
    }

    return (
      <View
        key={`keypoint-${index}-${config.name}`}
        style={[
          styles.keypoint,
          {
            left: screenX - 8, // Center the dot (radius = 8)
            top: screenY - 8,
            backgroundColor: config.color,
            opacity: Math.min(1.0, keypoint.score * 2), // Fade based on confidence
          },
        ]}
      />
    );
  };

  const renderSkeleton = () => {
    // Optional: Draw skeleton lines between connected joints
    const connections = [
      [23, 25], // left hip -> left knee
      [25, 27], // left knee -> left ankle
      [24, 26], // right hip -> right knee
      [26, 28], // right knee -> right ankle
      [23, 24], // left hip -> right hip
    ];

    return connections.map(([startIdx, endIdx], connectionIndex) => {
      const startPoint = keypoints[startIdx];
      const endPoint = keypoints[endIdx];

      if (!startPoint || !endPoint || 
          startPoint.score < 0.3 || endPoint.score < 0.3) {
        return null;
      }

      const startX = startPoint.x * screenWidth;
      const startY = startPoint.y * screenHeight;
      const endX = endPoint.x * screenWidth;
      const endY = endPoint.y * screenHeight;

      // Calculate line properties
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      return (
        <View
          key={`skeleton-${connectionIndex}`}
          style={[
            styles.skeletonLine,
            {
              left: startX,
              top: startY - 1, // Center the line
              width: distance,
              transform: [{ rotate: `${angle}deg` }],
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {/* Render skeleton lines first (so they appear behind dots) */}
      {renderSkeleton()}
      
      {/* Render keypoints */}
      {keypoints.map((keypoint, index) => renderKeypoint(keypoint, index))}
      
      {/* Debug info - show total detected keypoints */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <View style={styles.debugText}>
            {/* Uncomment to show debug info */}
            {/* <Text style={{ color: 'white', fontSize: 10 }}>
              Detected: {keypoints.filter(kp => kp && kp.score > 0.2).length}/6
            </Text> */}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  keypoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4, // Android shadow
  },
  skeletonLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transformOrigin: '0 50%', // Rotate around start point
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  debugContainer: {
    position: 'absolute',
    bottom: 120,
    right: 20,
  },
  debugText: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 3,
  },
});