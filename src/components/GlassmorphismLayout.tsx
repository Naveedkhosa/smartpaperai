import { ReactNode } from 'react';
import RoleSelector from './RoleSelector';

interface GlassmorphismLayoutProps {
  children: ReactNode;
}

export default function GlassmorphismLayout({ children }: GlassmorphismLayoutProps) {
  return (
    <div className="gradient-bg min-h-screen relative">
      <RoleSelector />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
