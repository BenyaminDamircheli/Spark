import {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useLocation } from 'react-router-dom';
import debounce from '../../main/utils/debounce';

export const VirtualListContext = createContext();

export const VirtualListContextProvider = ({children}) => {
    const [visibleIndex, _setVisibleIndex] = useState(0);
    const [closestDate, setClosestDate] = useState(new Date());
    const virtualListRef = useRef(null);

    const setVisibleIndex = debounce((index) => {
        _setVisibleIndex(index);
    }, 10);

    const scrollToIndex = useCallback((index = 0) => {
        if (!virtualListRef.current) return;
        if (index == -1) return;
        virtualListRef.current.scrollToIndex({
            index,
            align: 'end',
            behavior: 'smooth',
    })
    }, []);


    const virtualListContext = {
        virtualListRef,
        visibleIndex,
        setVisibleIndex,
        closestDate,
        setClosestDate,
        scrollToIndex,
    }


    return (
        <VirtualListContext.Provider value={virtualListContext}>
            {children}
        </VirtualListContext.Provider>
    )
}

export const useVirtualListContext = () => useContext(VirtualListContext);