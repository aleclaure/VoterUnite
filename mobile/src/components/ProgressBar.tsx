import React from 'react';
import { View, StyleSheet } from 'react-native';
import { lightColors } from '../config/theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
}

export default function ProgressBar({ 
  progress, 
  color = lightColors.primary,
  height = 8 
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <View style={[styles.container, { height }]}>
      <View 
        style={[
          styles.fill, 
          { 
            width: `${clampedProgress}%`, 
            backgroundColor: color,
            height 
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: lightColors.background,
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
});
