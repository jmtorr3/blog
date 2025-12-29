import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableBlock from './SortableBlock';
import TextBlock from './blocks/TextBlock';
import HeadingBlock from './blocks/HeadingBlock';
import ImageBlock from './blocks/ImageBlock';
import CodeBlock from './blocks/CodeBlock';

function BlockEditor({ blocks, onChange }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addBlock = (type) => {
    const newBlock = { id: generateId(), type };
    
    switch (type) {
      case 'text':
        newBlock.content = '';
        break;
      case 'heading':
        newBlock.content = '';
        newBlock.level = 2;
        break;
      case 'image':
        newBlock.src = '';
        newBlock.caption = '';
        newBlock.position = 'full';
        break;
      case 'code':
        newBlock.content = '';
        newBlock.language = 'javascript';
        break;
    }
    
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id, updates) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBlock = (id) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const renderBlock = (block) => {
    const props = {
      block,
      onChange: (updates) => updateBlock(block.id, updates),
      onDelete: () => deleteBlock(block.id),
    };

    switch (block.type) {
      case 'text':
        return <TextBlock {...props} />;
      case 'heading':
        return <HeadingBlock {...props} />;
      case 'image':
        return <ImageBlock {...props} />;
      case 'code':
        return <CodeBlock {...props} />;
      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <div className="block-editor">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <SortableBlock key={block.id} id={block.id}>
              {renderBlock(block)}
            </SortableBlock>
          ))}
        </SortableContext>
      </DndContext>

      <div className="add-block">
        <button onClick={() => addBlock('text')}>+ Text</button>
        <button onClick={() => addBlock('heading')}>+ Heading</button>
        <button onClick={() => addBlock('image')}>+ Image</button>
        <button onClick={() => addBlock('code')}>+ Code</button>
      </div>
    </div>
  );
}

export default BlockEditor;
