import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useState, useEffect } from 'react';

function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide theme toggle on individual post pages
  const isPostPage = location.pathname.includes('/post/');

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <div className="app">
      <header className="header">
        <nav>
          <Link to="/" className="logo">sys32blog</Link>

          <button
            className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            {!isPostPage && (
              <button onClick={toggleTheme} className="theme-toggle">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            )}
            {user ? (
              <>
                <Link to="/drafts">Drafts</Link>
                <Link to={`/${user.username}/editor`}>New Post</Link>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} sys32ent. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Layout;