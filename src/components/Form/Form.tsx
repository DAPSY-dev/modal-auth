import type { ComponentProps } from 'react';

export type FormProps = ComponentProps<'form'>;

export function Form({ className, ...props }: FormProps) {
  return (
    <form
      {...props}
      className={['form', className].filter(Boolean).join(' ')}
    />
  );
}
