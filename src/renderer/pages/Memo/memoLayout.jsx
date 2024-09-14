import {useParams, Link} from 'react-router-dom';
import {useEffect, useState, useMemo} from 'react';
import { useIndexContext } from '../../context/IndexContext';
import {DateTime} from 'luxon';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Memo.module.scss';
import {Home, Settings, Brain, BrainCircuit} from 'lucide-react';
import SideBar from './SideBar';
import Search from './Search';
import BookmarkPreviews from './BookmarkPage';
import Toasts from './Toasts';
import Chat from './Chat';







export default function memoLayout({ children }){
    const {memoName} = useParams();
     const { index, refreshIndex } = useIndexContext();

    const [now, setNow] = useState(DateTime.now().toFormat('cccc, LLL dd, yyyy'))


    const osStyles = useMemo(
        () => (window.electron.isMac ? styles.mac : styles.win),
        []
    );


    return (
        <div className={`${styles.frame} ${osStyles}`}>
            <div className={styles.bg}></div>
            <div className={`${styles.main} ${osStyles}`}>
                <div className={styles.sidebar}>
                    <div className={styles.top}>
                        <div className={styles.part}>
                            <div className={styles.count}>
                                <span>{index.size} entries</span>
                            </div>
                        </div>
                    </div>
                    {/* <SideBar /> */}
                </div>
                <div className={`${styles.content} ${osStyles}`}>
                    <div className={`${styles.nav}`}>
                        <div className={styles.left}>
                            <motion.span
                                key={now}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {now} <span className='p-1'>·</span> 
                                <span className='font-semibold text-[#8B9E6B]'>{memoName} </span> 
                                <span className='p-1'>·</span> 
                                <span className='font-semibold text bg-[#3F4E4F] text-[#F9F2E2] rounded-md px-2'>{index.size} entries</span>
                            </motion.span>

                        </div>
                        <div className={`${styles.right} gap-1`}>
                            <Toasts />
                            <Chat />
                            <Search />
                            <Link to='/' className='inline-flex items-center justify-center h-[30px] w-[30px] rounded-lg transition-all duration-120 ease-in-out bg-transparent relative overflow-hidden hover:cursor-pointer hover:bg-[#E5D9B6] hover:text-[#3F4E4F] active:bg-[#E7DFC6]'>
                                <Home strokeWidth={3} className='text-[#5F4B32] h-5 w-5 transition-all duration-220 ease-in-out delay-[40ms] ' />
                            </Link>
                        </div>
                    </div>
                    {children}

                   
                </div>
            </div>
        </div>  
    )
}