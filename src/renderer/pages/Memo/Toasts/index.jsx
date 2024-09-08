import React from 'react';
import styles from './Toast.module.scss';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemoToastsContext } from '../../../context/ToastContext';
import Reflecting from './Reflecting';

const Toast = ({ notification }) => {
  const renderIcon = (type) => {
    switch (type) {
      case 'reflecting':
        return <Reflecting className={styles.icon} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 0, scale: 0.9 }}
      transition={{ delay: 0.1 }}
    >
      <div className={`${styles.toast} ${styles[notification.type]}`}>
        {notification.message}
        {renderIcon(notification.type)}
      </div>
    </motion.div>
  );
};

export default function Toasts() {
  const { notifications } = useMemoToastsContext();

  return (
    <div className={styles.toastContainer}>
      <AnimatePresence>
        {notifications.map((notification) => (
          <Toast key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
}
