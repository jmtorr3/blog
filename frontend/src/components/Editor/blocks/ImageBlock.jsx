import { useState, useEffect } from 'react';
import { uploadMedia, deleteMediaByUrl, getMedia } from '../../../api/media';

function ImageBlock({ block, onChange, onDelete, postSlug }) {
  const [uploading, setUploading] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    if (showAssetPicker && postSlug) {
      loadAssets();
    }
  }, [showAssetPicker, postSlug]);

  const loadAssets = async () => {
    try {
      const data = await getMedia();
      // Filter assets for current post
      const filtered = postSlug
        ? data.filter(asset => asset.url.includes(`/posts/${postSlug}/`))
        : [];
      setAssets(filtered);
    } catch (err) {
      console.error('Failed to load assets:', err);
    }
  };

  const handleSelectAsset = (assetUrl) => {
    onChange({ src: assetUrl });
    setShowAssetPicker(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const media = await uploadMedia(file, '', postSlug);
      onChange({ src: media.url });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (block.src) {
      const shouldDeleteFromAssets = window.confirm(
        'Do you want to remove this image from the asset manager as well?\n\n' +
        'Click "OK" to delete it from assets (file will be removed)\n' +
        'Click "Cancel" to only remove it from this post (file will be kept in assets)'
      );

      if (shouldDeleteFromAssets) {
        try {
          await deleteMediaByUrl(block.src);
        } catch (err) {
          console.error('Failed to delete media:', err);
        }
      }
    }
    onChange({ src: '' });
  };

  return (
    <div className="image-block">
      <div className="block-toolbar">
        <select
          value={block.position || 'center'}
          onChange={(e) => onChange({ position: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
        
        <select
          value={block.size || 'medium'}
          onChange={(e) => onChange({ size: e.target.value })}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="full">Full Width</option>
        </select>
        
        <button onClick={onDelete} className="delete">×</button>
      </div>
      
      {block.src ? (
        <div className="image-preview">
          <img src={block.src} alt={block.caption || ''} />
          <input
            type="text"
            value={block.caption || ''}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Caption (optional)"
          />
          <button onClick={handleRemove}>Remove</button>
        </div>
      ) : (
        <div className="image-upload">
          {showAssetPicker ? (
            <div className="asset-picker">
              <div className="asset-picker-header">
                <h4>Select Existing Asset</h4>
                <button onClick={() => setShowAssetPicker(false)}>Cancel</button>
              </div>
              {assets.length > 0 ? (
                <div className="asset-grid">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="asset-item"
                      onClick={() => handleSelectAsset(asset.url)}
                    >
                      <img src={asset.url} alt={asset.alt_text || 'Asset'} />
                    </div>
                  ))}
                </div>
              ) : (
                <p>No assets available. Upload an image first.</p>
              )}
            </div>
          ) : (
            <>
              <input type="file" accept="image/*" onChange={handleFileChange} id={`file-${block.id}`} />
              <label htmlFor={`file-${block.id}`} className="upload-button">
                Upload New Image
              </label>
              {postSlug && (
                <button onClick={() => setShowAssetPicker(true)} className="select-existing">
                  Select Existing
                </button>
              )}
              {uploading && <span>Uploading...</span>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageBlock;