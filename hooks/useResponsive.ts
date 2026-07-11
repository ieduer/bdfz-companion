import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // Android/iOS 標準平板界限值通常為 600 dp
  const isTablet = width >= 600;

  return {
    width,
    height,
    isTablet,
    isPhone: !isTablet,
  };
}
