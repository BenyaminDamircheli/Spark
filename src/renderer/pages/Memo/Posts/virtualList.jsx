import { useParams } from 'react-router-dom';
import NewPost from '../NewPost';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  memo,
  useLayoutEffect,
} from 'react';
import { useIndexContext } from '../../../context/IndexContext';
import { Virtuoso } from 'react-virtuoso';
import { useVirtualListContext } from '../../../context/VirtualListContext';
import Scrollbar from './Scrollbar';
import { motion } from 'framer-motion';
import Post from './Post';

const VirtualList = memo(({ data }) => {
  const { virtualListRef, setVisibleIndex } = useVirtualListContext();
  const [isScrolling, setIsScrolling] = useState(false);
  
  const handleRangeChanged = (range) => {
    const middle = Math.floor((range.startIndex + range.endIndex) / 2);
    setVisibleIndex(range.startIndex);
  };

 

  const renderPost = useCallback(({ index, data: [postPath, post] }) => {
    if (index === 0) {
      return <NewPost />;
    }

    if (!postPath || postPath === '0' || postPath === 0) {
      console.error('Invalid postPath:', postPath);
      return null;
    }

    return (
      <motion.div
        key={postPath + post.updatedAt}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Post postPath={postPath} />
      </motion.div>
    );
  }, [data]);

  const handleScroll = (index) => {
    setVisibleIndex(index);
  };

  return (
    <Virtuoso
      ref={virtualListRef}
      style={{ height: window.outerHeight }}
      totalCount={data.length}
      itemContent={index => renderPost({ index, data: data[index] })}
      onScroll={({ scrollTop }) => {
        const index = Math.floor(scrollTop / 60); 
        handleScroll(index);
      }}
      components={{
        Scroller: Scrollbar
      }}
      atTopThreshold={100}
      increaseViewportBy={2000}
      incremental
    />
  );
});

export default VirtualList;