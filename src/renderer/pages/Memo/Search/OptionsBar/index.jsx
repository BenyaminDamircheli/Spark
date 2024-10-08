import { Paperclip, Tag, Target } from 'lucide-react';
import styles from './OptionsBar.module.scss';
import * as Switch from '@radix-ui/react-switch';

export default function OptionsBar({ options, setOptions, onSubmit }) {
  const flipValue = (e) => {
    const key = e.target.name;
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRecent = (e) => {
    setOptions((prev) => ({ ...prev, sortOrder: e.target.name }));
  };

  const toggleSearchMode = () => {
    setOptions((prev) => ({ ...prev, semanticSearch: !prev.semanticSearch }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <button
          className={`${styles.button} ${
            options.sortOrder === 'relevance' && styles.active
          }`}
          name={'relevance'}
          onClick={toggleRecent}
        >
          <Target className='w-5 h-5' strokeWidth={3} /> Relevance
        </button>
        <button
          className={`${styles.button} ${
            options.sortOrder === 'mostRecent' && styles.active
          }`}
          name={'mostRecent'}
          onClick={toggleRecent}
        >
          ↑ Recent
        </button>
        <button
          className={`${styles.button} ${
            options.sortOrder === 'oldest' && styles.active
          }`}
          name={'oldest'}
          onClick={toggleRecent}
        >
          ↓ Oldest
        </button>        
      </div>
      <div className={styles.right}>
        <div className={styles.switch}>
          <label className={styles.Label} htmlFor="semantic-search">
            Semantic
          </label>
          <Switch.Root
            id={'semantic-search'}
            className={styles.SwitchRoot}
            checked={options.semanticSearch}
            onCheckedChange={toggleSearchMode}
          >
            <Switch.Thumb className={styles.SwitchThumb} />
          </Switch.Root>
        </div>
      </div>
    </div>
  );
}


