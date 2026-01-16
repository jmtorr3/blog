import { useState, useEffect, useMemo, useRef } from 'react';
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
  const contentRef = useRef(null);

  useEffect(() => {
    const url = username
      ? `/users/${username}/posts/${slug}/`
      : `/posts/${slug}/`;
    client.get(url)
      .then((res) => setPost(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Post not found'))
      .finally(() => setLoading(false));
  }, [username, slug]);

  // Memoize code blocks extraction to avoid recalculating on every render
  const { cssBlocks, htmlBlocks, jsBlocks, combinedCSS } = useMemo(() => {
    if (!post?.blocks) return { cssBlocks: [], htmlBlocks: [], jsBlocks: [], combinedCSS: '' };

    const css = post.blocks.filter(block => block.type === 'code' && block.language === 'css');
    const html = post.blocks.filter(block => block.type === 'code' && block.language === 'html');
    const js = post.blocks.filter(block => block.type === 'code' && block.language === 'javascript');

    return {
      cssBlocks: css,
      htmlBlocks: html,
      jsBlocks: js,
      combinedCSS: css.map(block => block.content).join('\n\n')
    };
  }, [post?.blocks]);

  // Apply CSS, JavaScript, and HTML from code blocks
  useEffect(() => {
    if (!post?.blocks) return;

    const cleanupFunctions = [];

    if (cssBlocks.length > 0) {
      const style = document.createElement('style');
      style.id = 'post-custom-css';
      style.textContent = combinedCSS;
      document.head.appendChild(style);

      // Add custom post class to body
      const currentTheme = document.body.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add('custom-post-page');

      // Clean up inline text-align styles using ref instead of querySelectorAll
      if (contentRef.current) {
        const elements = contentRef.current.querySelectorAll('[style*="text-align"]');
        elements.forEach(el => el.removeAttribute('style'));
      }

      cleanupFunctions.push(() => {
        const existing = document.getElementById('post-custom-css');
        if (existing) existing.remove();
        document.body.classList.remove('custom-post-page');
        document.body.classList.add(currentTheme);
      });
    }

    // Find and render HTML code blocks
    htmlBlocks.forEach((block, index) => {
      const container = document.createElement('div');
      container.id = `post-custom-html-${index}`;
      container.innerHTML = block.content;

      // Insert after the post content using ref
      if (contentRef.current) {
        contentRef.current.appendChild(container);
      }

      cleanupFunctions.push(() => {
        const existing = document.getElementById(`post-custom-html-${index}`);
        if (existing) existing.remove();
      });
    });

    // Find and execute JavaScript code blocks
    jsBlocks.forEach((block, index) => {
      const script = document.createElement('script');
      script.id = `post-custom-js-${index}`;
      script.textContent = block.content;
      document.body.appendChild(script);

      cleanupFunctions.push(() => {
        const existing = document.getElementById(`post-custom-js-${index}`);
        if (existing) existing.remove();
      });
    });

    // Return cleanup function
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [post, cssBlocks, htmlBlocks, jsBlocks, combinedCSS]);

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
          <Link to={`/${post.author?.username}`}>By {post.author?.username}</Link>
          <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
          {isAuthor && <Link to={`/${post.author.username}/editor/${post.slug}`}>Edit</Link>}
        </div>
      </header>
      <div className="content" ref={contentRef}>
        <BlockRenderer blocks={post.blocks} />
      </div>
    </article>
  );
}

export default Post;