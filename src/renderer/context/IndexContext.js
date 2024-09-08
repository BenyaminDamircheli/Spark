import {
    useState,
    useEffect, 
    useContext, 
    useCallback,
    createContext
} from 'react';
import { useLocation} from 'react-router-dom';
import { useMemoContext } from './MemoContext';

export const IndexContext = createContext();

export const IndexContextProvider = ({ children }) => {
    const { currentMemo, getCurrentMemoPath } = useMemoContext();
    const [filters, setFilters] = useState();
    const [searchOpen, setSearchOpen] = useState(false);
    const [index, setIndex] = useState(new Map());
    const [latestThreads, setLatestThreads] = useState([])

    useEffect(() => {
        if (currentMemo) {
            loadIndex(getCurrentMemoPath());
            loadLatestThreads();
        }
    }, [currentMemo]);

    const loadIndex = useCallback(async (path) => {
        const newIndex = await window.electron.ipc.invoke("index-load", path);
        const newIndexMap = new Map(newIndex);
        setIndex(newIndexMap);        
    }, []);

    const refreshIndex = useCallback(async () => {
        const newIndex = await window.electron.ipc.invoke('index-get');
        const newIndexMap = new Map(newIndex);
        setIndex(newIndexMap);
    }, []);

    const addIndex = useCallback(async (currPath, parentPath = null) => {
        const memoPath = getCurrentMemoPath();

        await window.electron.ipc.invoke('index-add', currPath)
        .then((index) => {
            setIndex(index);
            loadLatestThreads();
        })
        .catch(console.error);        
    }, [currentMemo]);

    const getThreadsAsText = useCallback(async (filePaths) => {
        return window.electron.ipc.invoke('index-get-threads-as-text', filePaths)
    }, []);

    const updateIndex = useCallback(async (path, text) => {
        return window.electron.ipc.invoke('index-update', path, text).then((index) => {
            setIndex(index);
            loadLatestThreads();
        }).catch(console.error);
    }, []);

    const removeIndex = useCallback(async (path) => {
        return window.electron.ipc.invoke('index-remove', path).then((index) => {
            setIndex(index);
            loadLatestThreads();
        }).catch(console.error);
    }, []);

    const search = useCallback( (query) => {
        return window.electron.ipc.invoke('index-search', query);
    }, []);

    const vectorSearch = useCallback((query, topK) =>{
        return window.electron.ipc.invoke('index-vector-search', query, topK);
    }, []);

    const loadLatestThreads = useCallback( async (count = 25) =>{
        const threads = await search('');
        const latest = threads.slice(0, count);

        const postFilePath = latest.map(thread => thread.ref);
        const postText = await getThreadsAsText(postFilePath);

        setLatestThreads(postText);
    }, []);

    const indexContextValue  = {
        index,
        latestThreads,
        search,
        vectorSearch,
        addIndex,
        updateIndex,
        removeIndex,
        refreshIndex,
        getThreadsAsText,
        setSearchOpen,
        searchOpen,
        filters,
        setFilters
    }

    return (
        <IndexContext.Provider value={indexContextValue}>
            {children}
        </IndexContext.Provider>
    );
};

export const useIndexContext = () => useContext(IndexContext);