import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { postFormat } from '../../../../../utils/fileOperations';
import Editor from '../../../Editor';
import * as fileOperations from '../../../../../utils/fileOperations';
import { useMemoContext } from '../../../../../context/MemoContext';
import usePost from '../../../../../hooks/usePost';
import { AnimatePresence, motion } from 'framer-motion';
import styles from '../Post.module.scss';
import { Stars } from 'lucide-react';


export default function Reply({
    postPath,
    isLast = false,
    isFirst = false,
    replying = false,
    highlightColor,
    parentPostPath = null,
    reloadParentPost = () => {},
    searchTerm = { searchTerm },
}) {
    const {currentMemo} = useMemoContext();
    const {post} = usePost(postPath);
    const [editable, setEditable] = useState(false);

    const toggleEditable = () => {
        setEditable(!editable);
    }

    if (!post) return;

    const created = DateTime.fromISO(post.data.createdAt);
    const updated = DateTime.fromISO(post.data.updatedAt);
    const isReply = post?.data?.isReply || false;
    const isAI = post?.data?.isAI || false;

    return (
        <div>
      <div className={styles.post}>
        <div className={styles.left}>
          <div
            className={`${styles.connector} ${isFirst && styles.first}`}
          ></div>

          <div
            className={`${styles.ball} ${isAI && styles.ai}`}
            
            style={{
              backgroundColor: 'red',
            }}
          >
            {isAI && <Stars />}
          </div>
          <div
            className={`${styles.line} ${isAI && styles.ai} ${
              (!isLast || replying) && styles.show
            } `}
            style={{
              borderColor: highlightColor ?? 'gray',
            }}
          ></div>
        </div>
        <div className={styles.right}>
          <div className={styles.header}>
            <div className={styles.title}>{post.name}</div>
            <div className={styles.meta}>
              <div className={styles.time} onClick={toggleEditable}>
                {created.toRelative()}
              </div>
            </div>
          </div>
          <div className={`${styles.editor} ${isAI && styles.ai}`}>
            <Editor
              postPath={postPath}
              editable={editable}
              setEditable={setEditable}
              parentPostPath={parentPostPath}
              reloadParentPost={reloadParentPost}
              searchTerm={searchTerm}
            />
          </div>
        </div>
      </div>
    </div>
    )
}
