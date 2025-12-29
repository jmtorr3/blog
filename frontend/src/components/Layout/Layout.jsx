import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  // Hide theme toggle on individual post pages
  const isPostPage = location.pathname.includes('/post/');

  return (
    <div className="app">
      <header className="header">
        <nav>
          <Link to="/" className="logo">sys32blog</Link>
          <div className="nav-links">
            {!isPostPage && (
              <button onClick={toggleTheme} className="theme-toggle">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            )}
            {user ? (
              <>
                <Link to="/drafts">Drafts</Link>
                <Link to={`/${user.username}/editor`}>New Post</Link>
                <button onClick={logout}>Logout</button>
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
    </div>
  );
}

export default Layout;