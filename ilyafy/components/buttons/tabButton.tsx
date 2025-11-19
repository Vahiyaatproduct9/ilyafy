import React from 'react';
import Button from './button1';
import theme from '../../data/color/theme';

const TabButton = ({ label, ...rest }: { label: string }) => {
  return (
    <Button
      containerStyle={{
        backgroundColor: theme.accent,
      }}
      containerClassName="min-w-28 rounded-2xl justify-center items-center p-3"
      textStyle={{
        color: theme.text,
      }}
      label={label}
      {...rest}
    />
  );
};

export default TabButton;
