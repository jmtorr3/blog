import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

function TextBlock({ block, onChange, onDelete }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write something...',
      }),
    ],
    content: block.content,
    onUpdate: ({ editor }) => {
      onChange({ content: editor.getHTML() });
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === 'Tab') {
          event.preventDefault();
          // Use non-breaking spaces that won't be collapsed
          view.dispatch(view.state.tr.insertText('\u00A0\u00A0\u00A0\u00A0'));
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && block.content !== editor.getHTML()) {
      editor.commands.setContent(block.content);
    }
  }, [block.content]);

  return (
    <div className="text-block">
      <div className="block-toolbar">
        <button onClick={() => editor?.chain().focus().toggleBold().run()}>B</button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
        <button onClick={onDelete} className="delete">×</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export default TextBlock;