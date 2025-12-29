import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPost } from '../api/posts';
import { useAuth } from '../hooks/useAuth';
import BlockRenderer from '../components/Editor/BlockRenderer';

function Post() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPost(slug)
      .then(setPost)
      .catch((err) => setError(err.response?.data?.detail || 'Post not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!post) return <div>Post not found</div>;

  const isAuthor = user?.id === post.author?.id;

  return (
    <article className="post">
      <header>
        <h1>{post.title}</h1>
        {post.description && <p className="description">{post.description}</p>}
        <div className="meta">
          <span>By {post.author?.username}</span>
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
