import { AnimatePresence, motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { memo } from 'react';
import styles from './Message.module.scss';
import { AIIcon } from '../../../../icons';

const Message = memo(({ message }) => {
  const isUser = message.role === 'user';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={`${styles.message} ${isUser ? styles.user : styles.ai}`}>
          <div className={styles.wrap}>
            <div className={styles.ball}>
              {isUser ? <User className="w-5 h-5 text-[#F6EFDF]" /> : <AIIcon className={styles.avatar} />}
            </div>
            <div className={styles.text}>{message.content}</div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

export default Message;