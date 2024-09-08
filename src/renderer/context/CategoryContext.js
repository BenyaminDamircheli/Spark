import {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useMemoContext } from './MemoContext';

export const CategoryContext = createContext();

export const CategoryContextProvider = ({ children }) => {
  const { currentMemo, getCurrentMemoPath } = useMemoContext();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState(new Map());

  const openCategories = (e) => {
    setOpen(true);
  };

  const onOpenChange = (open) => {
    setOpen(open);
  };

  useEffect(() => {
    if (currentMemo) {
      loadCategories(getCurrentMemoPath());
    }
  }, [currentMemo]);

  const loadCategories = useCallback(async (memoPath) => {
    const newCategories = await window.electron.ipc.invoke(
      'categories-load',
      memoPath
    );
    const newMap = new Map(newCategories);
    setCategories(newMap);
  }, []);

  const refreshCategories = useCallback(async () => {
    const newCategories = await window.electron.ipc.invoke('categories-get');
    const newMap = new Map(newCategories);
    setCategories(newMap);
  }, []);

  const createCategory = useCallback(async (categoryName) => {
    window.electron.ipc
      .invoke('categories-create', categoryName)
      .then((categories) => {
        setCategories(categories);
      });
  }, []);

  const deleteCategory = useCallback(async (categoryName) => {
    window.electron.ipc
      .invoke('categories-delete', categoryName)
      .then((categories) => {
        setCategories(categories);
      });
  }, []);

  const updateCategory = (categoryName, content) => {
    // Implement if needed
  };

  const categoryContextValue = {
    open,
    openCategories,
    onOpenChange,
    categories,
    refreshCategories,
    createCategory,
    deleteCategory,
  };

  return (
    <CategoryContext.Provider value={categoryContextValue}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => useContext(CategoryContext);