import { useState, useCallback, useEffect } from 'react';
import { Tweet } from 'react-tweet';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookmarksContext } from '../../../../context/BookmarksContext'; 
import { Link2 } from 'lucide-react';
import styles from './BookmarkCard.module.scss'

const isTwitterUrl = (url) => {
  // regex to check if the url is a twitter url.
  const twitterRegex =
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/([a-zA-Z0-9_]+\/status\/[0-9]+|i\/bookmarks\?post_id=[0-9]+)/;
  return twitterRegex.test(url);
};

const isUrlYouTubeVideo = (url) => {
  // regex to check if the url is a youtube url.
  const regExp =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return regExp.test(url);
};

export default function BookmarkPreview({ url }) {
  const { getBookmarks } = useBookmarksContext();
  const [expanded, setExpanded] = useState(false);
  const [preview, setPreview] = useState(null);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const data = await getBookmarks(url);
        console.log('data here', data);
        if (data === null) {
          console.log('URL being used:', url);
        }
        setPreview(data);
      } catch (error) {
        console.error('Error fetching bookmark:', error);
      }
    };
    fetchPreview();
  }, [url]);

  if (!preview)
    return (
      <div className="bg-[#252422] rounded-[10px] animate-pulse w-[200px] h-[200px] m-2 transition-all duration-200 ease-in-out"></div>
    );

  const createTwitterEmbed = (url) => {
    const tweetIdRegex = /\/status\/(\d+)/;
    const match = url.match(tweetIdRegex);
    const tweetId = match ? match[1] : null;

    if (tweetId) {
      console.log('tweetId', tweetId);
      return (
        <div className={styles.twitterStyle}>
          <Tweet id={tweetId} />
        </div>
      );
    } else {
      console.error('Failed to extract tweet ID from URL:', url);
      return null;
    }
  };

  const createYoutubeEmbed = (url) => {
    const youtubeRegEx =
      /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(youtubeRegEx);

    if (match && match[2].length === 11) {
      return (
        <div className="m-2 p-[3px] pb-0 rounded-[17px] bg-[#F9F2E2] w-full max-w-[560px] hover:bg-[#F9F2E2]/80">
          <iframe
            className="w-full h-[340px] rounded-[14px] m-0 p-0 border-none after:hidden"
            src={`https://www.youtube.com/embed/${match[2]}?si=w-plylbVGS7t7O4b"`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
            allowFullScreen
          />
        </div>
      );
    } else {
      return null;
    }
  };

  const renderImage = () => {
    if (!preview?.images || preview?.images.length == 0) return null;

    const image = preview.images[0];
    return (
      <div className=" flex justify-center items-center p-2 rounded-[17px] bg-[#F0E6D2] w-full max-w-[380px] max-h-[500px] hover:bg-[#F0E6D2]/80">
        <img
          src={image}
          className="w-full h-auto rounded-[14px] m-0 p-0 border-none after:hidden"
        />
      </div>
    );
  };

  if (isTwitterUrl(url)) {
    return createTwitterEmbed(url);
  }

  if (isUrlYouTubeVideo(url)) {
    return createYoutubeEmbed(url);
  }

  const renderAICard = () => {
    if (!preview.aiCard) return;

    return (
      <div>
        <div>{preview?.aiCard?.summary}</div>

        {/* Highlights */}
        {preview?.aiCard?.highlights?.length > 0 && (
          <ul className={`${styles.highlights} ${expanded && styles.show}`}>
            {preview.aiCard.highlights.map((highlight, index) => (
              <li key={`preview-${index}`}>{highlight}</li>
            ))}
            <div
              key={'overlay'}
              className={`${styles.overlay} ${expanded && styles.hidden}`}
            ></div>
          </ul>
        )}

        {/* Buttons */}

        {preview?.aiCard?.buttons?.length > 0 && (
          <div className={styles.buttons}>
            {preview?.aiCard?.buttons.map((btn, index) => (
              <a
                key={`button-${index}`}
                href={btn.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Link2 className="w-4 h-4 text-[#696157]" />
                {btn.title}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className={`${styles.card}`} onClick={toggleExpanded}>
        <div className="overflow-hidden rounded-t-[17px]">
          {renderImage()}
        </div>
        <div className={styles.content}>
          <a
            href={url}
            target="_blank"
            className={styles.title}
            rel="noopener noreferrer"
          >
            {preview.title}
          </a>
        </div>
        {renderAICard()}
        <div className={styles.footer}>
          <img className={styles.favicon} src={preview.favicon} />{' '}
          {preview?.aiCard?.category && (
            <span className={styles.category}>
              {preview?.aiCard?.category}
            </span>
          )}
          {preview?.host}
        </div>
      </div>
    </motion.div>
  );
}