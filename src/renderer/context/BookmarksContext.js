import {
    useState,
    useEffect,
    useContext,
    createContext,
    useCallback
} from 'react';
import { useLocation } from 'react-router-dom';
import { useMemoContext } from './MemoContext';
import { useAIContext } from './AIContext';

export const BookmarksContext = createContext();

export const BookmarksContextProvider = ({ children }) => {
    const { currentMemo, getCurrentMemoPath } = useMemoContext();
    const { AI } = useAIContext();
    

    const getBookmarks = useCallback(async (url) => {
        const memoPath = getCurrentMemoPath();
        console.log('Fetching bookmark for URL:', url);
        const preview = await window.electron.ipc.invoke("bookmarks-get", memoPath, url);
        
        console.log('Cached preview:', preview);

        //if preview exists already in bookmarks.json, return that
        if (preview) {
            return preview;
        }

        console.log('No cached preview, generating new one');
        
        try {
            const _preview = await getPreview(url);
            console.log('Generated preview:', _preview);

            // Extract host from URL
            const urlObject = new URL(url);
            const host = urlObject.hostname;

            let aiCard = null;
            try {
                aiCard = await generateSummary(url);
                console.log('Generated AI card:', aiCard);
            } catch (error) {
                console.error('Failed to generate AI preview');
            }

            const bookmarkPreview = {
                url: url,
                createdAt: new Date().toISOString(),
                title: _preview?.title ?? '',
                images: _preview?.images ?? [],
                favicon: _preview?.favicon ?? '',
                host: host, // Set the host here
                description: aiCard?.description ?? '',
                summary: '',
                aiCard: aiCard ?? null,
            }

            console.log('Final bookmark preview:', bookmarkPreview);

            setBookmark(url, bookmarkPreview);

            return bookmarkPreview;
        } catch (error) {
            console.error('Error generating bookmark preview:', error);
            return null;
        }
    }, [currentMemo, getCurrentMemoPath]);


    const getAllBookmarks = async () =>{
        const memoPath = getCurrentMemoPath();
        const bookmarks = await window.electron.ipc.invoke("bookmarks-get-all", memoPath);
        return bookmarks;
    }

    const setBookmark = useCallback((url, data) =>{
        const memoPath = getCurrentMemoPath();
        window.electron.ipc.invoke("bookmarks-set", memoPath, url, data);
        console.log('set bookmark', url, data);
    }, [currentMemo]);

    const getPreview = async (url) =>{
        const data = await window.electron.ipc.invoke('get-bookmark-preview', url);
        console.log('data here', data);
        return data;
    }

    const getContent = async (url) => {
        const data = await window.electron.ipc.invoke('get-bookmark-content', url);
        return data;
    }

    const trimContent = (string, numWords = 2000) =>{
        const wordsArray = string.split(/\s+/);
        if (wordsArray.length <= numWords) return string;

        return wordsArray.slice(0, numWords).join(' ') + '...';
    }

    const generateSummary = async (url) =>{
        const {text, images, links} = await getContent(url);
        const trimmedText = trimContent(text);

        let context = [];

        context.push({
            role: 'system',
            content: `Provided below is some extracted markdown text from a website. Use it to generate the content for a rich preview card about the webpage.
            The content is as follows:
            ${trimmedText}
            `, 
        })

        context.push({
            role: 'system',
            content: `These are the links on the page: ${links}`
        })

        context.push({
            role:'system',
            content:`These are the images on the page: ${images}`
        })

        context.push({
            role: 'system',
            content: `provide your repsonse as a JSON object that follows this schema:
            {
                "url": ${url},
                "category": '', // suggest the best category for this page based on the content. eg: video, book, recipie, app, research paper, article, news, opinion, blog, social media etc.
                "images": [{src: '', alt: ''}], // key images
                "summary": string, // tldr summary of this webpage
                "highlights": [''], // plaintext sentences of 3-5 key insights, facts or quotes. Like an executive summary.
                "buttons": [{title: '', href: ''}], // use the links to generate a primary and secondary buttons appropriate for this preview. IT IS EXTREMELY IMPORTANT THAT YOU USE ONLY THE LINKS PROVIDED TO YOU TO CREATE THE BUTTONS.
            }`
        })

        const reponse = await AI.chat.completions.create({
            messages: context,
            model: 'gpt-3.5-turbo-1106',
            max_tokens: 500,
            messages: context,
            response_format: {type: 'json_object'}
        })

        let option = false;

        try {
            option = JSON.parse(response.choices[0].message.content);
        } catch (e) {
            
        }

        return option;
    }

    const bookmarksContextValue = {
        getBookmarks,
        setBookmark,
        getAllBookmarks,
    }

    return (
        <BookmarksContext.Provider value={bookmarksContextValue}>
            {children}
        </BookmarksContext.Provider>
    )
}

export const useBookmarksContext = () => useContext(BookmarksContext);