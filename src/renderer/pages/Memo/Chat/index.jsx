import styles from './Chat.module.scss';
import {
  SettingsIcon,
  CrossIcon,
  ReflectIcon,
  RefreshIcon,
  DiscIcon,
  DownloadIcon,
  FlameIcon,
  ChatIcon,
} from 'renderer/icons';
import { useEffect, useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAIContext } from '../../../context/AIContext';
import { useMemoContext } from '../../../context/MemoContext';
import { useIndexContext } from '../../../context/IndexContext';
import Post from '../Posts/Post';
import TextareaAutosize from 'react-textarea-autosize';
import Reflecting from '../Toasts/Reflecting';
import { AnimatePresence, motion } from 'framer-motion';
import VirtualList from './VirtualList';
import Blobs from './blobs';
import { BrainCircuit } from 'lucide-react';
import useChat from '../../../hooks/useChat';


export default function Chat() {
  const { getAIResponse, addMessage, resetMessages } = useChat();
  const [container, setContainer] = useState(null);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState('');
  const [querying, setQuerying] = useState(false);
  const [history, setHistory] = useState([]);

  const onChangeText = (e) => {
    setText(e.target.value);
  };

  const onResetConversation = () => {
    setText('');
    setHistory([]);
    resetMessages();
  };

  const appendToLastSystemMessage = (token) => {
    setHistory((history) => {
      if (!history || history.length === 0) return [];
      const last = history[history.length - 1];
      if (last?.role === 'system') {
        return [
          ...history.slice(0, -1),
          { role: 'system', content: last?.content + (token ?? '') },
        ];
      }
    });
    console.log(history);
  };

  const onSubmit = async () => {
    if (text === '') return;
    setQuerying(true);
    const message = `${text}`;
    setText('');
    setHistory((prevHistory) => [...prevHistory, { role: 'user', content: message }]);
    const messages = await addMessage(message);
    setHistory((prevHistory) => [...prevHistory, { role: 'system', content: '' }]);
    await getAIResponse(messages, (token) => {
      setHistory((prevHistory) => {
        const lastMessage = prevHistory[prevHistory.length - 1];
        if (lastMessage.role === 'system') {
          return [
            ...prevHistory.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + token },
          ];
        }
        return prevHistory;
      });
    });
    setQuerying(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSubmit();
      event.preventDefault();
      return false;
    }
  };

  const renderHistory = () => {
    return history.map((text) => <div className={styles.text}>{text}</div>);
  };

  const osStyles = useMemo(
    () => (window.electron.isMac ? styles.mac : styles.win),
    []
  );

  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <div className={styles.iconHolder}>
            <BrainCircuit className={styles.chatIcon} strokeWidth={3}/>
          </div>
        </Dialog.Trigger>
        <Dialog.Portal container={container}>
          <Dialog.Overlay className={styles.DialogOverlay} />
          <Dialog.Content className={styles.DialogContent}>
            <div className={styles.scroller}>
              <AnimatePresence>
                <div className={styles.header}>
                  <div className={styles.wrapper}>
                    <Blobs show={querying} />
                    <Dialog.Title className={`${styles.DialogTitle}`}>
                      Chat with your journal
                    </Dialog.Title>
                    <div className={styles.buttons}>
                      <div
                        className={styles.button}
                        onClick={onResetConversation}
                      >
                        <RefreshIcon className={styles.icon} />
                        Clear chat
                      </div>
                      <Dialog.Close asChild>
                        <button
                          className={`${styles.close} ${osStyles}`}
                          aria-label="Close Chat"
                        >
                          <CrossIcon />
                        </button>
                      </Dialog.Close>
                    </div>
                  </div>
                </div>

                <div className={styles.answer}>
                  <VirtualList data={history} />
                </div>
              </AnimatePresence>

              <div className={styles.inputBar}>
                <AnimatePresence>
                  <div className={styles.holder}>
                    <div className={styles.inputbaroverlay}></div>
                    <div className={styles.bar}>
                      <TextareaAutosize
                        value={text}
                        onChange={onChangeText}
                        className={styles.textarea}
                        onKeyDown={handleKeyPress}
                        placeholder="Start chatting..."
                        autoFocus
                      />

                      <button
                        className={`${styles.ask} ${
                          querying && styles.processing
                        }`}
                        onClick={onSubmit}
                        disabled={querying}
                      >
                        {querying ? (
                          <Reflecting className={styles.spinner} />
                        ) : (
                          'Ask'
                        )}
                      </button>
                    </div>
                    <div className={styles.disclaimer}>
                      *AI can make mistakes. Consider checking important
                      information.
                    </div>
                  </div>
                </AnimatePresence>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div ref={setContainer} />
    </>
  );
}
