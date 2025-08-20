import { ReactNode } from 'react';
import RoleSelector from './RoleSelector';

interface GlassmorphismLayoutProps {
  children: ReactNode;
}

export default function GlassmorphismLayout({ children }: GlassmorphismLayoutProps) {
  return (
    <div className="gradient-bg min-h-screen">
      <RoleSelector />
      <div className="pt-20">
        {children}
      </div>
    </div>
  );
}
