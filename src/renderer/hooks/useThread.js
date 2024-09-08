import {
    useCallback,
    useState,
    useEffect,
    useContext
} from 'react';
import { useMemoContext } from '../context/MemoContext';
import * as fileOperations from '../utils/fileOperations';
import { getPost } from './usePostHelpers';



const useThread = () =>{
    const {getCurrentMemoPath} = useMemoContext();
    const getThread = useCallback(async (parentPostpath) =>{
        if (!parentPostpath) return;
        const thread = [];
        const memoPath = getCurrentMemoPath(parentPostpath);
        const freshPost = await getPost(memoPath);
        const replies = freshPost.data?.replies || [];
        thread.push(freshPost)

        for (const replyPath in replies){
            const path = getCurrentMemoPath(replyPath);
            const reply = getPost(path);
            thread.push(reply)
        }
        return thread;
    }, [getCurrentMemoPath]);

    return {getThread};
}

export default useThread;
