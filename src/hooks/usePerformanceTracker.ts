import { useEffect, useRef } from 'react';
import { performanceMonitor } from '../lib/performanceMonitor';

/**
 * Tracks component mount time and render durations
 * @param componentName The name of the component to measure
 */
export function useTrackRender(componentName: string) {
  const startTimeRef = useRef<number>(performance.now());
  const isInitialMount = useRef<boolean>(true);

  useEffect(() => {
    const elapsedMs = performance.now() - startTimeRef.current;
    performanceMonitor.trackComponentMount(componentName, elapsedMs);

    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  });
}
