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
    cover_image: null,
    blocks: [],
    status: 'draft',
  });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
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
          // Set cover image preview if exists
          if (data.cover_image_url) {
            setCoverImagePreview(data.cover_image_url);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setCoverImageFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setPost({ ...post, cover_image: null });
  };

  const handleSave = async () => {
    if (!post.title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      if (currentSlug) {
        const updated = await updatePost(currentSlug, post, coverImageFile);
        setPost(updated);
        setCoverImageFile(null);
        if (updated.cover_image_url) {
          setCoverImagePreview(updated.cover_image_url);
        }
        alert('Saved!');
      } else {
        const newPost = await createPost(post, coverImageFile);
        setCurrentSlug(newPost.slug);
        setPost(newPost);
        setCoverImageFile(null);
        if (newPost.cover_image_url) {
          setCoverImagePreview(newPost.cover_image_url);
        }
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
        const newPost = await createPost(post, coverImageFile);
        postSlug = newPost.slug;
        setCurrentSlug(postSlug);
        setCoverImageFile(null);
      } else {
        await updatePost(postSlug, post, coverImageFile);
        setCoverImageFile(null);
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

      <div className="cover-image-section">
        <label>Cover Image (optional)</label>
        {coverImagePreview ? (
          <div className="cover-image-preview">
            <img src={coverImagePreview} alt="Cover" />
            <button onClick={handleRemoveCoverImage} className="remove-cover">
              Remove
            </button>
          </div>
        ) : (
          <div className="cover-image-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              id="cover-image-input"
            />
            <label htmlFor="cover-image-input" className="upload-label">
              Choose Cover Image
            </label>
          </div>
        )}
      </div>

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