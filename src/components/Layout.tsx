import type { ReactNode } from 'react';
import { Wrapper } from './Wrapper';
import { Header } from './Header';

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <Wrapper>
      <Header />
      <main>{children}</main>
    </Wrapper>
  );
}
