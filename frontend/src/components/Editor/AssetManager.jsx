import { useState, useEffect, useRef, useCallback } from 'react';
import { getMedia, uploadMedia, deleteMedia } from '../../api/media';

function AssetManager({ postSlug }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchedSlug = useRef(null);
  const hasFetchedOnExpand = useRef(false);

  const loadAssets = useCallback(async (force = false) => {
    // Skip if already loading or if we've already fetched for this slug (unless forced)
    if (isLoading) return;
    if (!force && lastFetchedSlug.current === postSlug) return;

    setIsLoading(true);
    try {
      const data = await getMedia();
      // Filter assets to only show those for the current post
      const filtered = postSlug
        ? data.filter(asset => asset.url.includes(`/posts/${postSlug}/`))
        : [];
      setAssets(filtered);
      lastFetchedSlug.current = postSlug;
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [postSlug, isLoading]);

  // Load assets only when postSlug changes
  useEffect(() => {
    if (postSlug && postSlug !== lastFetchedSlug.current) {
      hasFetchedOnExpand.current = false;
      loadAssets();
    }
  }, [postSlug, loadAssets]);

  // Load assets when first expanded (if not already loaded)
  useEffect(() => {
    if (isExpanded && !hasFetchedOnExpand.current && lastFetchedSlug.current !== postSlug) {
      hasFetchedOnExpand.current = true;
      loadAssets();
    }
  }, [isExpanded, postSlug, loadAssets]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadMedia(file, '', postSlug);
      setAssets([uploaded, ...assets]);
    } catch (err) {
      console.error('Failed to upload asset:', err);
      alert('Failed to upload asset');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset? This cannot be undone.')) return;

    try {
      await deleteMedia(id);
      setAssets(assets.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete asset:', err);
      alert('Failed to delete asset');
    }
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="asset-manager">
      <button
        className="asset-manager-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        {isExpanded ? '▼' : '▶'} Assets ({assets.length})
      </button>

      {isExpanded && (
        <div className="asset-manager-content">
          <div className="asset-upload-section">
            <label className="asset-upload-button">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              {uploading ? 'Uploading...' : '+ Upload Image'}
            </label>
            <p className="asset-help-text">
              Upload images to use in your HTML/CSS code blocks
            </p>
          </div>

          <div className="asset-list">
            {assets.length === 0 ? (
              <p className="asset-empty">No assets yet. Upload images to get started.</p>
            ) : (
              assets.map((asset) => (
                <div key={asset.id} className="asset-item">
                  <img
                    src={asset.url}
                    alt={asset.filename}
                    className="asset-thumbnail"
                  />
                  <div className="asset-info">
                    <div className="asset-filename">{asset.filename}</div>
                    <div className="asset-url">{asset.url}</div>
                  </div>
                  <div className="asset-actions">
                    <button
                      onClick={() => copyToClipboard(asset.url)}
                      className="asset-copy-btn"
                      title="Copy URL"
                    >
                      {copiedUrl === asset.url ? '✓' : '📋'}
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="asset-delete-btn"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetManager;
