import Editor from "../Editor";


const NewPost = () => {
    return (
        <div className="block bg-[#F9F2E2] ml-[1px] text-sm px-2 text-black z-[999999]">
            <div className="block w-full">
                <Editor editable={true}  />
            </div>
        </div>
    )
}

export default NewPost;