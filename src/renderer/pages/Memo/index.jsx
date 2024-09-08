import { Routes, Route } from 'react-router-dom';
import MemoLayout from "./memoLayout";
//import Feed from "./Feed";
//import Bookmarks from "./Bookmarks";
import NewPost from "./NewPost";
import styles from './Test.module.scss';
import Editor from "./Editor";
import { Tweet } from "react-tweet";
import Posts from './Posts';

export default function Memo(){
    return(
        <MemoLayout>
           <Posts />
        </MemoLayout>
    )
}