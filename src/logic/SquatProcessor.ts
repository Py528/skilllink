/**
 * SquatProcessor - Analyzes pose landmarks to count squats and provide form feedback
 * Ported from Python implementation with MediaPipe landmark indices
 */

export interface Keypoint {
  x: number;
  y: number;
  score: number;
}

export interface SquatStats {
  reps: number;
  stage: 'UP' | 'DOWN' | 'TRANSITION';
  leftKneeAngle: number;
  rightKneeAngle: number;
  depthRatio: number;
  stability: number;
  formFeedback: string[];
}

export class SquatProcessor {
  private reps = 0;
  private stage: 'UP' | 'DOWN' | 'TRANSITION' = 'UP';
  private lastStage: 'UP' | 'DOWN' | 'TRANSITION' = 'UP';
  private stageHistory: ('UP' | 'DOWN' | 'TRANSITION')[] = [];
  private readonly historyLength = 5;
  
  // Thresholds
  private readonly downAngleThreshold = 90; // degrees
  private readonly upAngleThreshold = 160; // degrees
  private readonly minDepthRatio = 0.7; // minimum depth for valid squat
  private readonly stabilityThreshold = 10; // max angle variation for stability

  constructor() {
    this.reset();
  }

  reset(): void {
    this.reps = 0;
    this.stage = 'UP';
    this.lastStage = 'UP';
    this.stageHistory = [];
  }

  /**
   * Calculate angle between three points
   */
  private calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  }

  /**
   * Calculate depth ratio (how deep the squat is)
   */
  private calculateDepthRatio(hip: Keypoint, knee: Keypoint, ankle: Keypoint): number {
    const hipKneeDistance = Math.sqrt(Math.pow(hip.x - knee.x, 2) + Math.pow(hip.y - knee.y, 2));
    const kneeAnkleDistance = Math.sqrt(Math.pow(knee.x - ankle.x, 2) + Math.pow(knee.y - ankle.y, 2));
    
    if (hipKneeDistance === 0) return 0;
    return kneeAnkleDistance / hipKneeDistance;
  }

  /**
   * Calculate stability based on angle variation
   */
  private calculateStability(leftAngle: number, rightAngle: number): number {
    const angleDifference = Math.abs(leftAngle - rightAngle);
    return Math.max(0, 100 - (angleDifference / this.stabilityThreshold) * 100);
  }

  /**
   * Generate form feedback based on current pose
   */
  private generateFormFeedback(stats: SquatStats): string[] {
    const feedback: string[] = [];
    
    if (stats.depthRatio < this.minDepthRatio) {
      feedback.push('Go deeper - squat below parallel');
    }
    
    if (stats.stability < 70) {
      feedback.push('Keep knees aligned - reduce wobble');
    }
    
    const avgAngle = (stats.leftKneeAngle + stats.rightKneeAngle) / 2;
    if (stats.stage === 'DOWN' && avgAngle > 100) {
      feedback.push('Bend knees more for full squat');
    }
    
    if (Math.abs(stats.leftKneeAngle - stats.rightKneeAngle) > 20) {
      feedback.push('Balance both legs equally');
    }
    
    if (feedback.length === 0) {
      feedback.push('Good form!');
    }
    
    return feedback;
  }

  /**
   * Process pose landmarks and update squat stats
   * MediaPipe indices: 23=left_hip, 24=right_hip, 25=left_knee, 26=right_knee, 27=left_ankle, 28=right_ankle
   */
  processLandmarks(landmarks: (Keypoint | null)[]): SquatStats {
    // Extract required landmarks (MediaPipe indices)
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    // Check if all required landmarks are detected with sufficient confidence
    const minConfidence = 0.5;
    const requiredLandmarks = [leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle];
    const allDetected = requiredLandmarks.every(lm => lm && lm.score > minConfidence);

    if (!allDetected) {
      return {
        reps: this.reps,
        stage: this.stage,
        leftKneeAngle: 0,
        rightKneeAngle: 0,
        depthRatio: 0,
        stability: 0,
        formFeedback: ['Position yourself in camera view']
      };
    }

    // Calculate knee angles
    const leftKneeAngle = this.calculateAngle(leftHip!, leftKnee!, leftAnkle!);
    const rightKneeAngle = this.calculateAngle(rightHip!, rightKnee!, rightAnkle!);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

    // Calculate depth ratio (using left side as reference)
    const depthRatio = this.calculateDepthRatio(leftHip!, leftKnee!, leftAnkle!);

    // Calculate stability
    const stability = this.calculateStability(leftKneeAngle, rightKneeAngle);

    // Determine current stage based on knee angle
    let currentStage: 'UP' | 'DOWN' | 'TRANSITION' = this.stage;
    
    if (avgKneeAngle < this.downAngleThreshold) {
      currentStage = 'DOWN';
    } else if (avgKneeAngle > this.upAngleThreshold) {
      currentStage = 'UP';
    } else {
      currentStage = 'TRANSITION';
    }

    // Update stage history for smoothing
    this.stageHistory.push(currentStage);
    if (this.stageHistory.length > this.historyLength) {
      this.stageHistory.shift();
    }

    // Count reps based on stage transitions
    if (this.lastStage === 'UP' && currentStage === 'DOWN' && depthRatio >= this.minDepthRatio) {
      // Started going down with sufficient depth
      this.stage = 'DOWN';
    } else if (this.lastStage === 'DOWN' && currentStage === 'UP') {
      // Completed the squat
      this.reps++;
      this.stage = 'UP';
    } else if (currentStage !== 'TRANSITION') {
      this.stage = currentStage;
    }

    this.lastStage = this.stage;

    const stats: SquatStats = {
      reps: this.reps,
      stage: this.stage,
      leftKneeAngle,
      rightKneeAngle,
      depthRatio,
      stability,
      formFeedback: []
    };

    // Generate form feedback
    stats.formFeedback = this.generateFormFeedback(stats);

    return stats;
  }
}