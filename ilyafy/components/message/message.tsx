import React, { useEffect } from 'react';
import Animated, {
  FadeInLeft,
  FadeInUp,
  FadeOutRight,
  FadeOutUp,
} from 'react-native-reanimated';
import theme from '../../data/color/theme';
import useMessage from '../../store/useMessage';

const Message = () => {
  const { message, setMessage } = useMessage();
  useEffect(() => {
    if (message.length > 0) {
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  }, [message.length, setMessage]);
  if (message.length > 0)
    return (
      <Animated.View
        entering={FadeInUp.duration(250)}
        exiting={FadeOutUp.duration(250)}
        className={'absolute top-2 w-[95%] self-center rounded-2xl z-50 p-5'}
        style={{
          backgroundColor: theme.accent,
        }}
      >
        <Animated.Text
          entering={FadeInLeft.duration(500)}
          exiting={FadeOutRight.duration(500)}
          className={`font-semibold text-center`}
          style={{
            color: theme.text,
          }}
        >
          {message}
        </Animated.Text>
      </Animated.View>
    );
  else return null;
};

export default Message;
