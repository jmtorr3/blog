import CollapsibleCodeBlock from './CollapsibleCodeBlock';

function BlockRenderer({ blocks }) {
  return (
    <div className="blocks">
      {blocks.map((block) => {
        switch (block.type) {
          case 'text':
            return (
              <div
                key={block.id}
                className="block-text"
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            );
          
          case 'heading':
            const Tag = `h${block.level || 2}`;
            return <Tag key={block.id}>{block.content}</Tag>;
          
          case 'image':
            return (
              <figure 
                key={block.id} 
                className={`block-image position-${block.position || 'center'} size-${block.size || 'medium'}`}
              >
                <img src={block.src} alt={block.caption || ''} />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            );

          case 'image-row':
            return (
              <div key={block.id} className={`block-image-row columns-${block.columns || 2}`}>
                {(block.images || []).map((image, index) => (
                  <figure key={index} className="image-row-item">
                    <img src={image.src} alt={image.caption || ''} />
                    {image.caption && <figcaption>{image.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            );
          
          case 'video':
            return (
              <div key={block.id} className="block-video">
                <video src={block.src} controls />
              </div>
            );
          
          case 'code':
            // Hide CSS, JavaScript, and HTML code blocks since they're applied to the page
            if (['css', 'javascript', 'html'].includes(block.language)) {
              return null;
            }
            return <CollapsibleCodeBlock key={block.id} block={block} />;

          case 'code-display':
            return <CollapsibleCodeBlock key={block.id} block={block} />;

          default:
            return null;
        }
      })}
    </div>
  );
}

export default BlockRenderer;
