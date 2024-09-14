import styles from './inputBar.module.scss';
import {
  SettingsIcon,
  CrossIcon,
  ReflectIcon,
  RefreshIcon,
  DiscIcon,
  DownloadIcon,
  FlameIcon,
  InfoIcon,
  SearchIcon,
  Search2Icon,
} from '../../../../icons';
import { useEffect, useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAIContext } from '../../../../context/AIContext';
import { useMemoContext } from '../../../../context/MemoContext';
import TextareaAutosize from 'react-textarea-autosize';
import useIPCListener from '../../../../hooks/useIPCListener';
import Reflecting from '../../Toasts/Reflecting';
import { Search } from 'lucide-react';


export default function InputBar({
  value,
  onChange,
  close,
  querying = false,
  onSubmit,
}) {
  const statusFromMain = useIPCListener('vector-index', '');
  const [setupRun, setSetupRun] = useState(false);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState({
    type: 'loading',
    message: 'Loading index...',
  });

  useEffect(() => {
    if (statusFromMain) {
      setStatus(statusFromMain.type);
      setMessage(statusFromMain);

      const timer = setTimeout(() => {
        setStatus('');
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [statusFromMain]);

  // Setup sequence for the vector store
  const setup = async () => {
    // 1. Get the vector store
    // 2. Initialize the vector store
    // 3. If the index is empty and there are more than 1 entries
    setStatus('');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSubmit();
      event.preventDefault();
      return false;
    }
  };

  useEffect(() => {
    if (setupRun) return;
    setup();
    setSetupRun(true);
  }, [setupRun]);

  const renderIcon = (status) => {
    switch (status) {
      case 'loading':
        return <Waiting className={styles.waiting} />;
      case 'querying':
        return <Waiting className={styles.waiting} />;
      case 'indexing':
        return <Waiting className={styles.waiting} />;
      case 'done':
        return <InfoIcon className={styles.reflectIcon} />;
      default:
        return <SearchIcon className={styles.reflectIcon} />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.bar}>
          <input
            value={value}
            onChange={onChange}
            className={styles.textarea}
            onKeyDown={handleKeyPress}
            placeholder={'What are you looking for?'}
          />
        </div>
        <div className={styles.buttons}>
          <button
            className={`${styles.ask} ${querying && styles.processing}`}
            onClick={onSubmit}
            disabled={querying}
          >
            {querying ? (
              <Reflecting className={styles.spinner} />
            ) : (
              <Search className="w-5 h-5" strokeWidth={3} />
            )}
          </button>
          <Dialog.Close asChild>
            <button className={styles.close} aria-label="Close search">
              <CrossIcon className={styles.icon} />
            </button>
          </Dialog.Close>
        </div>
      </div>
    </div>
  );
}


