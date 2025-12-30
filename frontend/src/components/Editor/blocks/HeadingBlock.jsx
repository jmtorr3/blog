import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useEffect, useState } from 'react';

function HeadingBlock({ block, onChange, onDelete }) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Heading text...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: block.content,
    onUpdate: ({ editor }) => {
      onChange({ content: editor.getHTML() });
    },
  });

  useEffect(() => {
    if (editor && block.content !== editor.getHTML()) {
      editor.commands.setContent(block.content);
    }
  }, [block.content, editor]);

  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'
  ];

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

        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive('bold') ? 'is-active' : ''}
          title="Bold"
        >
          B
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive('italic') ? 'is-active' : ''}
          title="Italic"
        >
          I
        </button>

        <div className="toolbar-separator"></div>

        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={editor?.isActive('bulletList') ? 'is-active' : ''}
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={editor?.isActive('orderedList') ? 'is-active' : ''}
          title="Numbered List"
        >
          1.
        </button>

        <div className="toolbar-separator"></div>

        <button
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          className={editor?.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          title="Align Left"
        >
          ⬅
        </button>
        <button
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          className={editor?.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          title="Align Center"
        >
          ⬌
        </button>
        <button
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          className={editor?.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          title="Align Right"
        >
          ➡
        </button>

        <div className="toolbar-separator"></div>

        <div className="color-picker-wrapper">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color"
            className="color-button"
          >
            A
          </button>
          {showColorPicker && (
            <div className="color-picker-dropdown">
              {colors.map((color) => (
                <button
                  key={color}
                  className="color-option"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    editor?.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  title={color}
                />
              ))}
              <button
                className="color-option color-remove"
                onClick={() => {
                  editor?.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                title="Remove color"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <button onClick={onDelete} className="delete" title="Delete block">×</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export default HeadingBlock;
