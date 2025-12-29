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
    <div className="drafts">
      <h1>Your Drafts</h1>
      {drafts.length === 0 ? (
        <p>No drafts yet. <Link to={`/blog/${user.username}/editor`}>Create one</Link></p>
      ) : (
        <ul className="post-list">
          {drafts.map((post) => (
            <li key={post.id}>
              <Link to={`/blog/${user.username}/editor/${post.slug}`}>
                <h2>{post.title || 'Untitled'}</h2>
                <span>Last edited: {new Date(post.updated_at).toLocaleDateString()}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Drafts;