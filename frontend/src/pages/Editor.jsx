import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, createPost, updatePost, publishPost, unpublishPost, deletePost } from '../api/posts';
import { useAuth } from '../hooks/useAuth';
import BlockEditor from '../components/Editor/BlockEditor';
import AssetManager from '../components/Editor/AssetManager';

function Editor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentSlug, setCurrentSlug] = useState(null);
  const [post, setPost] = useState({
    title: '',
    description: '',
    blocks: [],
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load post if we have a slug in URL
  useEffect(() => {
    if (slug && slug !== 'undefined') {
      setLoading(true);
      setCurrentSlug(slug);
      getPost(slug)
        .then((data) => {
          setPost(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleSave = async () => {
    if (!post.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    setSaving(true);
    try {
      if (currentSlug) {
        const updated = await updatePost(currentSlug, post);
        setPost(updated);
        alert('Saved!');
      } else {
        const newPost = await createPost(post);
        setCurrentSlug(newPost.slug);
        setPost(newPost);
        // Update URL to show the new slug
        navigate(`/${user.username}/editor/${newPost.slug}`, { replace: true });
      }
    } catch (err) {
      console.error(err);
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!post.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    setSaving(true);
    try {
      let postSlug = currentSlug;
      
      if (!postSlug) {
        const newPost = await createPost(post);
        postSlug = newPost.slug;
        setCurrentSlug(postSlug);
      } else {
        await updatePost(postSlug, post);
      }
      
      await publishPost(postSlug);
      navigate(`/${user.username}/post/${postSlug}`);
    } catch (err) {
      console.error(err);
      alert('Error publishing: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!currentSlug) return;
    setSaving(true);
    try {
      await unpublishPost(currentSlug);
      setPost({ ...post, status: 'draft' });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentSlug) return;
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await deletePost(currentSlug);
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
            {saving ? 'Saving...' : (post.status === 'published' ? 'Save' : 'Save Draft')}
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
          {currentSlug && (
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

      <AssetManager postSlug={currentSlug} />

      <BlockEditor
        blocks={post.blocks}
        onChange={(blocks) => setPost({ ...post, blocks })}
        postSlug={currentSlug}
      />
    </div>
  );
}

export default Editor;