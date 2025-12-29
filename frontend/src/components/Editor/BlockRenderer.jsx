import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
          
          case 'video':
            return (
              <div key={block.id} className="block-video">
                <video src={block.src} controls />
              </div>
            );
          
          case 'code':
            return (
              <SyntaxHighlighter
                key={block.id}
                language={block.language || 'javascript'}
                style={tomorrow}
              >
                {block.content}
              </SyntaxHighlighter>
            );
          
          default:
            return null;
        }
      })}
    </div>
  );
}

export default BlockRenderer;
