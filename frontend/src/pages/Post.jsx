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

  // Apply CSS, JavaScript, and HTML from code blocks
  useEffect(() => {
    if (!post?.blocks) return;

    const cleanupFunctions = [];

    // Find and apply CSS code blocks
    const cssBlocks = post.blocks.filter(
      block => block.type === 'code' && block.language === 'css'
    );

    if (cssBlocks.length > 0) {
      const combinedCSS = cssBlocks.map(block => block.content).join('\n\n');
      const style = document.createElement('style');
      style.id = 'post-custom-css';
      style.textContent = combinedCSS;
      document.head.appendChild(style);

      // Add custom post class to body
      const currentTheme = document.body.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add('custom-post-page');

      // Add temporary style to hide content during cleanup
      const hideStyle = document.createElement('style');
      hideStyle.id = 'post-cleanup-hide';
      hideStyle.textContent = '.post .content { visibility: hidden; }';
      document.head.appendChild(hideStyle);

      // Clean up inline text-align styles when custom CSS is present
      setTimeout(() => {
        // Clean all text nodes containing p tag strings
        document.querySelectorAll('.post .content *').forEach((element) => {
          element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('<p style="text-align:')) {
              node.textContent = node.textContent
                .replace(/<p style="text-align:\s*(left|center|right);">/gi, '')
                .replace(/<\/p>/gi, '');
            }
          });
        });

        // Remove inline text-align styles from HTML elements
        document.querySelectorAll('.post .content [style*="text-align"]').forEach(el => {
          el.removeAttribute('style');
        });

        // Show content after cleanup
        const hideStyle = document.getElementById('post-cleanup-hide');
        if (hideStyle) hideStyle.remove();
      }, 100);

      cleanupFunctions.push(() => {
        const existing = document.getElementById('post-custom-css');
        if (existing) existing.remove();
        document.body.classList.remove('custom-post-page');
        document.body.classList.add(currentTheme);
      });
    }

    // Find and render HTML code blocks
    const htmlBlocks = post.blocks.filter(
      block => block.type === 'code' && block.language === 'html'
    );

    htmlBlocks.forEach((block, index) => {
      const container = document.createElement('div');
      container.id = `post-custom-html-${index}`;
      container.innerHTML = block.content;

      // Insert after the post content
      const postContent = document.querySelector('.post .content');
      if (postContent) {
        postContent.appendChild(container);
      }

      cleanupFunctions.push(() => {
        const existing = document.getElementById(`post-custom-html-${index}`);
        if (existing) existing.remove();
      });
    });

    // Find and execute JavaScript code blocks
    const jsBlocks = post.blocks.filter(
      block => block.type === 'code' && block.language === 'javascript'
    );

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
          <Link to={`/${post.author?.username}`}>By {post.author?.username}</Link>
          <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
          {isAuthor && <Link to={`/${post.author.username}/editor/${post.slug}`}>Edit</Link>}
        </div>
      </header>
      <div className="content">
        <BlockRenderer blocks={post.blocks} />
      </div>
    </article>
  );
}

export default Post;