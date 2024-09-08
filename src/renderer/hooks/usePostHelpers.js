import {
    getDirectoryPath,
    generateMarkdown,
    getFilePathForNewPost,
    saveFile,
    createDirectory,
    deleteFile,
  } from '../utils/fileOperations';
  import matter from 'gray-matter';


  export const getPost = async (postPath) => {
    try {
      if (!postPath) return null;
      
      const fileContent = await window.electron.ipc.invoke(`get-file`, postPath);
      console.log('File content:', fileContent);
      
      if (!fileContent) {
        console.error('File content is empty or null');
        
      }
      
      const parsedContent = await window.electron.ipc.invoke('matter-parse', fileContent);
      console.log('Parsed content:', parsedContent);
      
      if (!parsedContent || !parsedContent.content) {
        console.error('Parsed content is invalid');
        
      }
      
      const post = {content: parsedContent.content, data: parsedContent.data || {}};
      return post;
    } catch (error) {
      console.error('Error getting post:', error);
      
    }
  }

  export const attatchToPostCreator = (setPost, getCurrentMemoPath) => (imageData, fileExtention) => {
    const memoPath = getCurrentMemoPath();

    let attatchments = [];
    if (imageData) {
        // If there is an image data, save it to a file.
        const newFilePath = window.electron.ipc.invoke('save-file', 
            {
                content: imageData,
                fileExtention: fileExtention,
                memoPath: memoPath
            }   
        );

        if (newFilePath){
            attatchments.push(newFilePath);
        } else {
            console.error('Error saving image file');
        }
    } else{
        newAttatchments = window.electron.ipc.invoke('open-file', {
            memoPath: memoPath
        })
    }

    const correctedPaths = attatchments.map((path) => {
        const pathArr = path.split(/[/\\]/).slice(-4)
        const newPath = window.electron.joinPath(...pathArr);
        return newPath;
    })

    const setPost = (post) =>{
        const attatchments = [...correctedPaths, ...post.data.attatchments]
        const newPost = {
            ...post,
            data: {...post.data, attatchments}
        }
        return newPost;
    }

  }

  export const detachFromPostCreator = (setPost, getCurrentMemoPath) => (attatchmentPath) => {
    setPost(
        (post) => {
            let newPost = JSON.parse(JSON.stringify(post));
            // filters out attatchment form post, doesn't delete from file system.
            const newAttatchments = newPost.data.attatchments.filter((att) = att !== attatchmentPath)
            newPost.data.attatchments = newAttatchments;

            const fullPath = window.electron.joinPath(getCurrentMemoPath(), attatchmentPath);

            window.electron.ipc.invoke('delete-file', fullPath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err)
                } else{
                    console.log('file deleted successfully')
                }
            });
            console.log('attatchment removed')

            return newPost;
        }
    )
  }


  export const tagActionsCreator = (setPost, action) => {
    return (tag) => {
        setPost((post) => {
            if (action === "add"){
                return{
                    ...post,
                    data: {
                        ...post.data,
                        tags: [...post.data.tags, tag]
                    },
                };
            }
            if (action === 'remove' && post.data.tags.includes(tag)){
                return{
                    ...post,
                    data:{
                        ...post.data,
                        tags: post.data.tags.filter((t) => t !== tag)
                    },
                };
            }
            return post
        })
    }
  }
