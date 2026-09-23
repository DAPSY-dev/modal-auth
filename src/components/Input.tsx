import { useId, type ComponentProps } from 'react';

export function Input({ label, ...props }: ComponentProps<'input'> & { label: string }) {
  const id = useId();
  return <div><label htmlFor={id}>{label}</label><input {...props} id={id} /></div>;
}
