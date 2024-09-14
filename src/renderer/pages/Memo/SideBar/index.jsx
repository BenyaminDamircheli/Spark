import React from 'react';
import { Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCategoryContext } from '../../../context/CategoryContext';

const Sidebar = () => {
  const location = useLocation();
  const memoName = location.pathname.split('/')[2];
  const { categories } = useCategoryContext();

  return (
    <div className="w-full text-[#252422] p-4 flex flex-col">
      <div className="mb-6">
        <Link to={`/memo/${memoName}`} className="mb-2 text-[14px] block group hover:font-bold transition-all">Feed</Link>
        <Link to={`/memo/${memoName}/bookmarks`} className="mb-2 text-[14px] block group hover:font-bold transition-all">Bookmarks</Link>
      </div>
      
      <div className="mb-6">
        <p className="font-semibold mb-2 text-[13px]">Categories</p>
        {Array.from(categories).map(([category, data]) => (
          <Link key={category} to={`/memo/${memoName}/category/${category}`} className="flex items-center mb-2 group">
            <div className="w-4 h-4 rounded-full mr-2 group-hover:w-[17px] group-hover:h-[17px] transition-all" style={{ backgroundColor: data.color }}></div>
            <span className='text-[13px] group-hover:font-semibold transition-all'>{category}</span>
            <span className="ml-auto text-stone-500 text-xs group-hover:text-stone-800 transition-all">{data.posts.length}</span>
          </Link>
        ))}
      </div>
      
      <span role='button' className="text-[#63615A] cursor-pointer mb-2 text-sm flex items-center justify-center group hover:bg-[#F9F2E2] rounded-full w-fit px-2">
        <span className="flex-grow text-center group-hover:text-stone-800 group-hover:font-bold transition-all">New category</span>
        <Plus className='w-3 text-[#63615A] ml-1 group-hover:text-stone-800 transition-all' strokeWidth={3}/>
      </span>
    </div>
  );
};

export default Sidebar;