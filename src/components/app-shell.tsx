import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  className?: string;
};

export function AppShell({ children, className = "" }: AppShellProps) {
  return (
    <div className={`mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
