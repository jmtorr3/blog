import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="blog/:username" element={<UserBlog />} />
            <Route path="blog/:username/post/:slug" element={<Post />} />
            <Route
              path="editor"
              element={
                <ProtectedRoute>
                  <Editor />
                </ProtectedRoute>
              }
            />
            <Route
              path="editor/:slug"
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
  );
}

export default App;