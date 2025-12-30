function CodeDisplayBlock({ block, onChange, onDelete }) {
  return (
    <div className="code-display-block">
      <div className="block-toolbar">
        <select
          value={block.language}
          onChange={(e) => onChange({ language: e.target.value })}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="css">CSS</option>
          <option value="html">HTML</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
        </select>
        <button onClick={onDelete} className="delete">×</button>
      </div>
      <textarea
        value={block.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="Paste your code here..."
        rows={10}
      />
    </div>
  );
}

export default CodeDisplayBlock;
