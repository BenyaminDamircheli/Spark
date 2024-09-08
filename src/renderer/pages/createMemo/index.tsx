import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useMemoContext } from '../../context/MemoContext'
import { Link } from 'react-router-dom'
import styles from './createMemo.module.scss'
import Logo from '../logo/logo'
import { Sparkle } from 'lucide-react';

export default function CreateMemo() {
    const navigate = useNavigate()
    const { createMemo } = useMemoContext()
    const [memoName, setMemoName] = useState('')
    const [pathName, setPathname] = useState('')

    useEffect(() => {
        window.electron.ipc.on('selected-directory', (path: string) => {
            setPathname(path)
        });

        return () => {
            window.electron.ipc.removeAllListeners('selected-directory')
        }
    }, [])

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMemoName(e.target.value)
    }

    const handleClick = () => {
        window.electron.ipc.sendMessage('open-file-dialog')
    }

    const handleSubmit = () => {
        if (!memoName || !pathName) return;

        console.log('Creating memo:', memoName, pathName);
        createMemo(memoName, pathName);
        console.log('Memo created, navigating to:', '/memo/' + memoName);
        navigate('/memo/' + memoName);
    }

    return (
        <div className={`${styles.frame} min-h-screen`}>
            <div className="text-3xl text-center flex flex-col items-center justify-center min-h-screen p-4">
                <div className={`${styles.wrapper} flex flex-col items-center w-full max-w-[700px]`}>
                    <div className='flex flex-col items-center justify-center mb-[16px]'>
                        <div className="text-center flex items-center gap-2 justify-center font-bold text-[#3F4E4F]">
                            <h1>Spark.</h1>
                            <Sparkle className='w-6 h-6 text-[#3F4E4F]' />
                        </div>
                        <div className="text-center font-bold text-[#3F4E4F] mt-4">
                            <h1 className='text-xl'>Create a new collection</h1>
                        </div>
                    </div>

                    <div className={`${styles.form} text-[#3F4E4F] w-[400px]`}>
                        <div className="my-4 w-full text-start">
                            <label htmlFor="memoName" className="text-[#3F4E4F] text-start text-xs mb-2">
                                <div className='flex flex-col gap-2'>
                                    <span className='font-medium'>Collection Name</span>
                                    <p className='text-[#5F4B32] text-xs'>Pick a name for your collection.</p>
                                </div>
                            </label>
                            <input
                                type="text"
                                id="memoName"
                                value={memoName}
                                onChange={handleNameChange}
                                className="w-full py-2 text-sm px-3 placeholder:text-[#5F4B32] placeholder:text-xs text-[#3F4E4F] rounded-lg bg-[#F9F2E2] border border-[#8B9E6B] focus-visible:outline-none focus:bg-[#E5D9B6] focus:ring-2 transition-all duration-200"
                                placeholder="eg. personal, school, work"
                            />
                        </div>
                        <div className="my-6 w-full text-start">
                            <div className='flex flex-col items-start gap-2'>
                                <span className='text-[#3F4E4F] text-xs font-medium'>Choose Location</span>
                                <span className='text-[#5F4B32] text-xs'>Select a location to store your collection.</span>
                            </div>
                            <button
                                onClick={handleClick}
                                className="bg-[#F9F2E2] border border-[#8B9E6B] hover:bg-[#E5D9B6] rounded-lg px-3 py-2 text-[#3F4E4F] text-xs font-medium w-full"
                            >
                                Choose Location
                                
                            </button>
                            {pathName && (
                                <p className="mt-2 text-xs text-[#5F4B32] truncate">
                                    Selected: {pathName}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <Link
                                to="/"
                                className="text-[#3F4E4F] hover:underline text-[0.8rem] font-medium py-2 px-0"
                            >
                                ← Back to Home
                            </Link>
                            <button
                                onClick={handleSubmit}
                                className={`text-[#4A6D4A] hover:text-[#3F4E4F] text-[0.8rem] font-medium py-2 px-0 flex items-center ${(!memoName || !pathName) ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}
                                disabled={!memoName || !pathName}
                            >
                                Create Collection 
                            </button>
                        </div>
                    </div>

                    <div className={`${styles.footer} mt-16 w-full`}>
                        <div className='border-t border-[#A4BE7B] opacity-40 w-16 mx-auto mb-4'></div>
                        <div>
                            <p className='text-[#5F4B32] text-xs font-semibold'>Spark v0.0.1</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}