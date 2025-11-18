import { useEffect, useReducer } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const usePageTransition = () => {
  const moveOutTransition = useSharedValue(0);
  const fadeOutTransition = useSharedValue(1);
  // const fadeInTransition = useSharedValue(0);
  // const moveInTransition =
  const [toggled, toggle] = useReducer(prev => !prev, false);

  useEffect(() => {
    const timer = 1000;
    if (toggled) {
      moveOutTransition.value = withTiming(-100, { duration: timer });
      fadeOutTransition.value = withTiming(0, { duration: timer });
    }
  }, [fadeOutTransition, moveOutTransition, toggled]);
  const pageTransition = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: moveOutTransition.value }],
      opacity: fadeOutTransition.value,
      display: fadeOutTransition.value === 0 ? 'none' : 'flex',
    };
  });
  const page2Transition = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: 100 + moveOutTransition.value }],
      opacity: 1 - fadeOutTransition.value,
      display: fadeOutTransition.value === 1 ? 'none' : 'flex',
    };
  });
  return {
    exitTransition: pageTransition,
    enterTransition: page2Transition,
    toggle,
    isToggled: toggled,
  };
};

export default usePageTransition;
