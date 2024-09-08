import {
    useState,
    createContext,
    useContext,
    useEffect,
    useRef,
  } from 'react';
  
  export const MemoToastsContext = createContext();
  
  export const MemoToastsContextProvider = ({ children }) => {
    const [notificationsQueue, setNotificationsQueue] = useState([]);
  
    const notificationTimeoutRef = useRef();
  
    const processQueue = () => {
      if (notificationsQueue.length > 0) {
        notificationTimeoutRef.current = setTimeout(() => {
          setNotificationsQueue((currentQueue) => {
            const rest = currentQueue.slice(1)
  
            if (rest.length !== 0) {
              const next = rest[0];
              next.onEnter && next.onEnter();
            }
  
            return rest;
          });
        }, notificationsQueue[0].dismissTime || 5000);
      }
    };
  
    useEffect(() => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = null;
      }
  
      processQueue();
  
      return () => {
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current);
        }
      };
    }, [notificationsQueue]);
  
    const addNotification = ({
      id,
      type = 'info',
      message,
      dismissTime = 5000,
      immediate = false,
      onEnter = null,
    }) => {
      const newNotification = { id, type, message, dismissTime, onEnter };
      setNotificationsQueue((currentQueue) => immediate ? [newNotification] : [...currentQueue, newNotification]);
    };
  
    const updateNotification = (targetId, newType, newMessage) => {
      setNotificationsQueue((currentQueue) =>
        currentQueue.map((notification) =>
          notification.id === targetId
            ? { ...notification, type: newType, message: newMessage }
            : notification
        )
      );
    };
  
    const removeNotification = (targetId) => {
      setNotificationsQueue((currentQueue) =>
        currentQueue.filter((notification) => notification.id !== targetId)
      );
  
      if (
        notificationsQueue.length > 0 &&
        notificationsQueue[0].id === targetId
      ) {
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = null;
        processQueue();
      }
    };
  
    const MemoToastsContextValue = {
      notifications: notificationsQueue,
      addNotification,
      updateNotification,
      removeNotification,
    };
  
    return (
      <MemoToastsContext.Provider value={MemoToastsContextValue}>
        {children}
      </MemoToastsContext.Provider>
    );
  };
  
  export const useMemoToastsContext = () => useContext(MemoToastsContext);
  