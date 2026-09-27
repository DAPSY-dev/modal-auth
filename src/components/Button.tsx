import type { ComponentProps } from 'react';
import { Icon } from './Icon';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  loading?: boolean;
};

export function Button({
  type = 'button',
  className,
  variant,
  size,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[
        'button',
        variant && `button--${variant}`,
        size && `button--${size}`,
        loading && 'button--loading',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        aria-hidden="true"
        className="button__decoration button__decoration--one"
      ></span>
      <span
        aria-hidden="true"
        className="button__decoration button__decoration--two"
      ></span>
      {loading ? (
        <>
          <Icon name="preloader" className="button__icon" />
          <span className="visually-hidden">Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
