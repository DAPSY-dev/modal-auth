import type { ComponentProps } from 'react';

type IconProps = Omit<ComponentProps<'svg'>, 'children' | 'name'> & {
  name: string;
  label?: string;
};

export function Icon({
  name,
  label,
  width = 24,
  height = 24,
  ...props
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      fill="currentColor"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...props}
    >
      <use href={`${import.meta.env.BASE_URL}icons.svg#icon-${name}`} />
    </svg>
  );
}
