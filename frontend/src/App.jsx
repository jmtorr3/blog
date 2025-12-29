import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Post from './pages/Post';
import UserBlog from './pages/UserBlog';
import Login from './pages/Login';
import Editor from './pages/Editor';
import Drafts from './pages/Drafts';
import ProtectedRoute from './components/Layout/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter basename="/blog">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path=":username" element={<UserBlog />} />
              <Route path=":username/post/:slug" element={<Post />} />
              <Route
                path=":username/editor"
                element={
                  <ProtectedRoute>
                    <Editor />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":username/editor/:slug"
                element={
                  <ProtectedRoute>
                    <Editor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="drafts"
                element={
                  <ProtectedRoute>
                    <Drafts />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;