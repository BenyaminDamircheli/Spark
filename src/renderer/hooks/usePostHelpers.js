import {
  generateMarkdown,
  createDirectory,
  saveFile,
  deleteFile,
  getNewPostPath,
  getDirectoryPath,
} from '../utils/fileOperations';

export const getPost = async (postPath) => {
  try {
    if (!postPath) return;
    const fileContent = await window.electron.ipc.invoke('get-file', postPath);
    const parsed = await window.electron.ipc.invoke(
      'matter-parse',
      fileContent
    );
    const post = { content: parsed.content, data: parsed.data };
    return post;
  } catch (error) {
    console.error('Error getting post:', error);
  }
};

export const attatchToPostCreator =
  (setPost, getCurrentMemoPath) => async (imageData, fileExtension) => {
    const storePath = getCurrentMemoPath();

    let newAttachments = [];
    if (imageData) {
      const newFilePath = await window.electron.ipc.invoke('save-file', {
        fileData: imageData,
        fileExtension: fileExtension,
        storePath: storePath,
      });

      if (newFilePath) {
        newAttachments.push(newFilePath);
      } else {
        console.error('Failed to save the pasted image.');
      }
    } else {
      newAttachments = await window.electron.ipc.invoke('open-file', {
        storePath: storePath,
      });
    }

    const correctedPaths = newAttachments.map((path) => {
      const pathArr = path.split(/[/\\]/).slice(-4);
      const newPath = window.electron.joinPath(...pathArr);
      return newPath;
    });

    setPost((post) => {
      const attachments = [...correctedPaths, ...post.data.attachments];
      return {
        ...post,
        data: { ...post.data, attachments },
      };
    });
  };

export const detachFromPostCreator =
  (setPost, getCurrentMemoPath) => (attachmentPath) => {
    setPost((post) => {
      const newAttachments = post.data.attachments.filter(
        (a) => a !== attachmentPath
      );

      const fullPath = window.electron.joinPath(
        getCurrentMemoPath(),
        attachmentPath
      );

      window.electron.deleteFile(fullPath, (err) => {
        if (err) {
          console.error('There was an error:', err);
        } else {
          console.log('File was deleted successfully');
        }
      });

      console.log('Attachment removed', attachmentPath);

      return {
        ...post,
        data: { ...post.data, attachments: newAttachments },
      };
    });
  };

export const tagActionsCreator = (setPost, action) => {
  return (tag) => {
    setPost((post) => {
      if (action === 'add' && !post.data.tags.includes(tag)) {
        return {
          ...post,
          data: {
            ...post.data,
            tags: [...post.data.tags, tag],
          },
        };
      }
      if (action === 'remove' && post.data.tags.includes(tag)) {
        return {
          ...post,
          data: {
            ...post.data,
            tags: post.data.tags.filter((t) => t !== tag),
          },
        };
      }
      return post;
    });
  };
};

export const setCategoryCreator = (setPost, savePost) => {
  return (category) => {
    setPost((post) => ({
      ...post,
      data: { ...post.data, category: category },
    }));
    savePost({ category: category });
  };
};

export const updatePostCategory = async (postPath, categoryName) => {
  try {
    const updatedCategories = await window.electron.ipc.invoke(
      'categories-update-post',
      postPath,
      categoryName
    );
    return updatedCategories;
  } catch (error) {
    console.error('Error updating post category:', error);
    throw error;
  }
};