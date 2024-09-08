import { useState, useEffect } from "react";
import {Folder} from "lucide-react"
import { Link } from "react-router-dom";
import { useMemosContext } from "../../../context/MemoContext";

export default function OpenMemo({ memo }) {
    function handleClick(){
        window.electron.openFolder(memo.path)
    }

    return(
        <button className='flex items-center gap-2 rounded-lg text-gray-200 hover:bg-gray-100/25 p-1' onClick={handleClick}>
            <Folder className="w-4 h-4 text-[#3F4E4F]" />
        </button>
    )
}