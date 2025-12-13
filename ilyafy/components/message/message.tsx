import React, { useEffect } from 'react';
import Animated, {
  FadeInLeft,
  FadeInUp,
  FadeOutRight,
  FadeOutUp,
} from 'react-native-reanimated';
import useMessage from '../../store/useMessage';
import useDeviceSetting from '../../store/useDeviceSetting';

const Message = () => {
  const { message, setMessage } = useMessage();
  const colors = useDeviceSetting(s => s.colors);
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
          backgroundColor: colors.accent,
        }}
      >
        <Animated.Text
          entering={FadeInLeft.duration(500)}
          exiting={FadeOutRight.duration(500)}
          className={`font-semibold text-center`}
          style={{
            color: colors.text,
          }}
        >
          {message}
        </Animated.Text>
      </Animated.View>
    );
  else return null;
};

export default Message;
