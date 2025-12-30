import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../api/posts';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts()
      .then((data) => setPosts(data.results || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="home">
      <h1>Recent Posts</h1>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.id} className="post-item">
              <Link to={`/${post.author?.username}/post/${post.slug}`} className="post-link">
                <div className="post-content">
                  <h2>{post.title}</h2>
                  {post.description && <p>{post.description}</p>}
                  <span className="author">by {post.author?.username}</span>
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

export default Home;