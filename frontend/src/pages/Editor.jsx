import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, createPost, updatePost, publishPost, unpublishPost, deletePost } from '../api/posts';
import { useAuth } from '../hooks/useAuth';
import BlockEditor from '../components/Editor/BlockEditor';

function Editor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState({
    title: '',
    description: '',
    blocks: [],
    status: 'draft',
    custom_css: '',
  });
  const [loading, setLoading] = useState(!!slug);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slug) {
      getPost(slug)
        .then(setPost)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (slug) {
        await updatePost(slug, post);
      } else {
        const newPost = await createPost(post);
        navigate(`/blog/${user.username}/editor/${newPost.slug}`, { replace: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      if (!slug) {
        const newPost = await createPost(post);
        await publishPost(newPost.slug);
        navigate(`/blog/${user.username}/post/${newPost.slug}`);
      } else {
        await updatePost(slug, post);
        await publishPost(slug);
        navigate(`/blog/${user.username}/post/${slug}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!slug) return;
    setSaving(true);
    try {
      await unpublishPost(slug);
      setPost({ ...post, status: 'draft' });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!slug) return;
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(slug);
      navigate('/drafts');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="editor-page">
      <div className="editor-header">
        <input
          type="text"
          placeholder="Post title"
          value={post.title}
          onChange={(e) => setPost({ ...post, title: e.target.value })}
          className="title-input"
        />
        <div className="editor-actions">
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          {post.status === 'published' ? (
            <button onClick={handleUnpublish} disabled={saving}>
              Unpublish
            </button>
          ) : (
            <button onClick={handlePublish} disabled={saving}>
              Publish
            </button>
          )}
          {slug && (
            <button onClick={handleDelete} className="danger">
              Delete
            </button>
          )}
        </div>
      </div>
      
      <input
        type="text"
        placeholder="Short description"
        value={post.description}
        onChange={(e) => setPost({ ...post, description: e.target.value })}
        className="description-input"
      />
      
      <textarea
        placeholder="Custom CSS (optional)"
        value={post.custom_css || ''}
        onChange={(e) => setPost({ ...post, custom_css: e.target.value })}
        className="css-input"
        rows={6}
      />
      
      <BlockEditor
        blocks={post.blocks}
        onChange={(blocks) => setPost({ ...post, blocks })}
      />
    </div>
  );
}

export default Editor;