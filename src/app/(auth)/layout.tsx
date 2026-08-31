import type { ReactNode } from 'react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactNode {
  return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
}
