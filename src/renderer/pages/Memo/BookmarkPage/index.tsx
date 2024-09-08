import { useEffect, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useBookmarksContext } from "../../../context/BookmarksContext";
import BookmarkPreview from "./BookmarkCard";
import { AnimatePresence } from "framer-motion";

const BookmarkPreviews = memo(() => {
  const [bookmarks, setBookmarks] = useState([]);
  const {getAllBookmarks} = useBookmarksContext();

  useEffect(() => {
    const fetchBookmarks = async () => {
      const fetchedBookmarks = await getAllBookmarks();
      setBookmarks(fetchedBookmarks);
    };

    fetchBookmarks();
  }, []);

  const renderPreviews = () => {
    return bookmarks.map((url, index) => (
      <BookmarkPreview key={`bookmark-${index}`} url={url} />
    ));
  };

  return (
    <div className='flex flex-wrap m-[-8px] mt-[10px] mb-[0px]'>
      <AnimatePresence>
        {renderPreviews()}
      </AnimatePresence>
    </div>
  );
});

export default BookmarkPreviews;