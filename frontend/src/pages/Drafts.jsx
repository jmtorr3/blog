import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDrafts } from '../api/posts';
import { useAuth } from '../hooks/useAuth';

function Drafts() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDrafts()
      .then(setDrafts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="home">
      <h1>Your Drafts</h1>
      {drafts.length === 0 ? (
        <p>No drafts yet. <Link to={`/${user.username}/editor`}>Create one</Link></p>
      ) : (
        <ul className="post-list">
          {drafts.map((post) => (
            <li key={post.id} className="post-item">
              <Link to={`/${user.username}/editor/${post.slug}`} className="post-link">
                <div className="post-content">
                  <h2>{post.title || 'Untitled'}</h2>
                  {post.description && <p>{post.description}</p>}
                  <span className="author">Last edited: {new Date(post.updated_at).toLocaleDateString()}</span>
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

export default Drafts;