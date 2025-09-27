# MoveNet Squat Counter - React Native

A complete React Native implementation of offline pose detection using MoveNet SINGLEPOSE_LIGHTNING (TensorFlow Lite) for real-time squat counting and form analysis.

## Features

- 🏃‍♀️ **Real-time pose detection** using MoveNet TensorFlow Lite model
- 📱 **Offline processing** - no internet required
- 🎯 **Squat counting** with form analysis and feedback
- 📊 **Performance metrics** - FPS and inference timing
- 🎨 **Visual overlay** with keypoint visualization
- 🔧 **Extensive debugging** logs for troubleshooting

## Project Structure

```
src/
├── logic/
│   └── SquatProcessor.ts      # Squat counting and form analysis logic
├── pose/
│   └── TFLitePoseDetector.ts  # TensorFlow Lite model integration
├── screens/
│   └── SquatCounter.tsx       # Main camera screen with UI
└── components/
    └── KeypointOverlay.tsx    # Pose keypoints visualization
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Download MoveNet Model

Download the MoveNet SINGLEPOSE_LIGHTNING model:

```bash
curl -L -o android/app/src/main/assets/movenet_singlepose_lightning.tflite https://storage.googleapis.com/tfhub-lite-models/google/lite-model/movenet/singlepose/lightning/3.tflite
```

### 3. Android Setup

Ensure you have:
- Android SDK with API level 21+
- Java 17+ (for React Native 0.73+)
- Android NDK

Set your JAVA_HOME:
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

### 4. Build and Run

Clean and build:
```bash
cd android && ./gradlew clean
cd .. && npx react-native run-android
```

## Key Dependencies

- **react-native-vision-camera**: Camera access and frame processing
- **react-native-worklets-core**: High-performance frame processing in worklets
- **react-native-fast-tflite**: TensorFlow Lite model inference

## How It Works

### Pipeline Overview

1. **Camera Capture**: VisionCamera captures frames at 30fps
2. **Frame Processing**: Worklet converts YUV420 → RGB and downscales to 192×192
3. **Model Inference**: TensorFlow Lite processes RGB input to detect 17 keypoints
4. **Squat Analysis**: SquatProcessor analyzes hip/knee/ankle angles for counting
5. **Visualization**: KeypointOverlay draws detected points and skeleton

### Key Components

#### TFLitePoseDetector
- Handles model loading with multiple fast-tflite API attempts
- Preprocesses RGB data (resize + normalize to [-1,1])
- Parses MoveNet output format [1,17,3] → [y,x,score]
- Maps to MediaPipe indices for compatibility

#### SquatProcessor
- Calculates knee angles using hip-knee-ankle points
- Tracks squat stages (UP/DOWN/TRANSITION)
- Provides form feedback (depth, stability, alignment)
- Counts valid reps based on angle thresholds

#### Frame Processor Worklet
- Runs on camera thread for optimal performance
- YUV→RGB conversion with device-specific plane handling
- Downscales to reduce JS bridge payload
- Handles different Android YUV formats (I420, NV21)

## Troubleshooting

### Model Loading Issues

If you see "no supported loader" error:

1. Check the console for: `fast-tflite keys: [...]`
2. Share this output - the loader will be adapted to your exact fast-tflite version

### No Keypoints Visible

Common causes and fixes:

1. **Lighting**: Ensure good lighting conditions
2. **YUV Format**: Your device may use NV21 vs I420 - swap U/V planes if needed
3. **Input Type**: Model may expect uint8 [0,255] vs float32 [-1,1]
4. **Confidence**: Lower threshold from 0.2 to 0.1 in KeypointOverlay

### Performance Issues

- Target device: Android API 21+ with decent CPU
- Expected: 15-30 FPS with 20-50ms inference time
- Reduce camera resolution if needed

## Debug Logging

The implementation includes extensive logging:

- **Model Loading**: Available fast-tflite functions
- **Performance**: FPS and inference timing
- **Keypoints**: First few detected points (uncomment in TFLitePoseDetector)
- **Frame Processing**: YUV plane metadata

## Form Analysis

The squat counter analyzes:

- **Knee Angles**: Left/right knee bend (target: <90° for "down")
- **Depth Ratio**: Hip-to-knee vs knee-to-ankle distance
- **Stability**: Symmetry between left/right sides
- **Stage Tracking**: UP → DOWN → UP transitions for rep counting

## Next Steps

Optional enhancements you can add:

- [ ] iOS support (bundle model in Xcode)
- [ ] Adjustable confidence thresholds
- [ ] All 17 keypoint visualization toggle
- [ ] Rep history and analytics
- [ ] Custom exercise types beyond squats

## License

MIT License - feel free to use and modify for your projects.