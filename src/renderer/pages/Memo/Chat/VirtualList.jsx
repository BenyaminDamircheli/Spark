import styles from './Chat.module.scss';
import { useCallback, useEffect, useRef, memo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import Scrollbar from './Scrollbar';
import Intro from './Intro';
import Message from './Message';

const VirtualList = memo(({ data }) => {
  const virtualListRef = useRef();

  useEffect(() => {
    scrollToBottom();
  }, [data]);

  const scrollToBottom = (align = 'end') => {
    virtualListRef?.current?.scrollToIndex({
      index: data.length - 1,
      align,
    });
  };

  const renderItem = useCallback(
    (index) => {
      const message = data[index];
      return (
        <Message
          key={message.id || `message-${index}`}
          index={index}
          message={message}
          scrollToBottom={scrollToBottom}
        />
      );
    },
    [data]
  );

  return (
    <Virtuoso
      ref={virtualListRef}
      style={{ height: 'calc(100vh - 200px)' }}
      totalCount={data.length}
      itemContent={renderItem}
      initialTopMostItemIndex={data.length - 1}
      components={{
        Header: Intro,
        Footer: () => <div style={{ paddingTop: '140px' }}></div>,
        Scroller: Scrollbar
      }}
      followOutput={'smooth'}
    />
  );
});

export default VirtualList;
