import { useState, useEffect } from 'react';
import { useMemoContext } from '../../context/MemoContext';
import styles from './Home.module.scss';
import { Link } from 'react-router-dom';
import Logo from '../logo/logo';
import OpenMemo from './OpenMemo';
import DeleteMemo from './DeleteMemo';
import { Sparkle } from 'lucide-react';


const quotes = [
    "Scribe your soul",
    "Writing reimagined",
    "Everything you love, in one place",
    'Reflections reimagined',
    'Synthezise sincerely',
    'New ideas await',
    'The quintessence of quiet contemplation',
    'Blabber in bursts'
]

export default function Home() {
    const { memos } = useMemoContext();
    const [quote, setQuote] = useState('');

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    const renderMemos = () => {
        if (memos.length === 0) {
            return (
                <div className='bg-[#E5D9B6] font-bold my-3 text-[#5F4B32] text-[12px] p-3 rounded-lg max-w-[200px] text-center mx-auto leading-[1.35]'>
                    <p>No existing memos.</p>
                    <p>Start by creating a new one.</p>
                </div>
            )
        }
        return memos.map((memo: any) => {
            return (
                <div key={memo.path} className='mb-3 w-full sm:w-[300px]'>
                    <div className={`${styles.memo} bg-[#F9F2E2] rounded-lg px-4 flex flex-wrap justify-between items-center shadow-md hover:shadow-lg transition-all duration-300 border border-[#8B9E6B]`}>
                        <div className='flex items-center gap-3 mb-2 sm:mb-0'>
                            <h1 className='text-[#3F4E4F] text-sm font-medium flex-grow'>{memo.name}</h1>
                        </div>
                        <div className='flex items-center space-x-2 ml-auto'>
                            <DeleteMemo memo={memo} />
                            <OpenMemo memo={memo} />
                            <Link
                                to={`/memo/${memo.name}`}
                                className='text-xs bg-[#4A6D4A] hover:bg-[#4A6D4A] text-[#F9F2E2] font-medium py-1 px-3 rounded-md transition-colors duration-200'
                            >
                                Open
                            </Link>
                        </div>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className={`${styles.frame} min-h-screen`}>
            <div className="text-3xl text-center flex flex-col items-center justify-center min-h-screen p-4">
                <div className={`${styles.wrapper} flex flex-col items-center w-full max-w-[700px]`}>
                    <div className='flex flex-col items-center justify-center mb-[16px]'>
                        <div className="text-center flex items-center gap-2 justify-center font-bold text-[#3F4E4F]">
                            <h1>Spark.</h1>
                            <Sparkle className='w-6 h-6 text-[#3F4E4F]' />
                        </div>
                    </div>

                    <div className="flex justify-center w-full">
                        <Link to='/new-memo' className={`block text-center text-[#3F4E4F] text-[0.8rem] font-medium rounded-[90px] mt-[16px] select-none transition-all duration-120 ease-in-out ${styles.newMemo}`}>
                            Create a new collection →
                        </Link>
                    </div>

                    <p className='text-[#5F4B32] text-[0.8rem] mt-[16px]'>Or visit an existing one</p>
                    <div className='flex flex-col items-center w-full sm:flex-row sm:flex-wrap sm:justify-center gap-4 rounded-lg text-[0.8rem]'>
                        {renderMemos()}
                    </div>

                    <div className={`${styles.footer} mt-16 w-full`}>
                        <div className='flex flex-col items-center justify-center mb-6'>
                            <p className='text-[#5F4B32] text-xs opacity-60 max-w-md text-center leading-relaxed'>{quote}</p>
                        </div>
                        <div className='border-t border-[#A4BE7B] opacity-40 w-16 mx-auto mb-4'></div>
                        <div>
                            <p className='text-[#5F4B32] text-xs font-semibold'>Yarn v0.0.1</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
