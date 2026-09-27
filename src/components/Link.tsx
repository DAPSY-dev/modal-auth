import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from 'react-router';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

type LinkSharedProps = {
  variant?: 'primary' | 'secondary' | 'alert';
};

export type LinkProps = LinkSharedProps &
  (
    | ({
        as?: 'router';
      } & RouterLinkProps)
    | ({
        as: 'a';
      } & AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({
        as: 'button';
      } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

export function Link(props: LinkProps) {
  const { variant, className } = props;
  const classes = ['link', variant && `link--${variant}`, className]
    .filter(Boolean)
    .join(' ');
  switch (props.as) {
    case 'a': {
      const { as, variant, className, children, ...rest } = props;
      return (
        <a {...rest} className={classes}>
          {children}
        </a>
      );
    }
    case 'button': {
      const {
        as,
        variant,
        className,
        type = 'button',
        children,
        ...rest
      } = props;
      return (
        <button {...rest} type={type} className={classes}>
          {children}
        </button>
      );
    }
    default: {
      const { as, variant, className, children, ...rest } = props;
      return (
        <RouterLink {...rest} className={classes}>
          {children}
        </RouterLink>
      );
    }
  }
}
