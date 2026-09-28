import type { ComponentProps } from 'react';

export type StackProps = ComponentProps<'div'> & {
  size?: 's' | 'm' | 'l';
};

export function Stack({ size, className, ...props }: StackProps) {
  return (
    <div
      {...props}
      className={['stack', size && `stack--${size}`, className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
