import { useEffect } from 'react'

// Hook to suppress TensorFlow.js console output during development
export function useTensorFlowSuppression() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Store original console methods
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      // Override console methods to filter TensorFlow.js messages
      console.log = (...args) => {
        const message = args.join(' ');
        // Filter out TensorFlow.js kernel registration messages
        if (
          !message.includes('Platform node has already been set') &&
          !message.includes('kernel') &&
          !message.includes('backend') &&
          !message.includes('already registered') &&
          !message.includes('wasm backend was already registered') &&
          !message.includes('cpu backend was already registered') &&
          !message.includes('The kernel') &&
          !message.includes('for backend') &&
          !message.includes('is already registered')
        ) {
          originalLog(...args);
        }
      };

      console.warn = (...args) => {
        const message = args.join(' ');
        // Filter out TensorFlow.js warnings
        if (
          !message.includes('TensorFlow.js') &&
          !message.includes('backend') &&
          !message.includes('kernel')
        ) {
          originalWarn(...args);
        }
      };

      // Restore original console methods on cleanup
      return () => {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
      };
    }
  }, []);
}
