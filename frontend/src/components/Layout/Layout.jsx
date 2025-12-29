import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="header">
        <nav>
          <Link to="/" className="logo">sys32blog</Link>
          <div className="nav-links">
            {user ? (
              <>
                <Link to="/drafts">Drafts</Link>
                <Link to="/editor">New Post</Link>
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
