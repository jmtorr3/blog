import { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CollapsibleCodeBlock({ block, maxHeight = 300 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      const actualHeight = codeRef.current.scrollHeight;
      setShowToggle(actualHeight > maxHeight);
    }
  }, [block.content, maxHeight]);

  return (
    <div className="collapsible-code-block">
      <div
        ref={codeRef}
        className={`code-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}
        style={{
          maxHeight: isExpanded || !showToggle ? 'none' : `${maxHeight}px`,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <SyntaxHighlighter
          language={block.language || 'javascript'}
          style={tomorrow}
        >
          {block.content}
        </SyntaxHighlighter>
        {!isExpanded && showToggle && (
          <div className="code-fade"></div>
        )}
      </div>
      {showToggle && (
        <button
          className="toggle-code-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
}

export default CollapsibleCodeBlock;
