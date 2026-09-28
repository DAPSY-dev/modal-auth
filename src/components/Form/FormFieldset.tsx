import type { ComponentProps } from 'react';

export type FormFieldsetProps = ComponentProps<'fieldset'>;

export function FormFieldset({ className, ...props }: FormFieldsetProps) {
  return (
    <fieldset
      {...props}
      className={['form-fieldset', className].filter(Boolean).join(' ')}
    />
  );
}
