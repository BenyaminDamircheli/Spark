import { AnimatePresence, motion } from "framer-motion"
import { BookAIcon } from "lucide-react";
import { AIIcon } from "../../../../icons";

const Intro = () => {
    return (
        <AnimatePresence>
            <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{
              delay: 0.3,
              type: 'spring',
              stiffness: 50,
              duration: 1,
              scale: { duration: 0.5 },
            }}
            className="flex flex-col justify-center items-center h-[calc(100vh-200px)] w-[500px] mx-auto mt-10 text-center"
            >
                <div className="h-[55px] w-[60px] my-[22px] mx-auto">
                    <AIIcon className="w-full h-full" />
                </div>
                <div className="h-[1px] w-[120px] my-5 mx-auto border-t-2 border-dotted border-[var(--border)]"></div>
                <div className="font-['Porpora'] text-[2.4em] mx-auto max-w-[300px] leading-[1.1] text-[var(--primary)] shadow-[0_0_50px_var(--base),20px_-230px_100px_var(--base-hover)]">
                    Speak with your journal
                </div>
                <div className="text-[1.2em] leading-[1.4] mx-auto max-w-[240px]">
                    The AI will use your relevant journal entries as context to the conversation.
                </div>
            </motion.div>
        </AnimatePresence>
    )
};

export default Intro;