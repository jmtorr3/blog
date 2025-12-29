import { useState } from 'react';
import { uploadMedia } from '../../../api/media';

function ImageBlock({ block, onChange, onDelete }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const media = await uploadMedia(file);
      console.log('Media response:', media);
      onChange({ src: media.url });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
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
          <button onClick={() => onChange({ src: '' })}>Remove</button>
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