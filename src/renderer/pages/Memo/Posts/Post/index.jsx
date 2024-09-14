import { useEffect, useState, useCallback, useRef, memo, useMemo } from 'react';
import { useParams } from 'react-router-dom';
//import styles from './Post.module.scss';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { DateTime } from 'luxon';
import { postFormat } from '../../../../utils/fileOperations';
import Editor from '../../Editor';
import * as fileOperations from '../../../../utils/fileOperations';
import { useMemoContext } from '../../../../context/MemoContext';
import usePost from '../../../../hooks/usePost';
import { AnimatePresence, motion } from 'framer-motion';
import Reply from './Reply';
import { VirtualListContext } from '../../../../context/VirtualListContext';
import styles from './Post.module.scss';
import { NeedleIcon, ReflectIcon } from '../../../../icons';
import Category from './Category';
import { useCategoryContext } from '../../../../context/CategoryContext';
import { Book, NotebookPen, Paperclip, Pen, Stars } from 'lucide-react';

const Post = memo(({ postPath, searchTerm = null, repliesCount = 0 }) => {
  console.log('Post component rendered with path:', postPath);
  const { currentMemo, getCurrentMemoPath } = useMemoContext();
  const { categories } = useCategoryContext();
  const { post, cycleColor, refreshPost, setHighlight } = usePost(postPath);
  const [hovering, setHover] = useState(false);
  const [replying, setReplying] = useState(false);
  const [isAIReplying, setIsAiReplying] = useState(false);
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    console.log('Post data:', post);
  }, [post]);

  const closeReply = () => {
    setReplying(false);
    setIsAiReplying(false);
  };

  const toggleReplying = () => {
    if (replying) {
      setIsAiReplying(false);
    }
    setReplying(!replying);
  };

  const toggleEditable = () => setEditable(!editable);
  const handleRootMouseEnter = () => setHover(true);
  const handleRootMouseLeave = () => setHover(false);
  const containerRef = useRef();

  if (!post) return;

  const created = DateTime.fromISO(post.data?.createdAt);
  const replies = post?.data?.replies || [];
  const hasReplies = replies.length > 0;
  const isAI = post?.data?.isAI || false;
  const isReply = post?.data?.isReply || false;
  const highlightColor = post?.data?.highlight
    ? highlights.get(post.data.highlight).color
    : 'var(--border)';

  const renderReplies = () => {
    return replies.map((reply, index) => {
      const isFirst = index === 0;
      const isLast = index === replies.length - 1;
      const path = getCurrentMemoPath(reply);

      return (
        <Reply
          key={reply}
          postPath={reply}
          isLast={isLast}
          isFirst={isFirst}
          replying={replying}
          highlightColor={highlightColor}
          parentPostPath={postPath}
          reloadParentPost={refreshPost}
          searchTerm={searchTerm}
          
        />
      );
    });
  };

  if (isReply) return;

  return (
    <div
      ref={containerRef}
      className={`${styles.root} ${
        (replying || isAIReplying) && styles.focused
      }`}
      tabIndex="0"
      onMouseEnter={handleRootMouseEnter}
      onMouseLeave={handleRootMouseLeave}
      onFocus={handleRootMouseEnter}
      onBlur={handleRootMouseLeave}
    >
      <div className={styles.post}>
        <div className={styles.left}>
          {post.data?.isReply && <div className={styles.connector}></div>}
          <Category 
            isAI={isAI}
            categoryColor={post?.data?.category ? categories.get(post.data.category)?.color : '#6B6155'}
            postPath={postPath}
            currentCategory={post.data.category}
          />
          <div
            className={`${styles.line} ${
              (post.data?.replies?.length > 0 || replying) && styles.show
            }`}
            style={{
              borderColor: highlightColor,
            }}
          ></div>
        </div>
        <div className={styles.right}>
          <div className={styles.header}>
            <div className={styles.title}>{post.name}</div>
            <div className={styles.meta}>
              <button className={styles.time} onClick={toggleEditable}>
                {created.toRelative()}
              </button>
            </div>
          </div>
          <div className={styles.editor}>
            <Editor
              postPath={postPath}
              editable={editable}
              setEditable={setEditable}
              searchTerm={searchTerm}
            />
          </div>
        </div>
      </div>

      {renderReplies()}

      <div className={styles.actionsHolder}>
        <AnimatePresence>
          {(replying || hovering) && !isReply && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={styles.actions}>
                <button className={styles.openReply} onClick={toggleReplying}>
                  <Paperclip className={styles.icon} />
                  Add another entry
                </button>
                <div className={styles.sep}>/</div>
                <button
                  className={styles.openReply}
                  onClick={() => {
                    setIsAiReplying(true);
                    toggleReplying();
                  }}
                >
                  <ReflectIcon className={styles.icon2} />
                  Reflect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {replying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 0.09 }}
          >
            <div className={`${styles.post} ${styles.reply}`}>
              <div className={styles.left}>
                <div
                  className={`${styles.connector} ${
                    (post.data.replies.length > 0 || replying) && styles.show
                  }`}
                  style={{
                    backgroundColor: highlightColor,
                  }}
                ></div>
                <div
                  className={`${styles.ball} ${isAIReplying && styles.ai}`}
                  style={{
                    backgroundColor: highlightColor,
                  }}
                >
                  {isAIReplying && (
                    <Stars className={`${styles.iconAI} ${styles.replying}`} />
                  )}
                </div>
              </div>
              <div className={styles.right}>
                <div className={styles.editor}>
                  <Editor
                    parentPostPath={postPath}
                    reloadParentPost={refreshPost}
                    setEditable={setEditable}
                    editable
                    isReply
                    closeReply={closeReply}
                    isAI={isAIReplying}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default Post;