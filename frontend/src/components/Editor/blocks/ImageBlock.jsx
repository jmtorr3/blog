import { useState } from 'react';
import { uploadMedia, deleteMediaByUrl } from '../../../api/media';

function ImageBlock({ block, onChange, onDelete, postSlug }) {
  const [uploading, setUploading] = useState(false);

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
      try {
        await deleteMediaByUrl(block.src);
      } catch (err) {
        console.error('Failed to delete media:', err);
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
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {uploading && <span>Uploading...</span>}
        </div>
      )}
    </div>
  );
}

export default ImageBlock;