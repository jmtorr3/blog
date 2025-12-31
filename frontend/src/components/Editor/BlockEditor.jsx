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
import { deleteMediaByUrl } from '../../api/media';
import SortableBlock from './SortableBlock';
import TextBlock from './blocks/TextBlock';
import HeadingBlock from './blocks/HeadingBlock';
import ImageBlock from './blocks/ImageBlock';
import ImageRowBlock from './blocks/ImageRowBlock';
import CodeBlock from './blocks/CodeBlock';
import CodeDisplayBlock from './blocks/CodeDisplayBlock';

function BlockEditor({ blocks, onChange, postSlug }) {
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
        newBlock.position = 'center';
        newBlock.size = 'medium';
        break;
      case 'image-row':
        newBlock.images = [];
        newBlock.columns = 2;
        break;
      case 'code':
        newBlock.content = '';
        newBlock.language = 'javascript';
        break;
      case 'code-display':
        newBlock.content = '';
        newBlock.language = 'javascript';
        break;
    }

    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id, updates) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBlock = async (id) => {
    const block = blocks.find((b) => b.id === id);

    // Clean up media files
    if (block) {
      let hasImages = false;
      if (block.type === 'image' && block.src) {
        hasImages = true;
      } else if (block.type === 'image-row' && block.images && block.images.length > 0) {
        hasImages = true;
      }

      if (hasImages) {
        const shouldDeleteFromAssets = window.confirm(
          'This block contains images. Do you want to remove them from the asset manager as well?\n\n' +
          'Click "OK" to delete them from assets (files will be removed)\n' +
          'Click "Cancel" to only remove this block (files will be kept in assets)'
        );

        if (shouldDeleteFromAssets) {
          try {
            if (block.type === 'image' && block.src) {
              await deleteMediaByUrl(block.src);
            } else if (block.type === 'image-row' && block.images) {
              for (const image of block.images) {
                if (image.src) {
                  await deleteMediaByUrl(image.src);
                }
              }
            }
          } catch (err) {
            console.error('Failed to delete media:', err);
          }
        }
      }
    }

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
      postSlug,
    };

    switch (block.type) {
      case 'text':
        return <TextBlock {...props} />;
      case 'heading':
        return <HeadingBlock {...props} />;
      case 'image':
        return <ImageBlock {...props} />;
      case 'image-row':
        return <ImageRowBlock {...props} />;
      case 'code':
        return <CodeBlock {...props} />;
      case 'code-display':
        return <CodeDisplayBlock {...props} />;
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
        <button onClick={() => addBlock('image-row')}>+ Image Row</button>
        <button onClick={() => addBlock('code')}>+ Code</button>
        <button onClick={() => addBlock('code-display')}>+ Code Display</button>
      </div>
    </div>
  );
}

export default BlockEditor;