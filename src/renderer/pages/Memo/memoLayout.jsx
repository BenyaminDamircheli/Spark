import {useParams, Link} from 'react-router-dom';
import {useEffect, useState, useMemo} from 'react';
// import memoIndex from '../../../main/utils/memoIndex';
import {DateTime} from 'luxon';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Memo.module.scss';
import { Search, Home, Settings, Brain, BrainCircuit} from 'lucide-react';
import SideBar from './SideBar';
import BookmarkPreviews from './BookmarkPage';






export default function memoLayout({ children }){
    const {memoName} = useParams();
    // const { index, refreshIndex } = useIndexContext();

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
                                <span>1 entries</span>
                            </div>
                        </div>
                    </div>
                    <SideBar />
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
                                <span className='font-semibold text text-[#8B9E6B]'>/ Feed</span>
                            </motion.span>

                        </div>
                        <div className={`${styles.right} gap-[10px] `}>
                            {/* <Toasts> TODO, COME BACK LATER */}
                            <BrainCircuit strokeWidth={3} className='w-5' />
                            <Search strokeWidth={4} className='w-5' />
                            <Settings strokeWidth={3} className='w-5' />
                            <Link to='/' className=''>
                                <Home strokeWidth={3} className='w-5' />
                            </Link>
                        </div>
                    </div>
                    {children}

                   
                </div>
            </div>
        </div>  
    )
}