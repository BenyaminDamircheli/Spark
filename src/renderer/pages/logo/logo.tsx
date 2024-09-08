import {motion} from 'framer-motion'
import RingsLogo from './logoBalls'


export default function Logo(){
    return (
        <div className='w-[80px] h-[80px] bg-[#172d45] rounded-[22px] relative overflow-hidden'>
            <div className='absolute inset-0 flex items-center justify-center'>
                <svg viewBox="0 0 80 80" className="w-full h-full">
                    <circle cx="40" cy="40" r="35" fill="#e2e8f0" />
                    <path
                        d="M30 30 C35 20, 45 20, 50 30 S65 35, 60 40 S55 55, 50 50 S35 55, 30 50 S15 45, 20 40 S25 35, 30 30"
                        fill="none"
                        stroke="#172d45"
                        strokeWidth="4"
                    />
                    <path
                        d="M25 35 C30 25, 40 25, 45 35 S60 40, 55 45 S50 60, 45 55 S30 60, 25 55 S10 50, 15 45 S20 40, 25 35"
                        fill="none"
                        stroke="#172d45"
                        strokeWidth="4"
                    />
                    <path
                        d="M35 25 C40 15, 50 15, 55 25 S70 30, 65 35 S60 50, 55 45 S40 50, 35 45 S20 40, 25 35 S30 30, 35 25"
                        fill="none"
                        stroke="#172d45"
                        strokeWidth="4"
                    />
                </svg>
            </div>
        </div>

    )
}
