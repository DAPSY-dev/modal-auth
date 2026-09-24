import type { ComponentProps } from 'react';

export type WrapperProps = ComponentProps<'div'>;

export function Wrapper({ className, ...props }: WrapperProps) {
  return (
    <div
      {...props}
      className={['wrapper', className].filter(Boolean).join(' ')}
    />
  );
}
