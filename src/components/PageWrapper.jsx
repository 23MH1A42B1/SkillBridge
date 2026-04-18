import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageWrapper — wraps page content with a fade-up entrance animation
 * on every route change. Mount inside AppLayout's app-content div.
 */
export default function PageWrapper({ children }) {
  const { pathname } = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.classList.remove('page-enter-active');
    // Force reflow
    void ref.current.offsetWidth;
    ref.current.classList.add('page-enter-active');
  }, [pathname]);

  return (
    <div ref={ref} className="page-enter">
      {children}
    </div>
  );
}
