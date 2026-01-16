import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

function UserBlog() {
  const { username } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    client.get(`/users/${username}/posts/`)
      .then((res) => setPosts(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'User not found'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home">
      <h1>{username}'s Blog</h1>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.id} className="post-item">
              <Link to={`/${username}/post/${post.slug}`} className="post-link">
                <div className="post-content">
                  <h2>{post.title}</h2>
                  {post.description && <p>{post.description}</p>}
                </div>
                {post.cover_image_url && (
                  <div className="post-thumbnail">
                    <img src={post.cover_image_url} alt={post.title} />
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserBlog;