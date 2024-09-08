import { Routes, Route, useLocation } from 'react-router-dom';
import { MemoContextProvider } from './context/MemoContext';
import Home from './pages/Home';
import icon from '../../assets/icon.svg';
import './App.scss';
import "tailwindcss/tailwind.css";
import { motion, AnimatePresence } from 'framer-motion';
import CreateMemo from './pages/createMemo';
import Memo from './pages/Memo';
import { AIContextProvider } from './context/AIContext';
import { BookmarksContextProvider } from './context/BookmarksContext';
import { VirtualListContextProvider } from './context/VirtualListContext';
import { IndexContextProvider } from './context/IndexContext';

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  duration: 0.05,
};

const AnimatedPage = ({ children, _key = '', down = false }) => {
  return (
    <motion.div
      key={_key}
      initial={{ opacity: 0, translateY: down ? 0 : 40 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: down ? 0 : 140 }}
      transition={{ ...transition }}
    >
      {children}
    </motion.div>
  );
};

export default function App() {
  const location = useLocation();
  return (
    <MemoContextProvider>
      <AIContextProvider>
        <IndexContextProvider>
        <BookmarksContextProvider>
          <VirtualListContextProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <AnimatedPage _key='home'>
                <Home />
              </AnimatedPage>
            }
          />
          <Route
            path="/new-memo"
            element={
              <AnimatedPage _key='new-memo'>
                <CreateMemo />
              </AnimatedPage>
            }
          />
          <Route
            path="/memo/:memoName"
            element={
              <AnimatedPage down _key="memo">
                <Memo />
              </AnimatedPage>
            }

          >
            <Route path="category/:categoryName" element={} />
            <Route path="feed" element={} />
            <Route path="bookmarks" element={} />
          </Route>
        </Routes>
      </AnimatePresence>
      </VirtualListContextProvider>
      </BookmarksContextProvider>
      </IndexContextProvider>
      </AIContextProvider>
    </MemoContextProvider>
  );
}
