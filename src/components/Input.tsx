import { useId, useState, type ComponentProps } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

export function Input({
  label,
  description,
  success,
  error,
  'aria-describedby': describedBy,
  className,
  ...props
}: ComponentProps<'input'> & {
  label: string;
  description?: string;
  success?: boolean;
  error?: string;
}) {
  const id = useId();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = props.type === 'password';
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  return (
    <div
      className={[
        'input',
        isPassword && 'input--password',
        success && 'input--success',
        error && 'input--error',
        props.disabled && 'input--disabled',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <label htmlFor={id} className="input__label">
        {label}
      </label>
      <div className="input__field-wrapper">
        <input
          {...props}
          type={isPassword && passwordVisible ? 'text' : props.type}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [
              describedBy,
              description ? descriptionId : undefined,
              error ? errorId : undefined,
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className="input__field"
        />
        {isPassword ? (
          <Button
            type="button"
            disabled={props.disabled}
            aria-controls={id}
            aria-label={`${passwordVisible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
            onClick={() => setPasswordVisible((visible) => !visible)}
            className="input__icon-wrapper"
          >
            {passwordVisible ? (
              <Icon name="open-eye" className="input__icon-wrapper-icon" />
            ) : (
              <Icon name="close-eye" className="input__icon-wrapper-icon" />
            )}
          </Button>
        ) : error ? (
          <span className="input__icon-wrapper input__icon-wrapper--error">
            <Icon name="close" className="input__icon-wrapper-icon" />
          </span>
        ) : success ? (
          <span className="input__icon-wrapper input__icon-wrapper--success">
            <Icon name="check" className="input__icon-wrapper-icon" />
          </span>
        ) : null}
      </div>
      {description && (
        <p id={descriptionId} className="input__description">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="input__error">
          {error}
        </p>
      )}
    </div>
  );
}
