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
        loading && 'button--loading',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading ? (
        <>
          <Icon name="preloader" />
          <span className="visually-hidden">Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
