import type { ComponentProps } from 'react';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type TitleProps = ComponentProps<'h2'> & {
  as?: HeadingTag;
};

export function Title({
  as: Component = 'h2',
  className,
  ...props
}: TitleProps) {
  return (
    <Component
      {...props}
      className={['title', className].filter(Boolean).join(' ')}
    />
  );
}
