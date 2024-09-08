const fs = require('fs')
const path = require('path');
const { memo } = require('react');

class MemoBookmarks{
    constructor(){
        this.fileName = 'bookmarks.json'
        this.memoPath = null
        this.bookmarks = new Map();
    }

    resetIndex(){
        this.bookmarks.clear();
    }

    load(memoPath){
        if (!memoPath) return;

        if (memoPath === this.memoPath) return;

        if (memoPath !== this.memoPath){
            this.resetIndex();
        }

        this.memoPath = memoPath;
        const bookmarkMemoPath = path.join(this.memoPath, this.fileName);

        if (fs.existsSync(bookmarkMemoPath)){
            const data = fs.readFileSync(bookmarkMemoPath, 'utf8');
            const loadedIndex = new Map(JSON.parse(data));
            this.bookmarks = loadedIndex;

            return loadedIndex
        }
        else{
            this.save();
            return this.bookmarks;
        }

    }

    get(memoPath, url){
        if (memoPath !== this.memoPath){
            this.load(memoPath);
        }
        return this.bookmarks.get(url) || null;
    }

    getAllBookmarks(){
        return Array.from(this.bookmarks.entries()); // returns an array of [url, data] pairs for the bookmarks.
    }

    set(memoPath, url, data){
        if (memoPath !== this.memoPath){
            this.load(memoPath);
        }

        this.bookmarks.set(url, data);
        this.save();

        return this.bookmarks
    }

    save(){
        if (!this.memoPath) return;
        if (!fs.existsSync(this.memoPath)){
            fs.mkdirSync(this.memoPath, {recursive: true})
        }

        const bookmarkMemoPath = path.join(this.memoPath, this.fileName) 
        const entries = this.bookmarks.entries()

        if (!entries) return;

        let mapAsString = JSON.stringify(Array.from(entries));
        fs.writeFileSync(bookmarkMemoPath, mapAsString);
    }
}

module.exports = new MemoBookmarks();
