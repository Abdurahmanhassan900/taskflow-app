import React, { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'small' | 'normal' | 'large';
}

const paddingClasses = {
  none: 'p-0',
  small: 'p-3',
  normal: 'p-4',
  large: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'normal',
  className = '',
  ...props
}) => {
  const classes = `bg-bg-light shadow-md rounded-lg border border-border ${paddingClasses[padding]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};
