import { useParams } from 'react-router-dom';
import styles from './Posts.module.scss';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback, useEffect, useMemo, useRef, memo } from 'react';
import { useIndexContext } from '../../../context/IndexContext';
import Post from './Post';
import NewPost from '../NewPost';
import { AnimatePresence, motion } from 'framer-motion';
import debounce from '../../../../main/utils/debounce';
import VirtualList from './virtualList';

export default function Posts() {
  const { index, updateIndex } = useIndexContext();
  const [data, setData] = useState([]);

  // Index is updated when a post is created or deleted.
  // This is used to update the data array that is then passed to the VirtualList component.
  // so that it can be rendered.

  useEffect(() => {
    console.log('Data for VirtualList:', data);
  }, [data]);

  useEffect(() => {
    const onlyParentEntries = [];
    const estimatedSize = Math.floor(index.size * 0.7);

    onlyParentEntries.length = estimatedSize + 1;
    let i = 1;

    for (const [key, metadata] of index) {
      if (!metadata.isReply && key && key !== '0' && key !== 0) {
        console.log('Adding key to onlyParentEntries:', key);
        onlyParentEntries[i] = [key, metadata];
        i++;
      }
    }

    onlyParentEntries[0] = [
      'NewPost',
      { height: 150, hash: Date.now().toString() },
    ];
    onlyParentEntries.length = i;

    console.log('Prepared data for VirtualList:', onlyParentEntries);
    setData(onlyParentEntries);
  }, [index]);


  const renderList = useMemo(() => {
    return <VirtualList data={data} />;
  }, [data]);

  // When there are zero entries
  if (index.size == 0) {
    return (
      <div className={styles.posts}>
        <NewPost />
        <div className={styles.empty}>
          <div className={styles.wrapper}>
            <div className={styles.none}>Peace of Mind</div>
            <div className={styles.tip}>
            Yarn is the perfect for writing your thoughts in bursts. Write your thoughts, save things you find online, reflect more meaningfully than ever before with the help of AI.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.posts}>
      <AnimatePresence>{renderList}</AnimatePresence>
      <div className={styles.gradient}></div>
    </div>
  );
}