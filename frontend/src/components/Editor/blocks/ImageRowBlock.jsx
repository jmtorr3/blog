import { useState } from 'react';
import { uploadMedia, deleteMediaByUrl } from '../../../api/media';

function ImageRowBlock({ block, onChange, onDelete }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const media = await uploadMedia(file);
      const newImages = [...(block.images || []), { src: media.url, caption: '' }];
      onChange({ images: newImages });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const updateImage = (index, updates) => {
    const newImages = block.images.map((img, i) => 
      i === index ? { ...img, ...updates } : img
    );
    onChange({ images: newImages });
  };

  const removeImage = async (index) => {
    const image = block.images[index];
    if (image?.src) {
      try {
        await deleteMediaByUrl(image.src);
      } catch (err) {
        console.error('Failed to delete media:', err);
      }
    }
    const newImages = block.images.filter((_, i) => i !== index);
    onChange({ images: newImages });
  };

  return (
    <div className="image-row-block">
      <div className="block-toolbar">
        <label>Columns:</label>
        <select
          value={block.columns || 2}
          onChange={(e) => onChange({ columns: parseInt(e.target.value) })}
        >
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
        <button onClick={onDelete} className="delete">×</button>
      </div>

      <div className={`image-row-preview columns-${block.columns || 2}`}>
        {(block.images || []).map((image, index) => (
          <div key={index} className="image-row-item">
            <img src={image.src} alt={image.caption || ''} />
            <input
              type="text"
              value={image.caption || ''}
              onChange={(e) => updateImage(index, { caption: e.target.value })}
              placeholder="Caption"
            />
            <button onClick={() => removeImage(index)} className="remove">×</button>
          </div>
        ))}
        
        <div className="image-row-add">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {uploading && <span>Uploading...</span>}
        </div>
      </div>
    </div>
  );
}

export default ImageRowBlock;