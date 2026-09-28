import type { ComponentProps } from 'react';

export type FormErrorProps = ComponentProps<'p'>;

export function FormError({ className, ...props }: FormErrorProps) {
  return (
    <p
      role="alert"
      {...props}
      className={['form-error', className].filter(Boolean).join(' ')}
    />
  );
}
