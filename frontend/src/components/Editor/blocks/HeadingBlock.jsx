function HeadingBlock({ block, onChange, onDelete }) {
  return (
    <div className="heading-block">
      <div className="block-toolbar">
        <select
          value={block.level}
          onChange={(e) => onChange({ level: parseInt(e.target.value) })}
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
          <option value={4}>H4</option>
        </select>
        <button onClick={onDelete} className="delete">×</button>
      </div>
      <input
        type="text"
        value={block.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="Heading text"
      />
    </div>
  );
}

export default HeadingBlock;
