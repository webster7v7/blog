'use client';

import MobileSidebar from './MobileSidebar';

interface MobileSidebarWrapperProps {
  userEmail: string;
}

export default function MobileSidebarWrapper({ userEmail }: MobileSidebarWrapperProps) {
  const handleLogout = async () => {
    const formData = new FormData();
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      window.location.href = '/';
    }
  };

  return <MobileSidebar userEmail={userEmail} onLogout={handleLogout} />;
}

