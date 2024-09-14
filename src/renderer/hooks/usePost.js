import { useState, useEffect, useCallback, useMemo } from "react";
import { useIndexContext } from "../context/IndexContext";
import { useMemoContext } from "../context/MemoContext";
import { useCategoryContext } from "../context/CategoryContext";
import * as fileOperations from '../utils/fileOperations.js';
import {
    getPost,
    attatchToPostCreator,
    tagActionsCreator,
    detachFromPostCreator,
} from './usePostHelpers.js';


const defaultPost = {
    content: '',
    data: {
        title: '',
        createdAt: null,
        updatedAt: null,
        tags: [],
        replies: [],
        attachments: [],
        referencedPosts: [],
        highlightColor: null,
        highlight: null,
        area: null,
        parentPostPath: null,
        isAI: false,
        isReply: false,
        category: null,
    }
};

function usePost(
    postPath = null, // relative path
    {
      isReply = false,
      isAI = false,
      parentPostPath = null, // relative path
      reloadParentPost = () => {},
    } = {}
  ) {
    console.log('usePost hook called with path:', postPath);
    const { addIndex, removeIndex, refreshIndex, updateIndex } =
      useIndexContext();
    const { getCurrentMemoPath, currentMemo } = useMemoContext();
    const { updatePostCategory } = useCategoryContext();
    const [updates, setUpdates] = useState(0);
    const [path, setPath] = useState(null);
    const [post, setPost] = useState({ ...defaultPost });
  
    useEffect(() => {
      if (!postPath || postPath === '0' || postPath === 0) {
        console.error('Invalid postPath in usePost:', postPath);
        return;
      }
      const fullPath = window.electron.joinPath(getCurrentMemoPath(), postPath);
      console.log('Setting fullPath in usePost:', fullPath);
      setPath(fullPath);
    }, [postPath, currentMemo]);
  
    useEffect(() => {
      if (!path) return;
      console.log('Refreshing post with path:', path);
      refreshPost();
    }, [path]);
  
    const refreshPost = useCallback(async () => {
      if (!path) return;
      console.log('Fetching post data for path:', path);
      const freshPost = await getPost(path);
      console.log('Fetched post data:', freshPost);
      setPost(freshPost);
    }, [path]);
  
    const savePost = useCallback(
      async (dataOverrides) => {
        const saveToPath = path
          ? path
          : fileOperations.getNewPostPath(getCurrentMemoPath());
        const directoryPath = fileOperations.getDirectoryPath(saveToPath);
        const now = new Date().toISOString();
        const content = post.content;
        const data = {
          ...post.data,
          isAI: post.data.isAI === true ? post.data.isAI : isAI,
          isReply: post.data.createdAt ? post.data.isReply : isReply,
          createdAt: post.data.createdAt ?? now,
          updatedAt: now,
          ...dataOverrides,
        };
  
        try {
          const fileContents = await fileOperations.generateMarkdown(
            content,
            data
          );
  
          await fileOperations.createDirectory(directoryPath);
          await fileOperations.saveFiles(saveToPath, fileContents);
  
          if (isReply) {
            await addReplyToParent(parentPostPath, saveToPath);
          }
  
          const postRelativePath = saveToPath.replace(
            getCurrentMemoPath() + window.electron.pathSeparator,
            ''
          );
          addIndex(postRelativePath, parentPostPath); // Add the file to the index
          // window.electron.ipc.invoke('tags-sync', saveToPath); // Sync tags
        } catch (error) {
          console.error(`Error writing file: ${saveToPath}`);
          console.error(error);
        }
      },
      [path, post, reloadParentPost, updatePostCategory]
    );
  
    const addReplyToParent = async (parentPostPath, replyPostPath) => {
      const relativeReplyPath = window.electron.joinPath(
        ...replyPostPath.split(/[/\\]/).slice(-3)
      );
      const fullParentPostPath = getCurrentMemoPath(parentPostPath);
      const parentPost = await getPost(fullParentPostPath);
      const content = parentPost.content;
      const data = {
        ...parentPost.data,
        replies: [...parentPost.data.replies, relativeReplyPath],
      };
      const fileContents = await fileOperations.generateMarkdown(content, data);
      await fileOperations.saveFiles(fullParentPostPath, fileContents);
      updateIndex(parentPostPath, data);
      reloadParentPost(parentPostPath);
    };
  
    const deletePost = useCallback(async () => {
      if (!postPath) return null;
      const fullPostPath = getCurrentMemoPath(postPath);
  
      // if reply, remove from parent
      if (post.data.isReply && parentPostPath) {
        const fullParentPostPath = getCurrentMemoPath(parentPostPath);
        const parentPost = await getPost(fullParentPostPath);
        const content = parentPost.content;
        const newReplies = parentPost.data.replies.filter((p) => {
          return p !== postPath;
        });
        const data = {
          ...parentPost.data,
          replies: newReplies,
        };
        const fileContents = await fileOperations.generateMarkdown(content, data);
        await fileOperations.saveFiles(fullParentPostPath, fileContents);
        updateIndex(parentPostPath, data);
        await reloadParentPost();
      }
  
      // delete file and remove from index
      await fileOperations.deleteFile(fullPostPath);
      removeIndex(postPath);
      
      // Remove post from its category
      if (post.data.category) {
        await updatePostCategory(postPath, null);
      }
    }, [postPath, reloadParentPost, parentPostPath, post, updatePostCategory]);
  
    const postActions = useMemo(
      () => ({
        setContent: (content) => setPost((post) => ({ ...post, content })),
        updateData: (data) =>
          setPost((post) => ({ ...post, data: { ...post.data, ...data } })),
        addTag: tagActionsCreator(setPost, 'add'),
        removeTag: tagActionsCreator(setPost, 'remove'),
        attachToPost: attatchToPostCreator(setPost, getCurrentMemoPath),
        detachFromPost: detachFromPostCreator(setPost, getCurrentMemoPath),
        resetPost: () => setPost(defaultPost),
        updateCategory: async (categoryName) => {
          await updatePostCategory(postPath, categoryName);
          setPost((post) => ({
            ...post,
            data: { ...post.data, category: categoryName },
          }));
          await savePost({ category: categoryName });
        },
      }),
      [post, savePost, updatePostCategory, postPath]
    );
  
    return {
      defaultPost,
      post,
      path,
      refreshPost,
      savePost,
      deletePost,
      ...postActions,
    };
  }
  
  export default usePost;