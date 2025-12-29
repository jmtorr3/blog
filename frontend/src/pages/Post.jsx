import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../hooks/useAuth';
import BlockRenderer from '../components/Editor/BlockRenderer';

function Post() {
  const { username, slug } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = username 
      ? `/users/${username}/posts/${slug}/`
      : `/posts/${slug}/`;
    
    client.get(url)
      .then((res) => setPost(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Post not found'))
      .finally(() => setLoading(false));
  }, [username, slug]);

  useEffect(() => {
    if (post?.custom_css) {
      const style = document.createElement('style');
      style.id = 'post-custom-css';
      style.textContent = post.custom_css;
      document.head.appendChild(style);

      document.body.classList.add('custom-post-page');

      return () => {
        const existing = document.getElementById('post-custom-css');
        if (existing) existing.remove();
        document.body.classList.remove('custom-post-page');
      };
    }
  }, [post]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!post) return <div>Post not found</div>;

  const isAuthor = user?.username === (username || post.author?.username);

  return (
    <article className="post">
      <header>
        <h1>{post.title}</h1>
        {post.description && <p className="description">{post.description}</p>}
        <div className="meta">
          <Link to={`/blog/${post.author?.username}`}>By {post.author?.username}</Link>
          <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
          {isAuthor && <Link to={`/editor/${post.slug}`}>Edit</Link>}
        </div>
      </header>
      <div className="content">
        <BlockRenderer blocks={post.blocks} />
      </div>
    </article>
  );
}

export default Post;