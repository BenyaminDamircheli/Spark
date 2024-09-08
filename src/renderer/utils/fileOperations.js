const postFormat = {
    title: '',
    content: null,
    createdAt: null,
    updatedAt: null,
    tags: [],
    replies:[],
    attatchments:[],
    referencedPosts:[],
    area: null,
    parentPostPath: null,
    isAI: false,
    isReply: false,
    highlightColor: null,
    category: null,
}

// get file directory from filepath. Both relative and absolute file paths.
const getDirectoryPath = (filePath) => {
    const isAbsolute = filePath.startsWith('/');
    const pathArr = filePath.split(/[/\\]/);
    pathArr.pop();  // remove file extention (ex: .txt) to get directory path
    let directoryPath = window.electron.joinPath(...pathArr);
    // I think this may be redundant, but it's fine for now while testing.
    if (isAbsolute && !directoryPath.startsWith('/')) {
        directoryPath = `/${directoryPath}`;
    }
    return directoryPath;
}

// File Names are in the format of YYMMDD-HHMMSS.md
const getTimeStamp= () => {
    const currentDate = new Date();

    const year = String(currentDate.getFullYear()).slice(-2);
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const fileName = `${year}${month}${day}-${hours}${minutes}${seconds}.md`;

    return fileName;
}

// Post paths are in the format of /YYYY/MM/YYYYMMDD-HHMMSS.md
const getNewPostPath = (basePath, timeStamp = new Date()) => {
    const date = new Date();
    const month = date.toLocaleDateString('default', {month: "short"});
    const year = date.getFullYear().toString();
    const fileName = getTimeStamp();
    const filePath = window.electron.joinPath(basePath, year, month, fileName);

    return filePath;
}

const createDirectory = (path) => {
    return window.electron.mkdir(path)
}


const getFiles = async (directoryPath) =>{
    const files = await window.electron.getFiles(directoryPath);

    return files;
}


const saveFiles = async (directoryPath, files) => {
    return new Promise((resolve, reject) => {
        window.electron.writeFile(directoryPath, files, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

const deleteFile = async (filePath) => {
    return new Promise ((resolve, reject) => {
        window.electron.deleteFile(filePath, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}


const generateMarkdown = (content, data) =>{
    return window.electron.ipc.invoke('matter-stringify', {content, data});
}


export {
    postFormat, 
    getDirectoryPath,
    getTimeStamp,
    getNewPostPath,
    createDirectory,
    getFiles,
    saveFiles,
    deleteFile,
    generateMarkdown,
}

