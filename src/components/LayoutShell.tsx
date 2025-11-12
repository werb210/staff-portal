import { useEffect, useState, type PropsWithChildren } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export function LayoutShell({ children }: PropsWithChildren) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => setTheme(event.matches ? 'dark' : 'light');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  return (
    <div className={`layout layout--${theme} ${sidebarCollapsed ? 'layout--collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onNavigate={() => setSidebarCollapsed(false)} />
      <div className="layout__main">
        <Navbar
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          theme={theme}
        />
        <main className="layout__content">{children}</main>
      </div>
    </div>
  );
}

export default LayoutShell;
