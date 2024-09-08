
import { useCallback, useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookmarkPreview from './Bookmark';
import { useMemoToastsContext } from '../../../../context/ToastContext';


const extractLinks = (htmlString: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const regex = /https:\/\/[^\s/$.?#].[^\s]*/gi;
  function extractText(node: Node, urls: string[]) {
    if (node.nodeType === Node.TEXT_NODE) {
      const matches = node.textContent?.match(regex);
      if (matches) {
        urls.push(...matches);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach((child: Node) => extractText(child, urls));
    }
  }

  const urls: string[] = [];
  extractText(doc.body, urls);
  return urls.filter((value, index, self) => self.indexOf(value) === index);
};

const LinkPreviews = memo(({ post, editable = false }) => {
  const { addNotification } = useMemoToastsContext();
  const getPreview = (url: string) => {
    return window.electron.ipc.invoke('get-link-preview', url);
  };
  const content = post.content ?? '';
  const links = extractLinks(content);

  if (links.length == 0) return;

  const renderLinks = () => {
    return links.map((url, i) => <BookmarkPreview key={`link-${url}`} url={url} />);
  };

  
  



  return (
    <div className='flex flex-wrap m-[-8px] mt-[10px] mb-[0px]'>
      <AnimatePresence>{renderLinks()}</AnimatePresence>
    </div>
  );
});
export default LinkPreviews;
