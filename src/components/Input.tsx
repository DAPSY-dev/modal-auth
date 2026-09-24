import { useId, useState, type ComponentProps } from 'react';
import { Button } from './Button';

export function Input({
  label,
  error,
  'aria-describedby': describedBy,
  ...props
}: ComponentProps<'input'> & { label: string; error?: string }) {
  const id = useId();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = props.type === 'password';
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        {...props}
        type={isPassword && passwordVisible ? 'text' : props.type}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [describedBy, error ? errorId : undefined]
            .filter(Boolean)
            .join(' ') || undefined
        }
      />
      {isPassword && (
        <Button
          type="button"
          disabled={props.disabled}
          aria-controls={id}
          aria-label={`${passwordVisible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          onClick={() => setPasswordVisible((visible) => !visible)}
        >
          {passwordVisible ? 'Hide' : 'Show'}
        </Button>
      )}
      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
