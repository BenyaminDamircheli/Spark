import {
  useState,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useLocation } from 'react-router-dom';


export const MemoContext = createContext();

export const MemoContextProvider = ({ children }) => {
  const location = useLocation();
  const [currentMemo, setCurrentMemo] = useState(null);
  const [memos, setMemos] = useState([]);

  // Initialize config file
  useEffect(() => {
    getConfig();
  }, [location]);

  // Set the current memo based on the url
  useEffect(() => {
    if (!location.pathname) return;
    if (!location.pathname.startsWith('/memo/')) return;

    const currentMemoName = location.pathname.split(/[/\\]/).pop();

    changeCurrentMemo(currentMemoName);
  }, [location.pathname]);

  const getConfig = async () => {
    const configFilePath = window.electron.getConfigPath();

    // Setup new memos.json if doesn't exist,
    // or read in the existing
    if (!window.electron.existsSync(configFilePath)) {
      window.electron.writeFile(configFilePath, JSON.stringify([]), (err) => {
        if (err) return;
        setMemos([]);
      });
    } else {
      await window.electron.readFile(configFilePath, (err, data) => {
        if (err) return;
        const jsonData = JSON.parse(data);
        setMemos(jsonData);
      });
    }
  };

  const getCurrentMemoPath = (appendPath = '') => {
    if (!currentMemo) return;
    const memo = memos.find((m) => m.name == currentMemo.name);
    const path = window.electron.joinPath(memo.path, appendPath);
    return path;
  };

  const writeConfig = async (memos) => {
    if (!memos) return;
    const configFilePath = window.electron.getConfigPath();
    window.electron.writeFile(configFilePath, JSON.stringify(memos), (err) => {
      if (err) {
        console.error('Error writing to config');
        return;
      }
    });
  };

  const createMemo = (name = '', selectedPath = null) => {
    if (name == '' && selectedPath == null) return;

    let path = selectedPath;

    if (memos.find((m) => m.name == name)) {
      return;
    }

    // If selected directory is not empty, create a new directory
    if (!window.electron.isDirEmpty(selectedPath)) {
      path = window.electron.joinPath(selectedPath, name);
      window.electron.mkdir(path);
    }
  
    const newMemos = [{ name, path }, ...memos];
    setMemos(newMemos);
    writeConfig(newMemos);

    return name;
  };

  const changeCurrentMemo = (name) => {
    if (!memos || memos.length == 0) return;
    const memo = memos.find((m) => m.name == name);
    setCurrentMemo(memo);
  };

  // This does not delete the actual folder
  // User can do that if they actually want to.
  const deleteMemo = (name) => {
    if (!memos || memos.length == 0) return;
    const newMemos = memos.filter((m) => m.name != name);
    setMemos(newMemos);
    writeConfig(newMemos);
  };

  // Update current memo
  const updateCurrentMemo = (newMemo) => {
    const newMemos = memos.map((memo) => {
      if (memo.path === currentMemo.path) {
        return newMemo;
      }
      return memo;
    });
    writeConfig(newMemos);
    setCurrentMemo(newMemo);
  };

  const memoContextValue = {
    memos,
    getCurrentMemoPath,
    createMemo,
    currentMemo,
    deleteMemo,
    updateCurrentMemo,
  };

  return (
    <MemoContext.Provider value={memoContextValue}>
      {children}
    </MemoContext.Provider>
  );
};

export const useMemoContext = () => useContext(MemoContext);