import React from 'react';
import styles from './RelevantPost.module.scss';

const RelevantPost = ({ post }) => {
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <div className={styles.relevantPost}>
      <h4 className={styles.title}>{post.name}</h4>
      <p className={styles.content}>{truncateText(post.content)}</p>
    </div>
  );
};

export default RelevantPost;

