import './ProseMirror.scss';
import styles from './Editor.module.scss';
import { useCallback, useState, useEffect, useRef, memo } from 'react';
import { Extension } from '@tiptap/core';
import { useEditor, EditorContent } from '@tiptap/react';
import Link from '@tiptap/extension-link';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { postFormat } from '../../../utils/fileOperations';
import { useParams } from 'react-router-dom';
import ProseMirrorStyles from './ProseMirror.scss';

import usePost from '../../../hooks/usePost';
import { useAIContext } from '../../../context/AIContext';
import useThread from '../../../hooks/useThread';

import BookmarkPreviews from './Bookmarks';
import { useMemoToastsContext } from '../../../context/ToastContext';

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const highlightTerms = (text, term) => {
  if (!term.trim()) return text;
  const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  return text.replace(
    regex,
    '<span class="' + styles.highlight + '">$1</span>'
  );
};

const Editor = memo(({ 
  postPath, 
  isReply, 
  closeReply, 
  parentPostPath, 
  reloadParentPost, 
  isAI, 
  editable = true, 
  category = null, 
  searchTerm = null,
  setEditable = () => {}
}) => {
  console.log('Editor component rendered with path:', postPath);
  const {
    post,
    savePost,
    addTag,
    removeTag,
    // attachToPost,
    // detachFromPost,
    setContent,
    resetPost,
    deletePost,
  } = usePost(postPath, { isReply, parentPostPath, reloadParentPost, isAI, category });
  
  const { getThread } = useThread();
  const { ai, prompt, model, generate, prepareCompletionContext } = useAIContext(); 
  const { addNotification, removeNotification } = useMemoToastsContext();
  
  const isNew = !postPath;

  const cmndEnterExtention = Extension.create({
    name: 'cmndEnter',
    addCommands() {
      return {
        triggerSubmit: () => ({ state, dispatch }) => {
          const event = new CustomEvent('submit');
          document.dispatchEvent(event);
          return true;
        }
      };
    },
    addKeyboardShortcuts() {
      return {
        'Mod-Enter': ({ editor }) => {
          editor.commands.triggerSubmit();
          return true;
        }
      };
    }
  });

  const closeReplyFunction = () => {
    if (closeReply) closeReply();
  };

  // const handleFile = (file) => {
  //   if (file && file.type.indexOf('image') === 0) {
  //     const fileName = file.name;
  //     const fileExtension = fileName.split('.').pop();
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       const imageData = reader.result;
  //       attachToPost(imageData, fileExtension);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const handleDataTransferItem = (item) => {
  //   const file = item.getAsFile();
  //   if (file) {
  //     handleFile(file);
  //   }
  // };

  const editor = useEditor({
    extensions: [
      StarterKit,
      cmndEnterExtention,
      Typography,
      Link,
      Placeholder.configure({
        placeholder: isAI ? "AI working its magic..." : "What's on your mind?",
      }),
      CharacterCount
    ],
    editorProps: {
      // handlePaste: (view, event, slice) => {
      //   const items = Array.from(event.clipboardData.items);
      //   let imageHandled = false;

      //   if (items) {
      //     items.forEach((item) => {
      //       if (item.type && item.type.indexOf('image') === 0) {
      //         imageHandled = true;
      //         handleDataTransferItem(item);
      //       }
      //     })
      //   }
      //   return imageHandled;
      // },

      // handleDrop: (view, event, slice, moved) => {
      //   let imageHandled = false;
      //   if (
      //     !moved &&
      //     event.dataTransfer &&
      //     event.dataTransfer.items &&
      //     event.dataTransfer.files &&
      //     event.dataTransfer.files[0]
      //   ) {
      //     const files = Array.from(event.dataTransfer.files);
      //     files.forEach(handleFile);
      //     return imageHandled;
      //   }
      //   return imageHandled;
      // }
    },
    autofocus: true,
    editable: editable,
    content: post?.content || '',
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const elementRef = useRef();
  const [deleteStep, setDeleteStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAIResponding, setIsAiResponding] = useState(false);
  const [prevDragPos, setPrevDragPos] = useState(0);
  
  
  const handleMouseDown = (event) => {
    setIsDragging(true);
    setPrevDragPos(event.clientX);
  };

  const handleMouseMove = (e) => {
    if (isDragging && elementRef.current) {
      const delta = e.clientX - prevDragPos;
      elementRef.current.scrollLeft -= delta;
      setPrevDragPos(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  
  useEffect(() => {
    if (!editor) return;
    generateAiResponse();
  }, [editor, isAI]);

  const generateAiResponse = useCallback(async () => {
    if (!editor || isAIResponding || !isAI || editor.state.doc.textContent.length !== 0) 
      return;

    addNotification({
      id: 'reflecting',
      type: 'reflecting',
      message: 'talking to AI',
      dismissTime: 10000,
    });
    setEditable(false);
    setIsAiResponding(true);

    try {
      const thread = await getThread(parentPostPath);
      const context = prepareCompletionContext(thread);

      if (context.length === 0) return;

      await generate(context, (token) => {
        editor.commands.insertContent(token);
      });
    } catch (error) {
      addNotification({
        id: 'reflecting',
        type: 'failed',
        message: 'AI request failed',
        dismissTime: 12000,
        onEnter: closeReplyFunction,
      });
    } finally {
      removeNotification('reflecting');
      setIsAiResponding(false);
    }
  }, [
    editor,
    isAI,
    generate,
    prepareCompletionContext,
    getThread,
    parentPostPath,
    addNotification,
    removeNotification,
    setEditable,
    closeReplyFunction
  ]);

  const handleSubmit = useCallback(async () => {
    await savePost();
    if (isNew) {
      resetPost();
      closeReplyFunction();
      return;
    }

    closeReplyFunction();
    setEditable(false);
  }, [editor, isNew, post, savePost, resetPost, closeReplyFunction, setEditable]);

  useEffect(() => {
    if (editor) {
      if (!post) return;
      if (post?.content != editor.getHTML()) {
        editor.commands.setContent(post.content);
      }
    }
  }, [post, editor]);

  useEffect(() => {
    const handleEvent = () => {
      if (editor?.isFocused) {
        handleSubmit();
      }
    };

    document.addEventListener('submit', handleEvent);

    return () => {
      document.removeEventListener('submit', handleEvent);
    };
  }, [handleSubmit, editor]);

  useEffect(() => {
    if (editor) {
      if (!post) return;
      if (post?.content != editor.getHTML()) {
        editor.commands.setContent(post.content);
      }
    }
  }, [post, editor]);

  // const triggerAttachment = () => attachToPost();

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
    setDeleteStep(0);
  }, [editable, editor]);

  const handleOnDelete = useCallback(async () => {
    if (deleteStep === 0) {
      setDeleteStep(1);
      return;
    }
    await deletePost();
    closeReplyFunction();
  }, [deleteStep, deletePost, closeReplyFunction]);

  const isBig = useCallback(() => {
    return editor?.storage.characterCount.characters() < 280;
  }, [editor]);

  const renderPostButton = () => {
    if (isAI) return 'Save AI response';
    if (isReply) return 'Reply';
    if (isNew) return 'Post';
    return 'Update';
  };

  if (!post) return null;

  let previewContent = post.content;
  if (searchTerm && !editable){
    previewContent = highlightTerms(previewContent, searchTerm);
  }

  return (
    <div className={`${styles.frame} !ml-1 ${isNew && styles.isNew}`}>
      {editable ? (
        <EditorContent
          key={'new'}
          className={`${styles.editor} ${isBig() && 'text-xs'} ${
            isAIResponding && styles.responding
          }`}
          editor={editor}
        />
      ) : (
        <div className={styles.uneditable}>
          <div
            key="uneditable"
            className={`${styles.editor} ${isBig() && 'text-xs!'}`}
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </div>
      )}

      <BookmarkPreviews post={post}/>

      {editable && (
        <div className={styles.footer}>
        <div className={styles.left}>
          {/* <button className={styles.button} onClick={triggerAttachment}>
            <Image className='w-5 h-5' strokeWidth={2.7} />
          </button> */}
        </div>
        <div className={styles.right}>
          {isReply && (
            <button className={styles.deleteButton} onClick={closeReplyFunction}>
              Close
            </button>
          )}
          {!isNew && (
            <button
              className={styles.deleteButton}
              onClick={handleOnDelete}
            >
              {deleteStep === 0 ? 'Delete' : 'Click again to confirm'}
            </button>
          )}
          <button
            tabIndex="0"
            className={`${styles.button} z-[10]`}
            onClick={handleSubmit}
          >
            {renderPostButton()}
          </button>
        </div>
      </div>
    )}
  </div>
  );
});

export default Editor;