import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Helper function to format time
const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const ms = milliseconds % 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');
  const padMs = (num: number) => num.toString().padStart(3, '0').slice(0, 2); // Show only two digits for milliseconds

  return {
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    milliseconds: padMs(ms),
  };
};

type Lap = {
  id: number;
  time: number;
};

export default function StopwatchScreen() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  // CORRECTED LINE: Change NodeJS.Timeout to number
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastLapTimeRef = useRef<number>(0);

  // Animated values for button presses (optional, for a subtle effect)
  const startButtonScale = useSharedValue(1);
  const stopButtonScale = useSharedValue(1);
  const resetButtonScale = useSharedValue(1);
  const lapButtonScale = useSharedValue(1);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startStopwatch = () => {
    setIsRunning(true);
    startTimeRef.current = Date.now() - time; // Adjust for resume
    if (laps.length === 0) {
      lastLapTimeRef.current = 0; // Reset last lap time when starting fresh
    }

    intervalRef.current = setInterval(() => {
      setTime(Date.now() - startTimeRef.current);
    }, 10); // Update every 10 milliseconds for smooth millisecond display

    // Button animation
    startButtonScale.value = withTiming(0.95, { duration: 100 });
    setTimeout(() => {
      startButtonScale.value = withTiming(1, { duration: 100 });
    }, 100);
  };

  const stopStopwatch = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    console.log('Stopwatch stopped at:', formatTime(time));

    // Button animation
    stopButtonScale.value = withTiming(0.95, { duration: 100 });
    setTimeout(() => {
      stopButtonScale.value = withTiming(1, { duration: 100 });
    }, 100);
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTime(0);
    setLaps([]);
    startTimeRef.current = 0;
    lastLapTimeRef.current = 0;

    // Button animation
    resetButtonScale.value = withTiming(0.95, { duration: 100 });
    setTimeout(() => {
      resetButtonScale.value = withTiming(1, { duration: 100 });
    }, 100);
  };

  const recordLap = () => {
    if (isRunning) {
      const currentLapTime = time - lastLapTimeRef.current;
      setLaps(prevLaps => [...prevLaps, { id: prevLaps.length + 1, time: currentLapTime }]);
      lastLapTimeRef.current = time; // Update last lap time for the next lap

      // Button animation
      lapButtonScale.value = withTiming(0.95, { duration: 100 });
      setTimeout(() => {
        lapButtonScale.value = withTiming(1, { duration: 100 });
      }, 100);
    }
  };

  const formattedTime = formatTime(time);

  const animatedStartButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: startButtonScale.value }],
    };
  });

  const animatedStopButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: stopButtonScale.value }],
    };
  });

  const animatedResetButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: resetButtonScale.value }],
    };
  });

  const animatedLapButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: lapButtonScale.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          {formattedTime.hours}:{formattedTime.minutes}:{formattedTime.seconds}.
          <Text style={styles.millisecondsText}>{formattedTime.milliseconds}</Text>
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {!isRunning && time === 0 && (
          <Animated.View style={[styles.buttonWrapper, animatedStartButtonStyle]}>
            <TouchableOpacity
              onPress={startStopwatch}
              style={[styles.button, styles.startButton]}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {isRunning && (
          <Animated.View style={[styles.buttonWrapper, animatedStopButtonStyle]}>
            <TouchableOpacity
              onPress={stopStopwatch}
              style={[styles.button, styles.stopButton]}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {!isRunning && time > 0 && (
          <Animated.View style={[styles.buttonWrapper, animatedStartButtonStyle]}>
            <TouchableOpacity
              onPress={startStopwatch}
              style={[styles.button, styles.resumeButton]}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Resume</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View style={[styles.buttonWrapper, animatedResetButtonStyle]}>
          <TouchableOpacity
            onPress={resetStopwatch}
            style={[styles.button, styles.resetButton]}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, animatedLapButtonStyle]}>
          <TouchableOpacity
            onPress={recordLap}
            style={[styles.button, styles.lapButton, !isRunning && styles.lapButtonDisabled]}
            activeOpacity={isRunning ? 0.7 : 1}
            disabled={!isRunning}
          >
            <Text style={[styles.buttonText, !isRunning && styles.lapButtonTextDisabled]}>Lap</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ScrollView style={styles.lapsContainer}>
        {laps
          .slice()
          .reverse()
          .map(lap => {
            // Reverse to show latest lap at top
            const lapFormattedTime = formatTime(lap.time);
            return (
              <View key={lap.id} style={styles.lapItem}>
                <Text style={styles.lapNumber}>Lap {lap.id}</Text>
                <Text style={styles.lapTime}>
                  {lapFormattedTime.hours}:{lapFormattedTime.minutes}:{lapFormattedTime.seconds}.
                  <Text style={styles.millisecondsTextSmall}>{lapFormattedTime.milliseconds}</Text>
                </Text>
              </View>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e', // Deep Space Blue
    alignItems: 'center',
    paddingTop: 50,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 70,
    fontWeight: '300',
    color: '#e0f2f7', // Light Blue/White
    fontFamily: 'Menlo-Regular', // Monospaced font for digits
  },
  millisecondsText: {
    fontSize: 40,
    color: '#e0f2f7',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  buttonWrapper: {
    borderRadius: 80,
    overflow: 'hidden',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  startButton: {
    backgroundColor: '#4CAF50', // Green
  },
  stopButton: {
    backgroundColor: '#F44336', // Red
  },
  resumeButton: {
    backgroundColor: '#FFC107', // Amber for Resume
  },
  resetButton: {
    backgroundColor: '#9E9E9E', // Grey
  },
  lapButton: {
    backgroundColor: '#2196F3', // Blue
  },
  lapButtonDisabled: {
    backgroundColor: '#7cb3ef', // Lighter blue for disabled
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lapButtonTextDisabled: {
    color: '#c5e2ff',
  },
  lapsContainer: {
    flex: 2,
    width: '90%',
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a4e', // Slightly darker blue
  },
  lapNumber: {
    color: '#e0f2f7',
    fontSize: 20,
  },
  lapTime: {
    color: '#e0f2f7',
    fontSize: 20,
    fontFamily: 'Menlo-Regular',
  },
  millisecondsTextSmall: {
    fontSize: 16,
    color: '#e0f2f7',
  },
});
