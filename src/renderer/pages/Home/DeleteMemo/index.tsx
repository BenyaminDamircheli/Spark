import { useMemoContext } from "../../../context/MemoContext";
import { Trash } from "lucide-react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import styles from './DeleteMemo.module.scss';

export default function DeleteMemo({memo}:{memo:any}) {
    const { deleteMemo } = useMemoContext();

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
                <button className="text-[#4A6D4A] hover:bg-[#F9F2E2]/25 rounded-lg p-1">
                    <Trash className="w-4 h-4"/>
                </button>
            </AlertDialog.Trigger>
            <AnimatePresence>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay className={`fixed inset-0 bg-[#3F4E4F]/50 ${styles.dialogOverlay}`} />
                    <AlertDialog.Content
                        className={`${styles.dialogContent} fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#F9F2E2] rounded-lg p-6 w-[400px]`}
                    >
                        <AlertDialog.Title className="text-2xl font-bold text-[#3F4E4F] mb-4">
                            Remove this collection?
                        </AlertDialog.Title>
                        <AlertDialog.Description className="text-[#5F4B32] mb-6 text-sm">
                            This action removes the <b className="text-[#4A6D4A]">{memo.name}</b> collection from the list, but
                            it won't actually delete the collection's files stored at{' '}
                            <b className="text-[#4A6D4A]">{memo.path}</b> from your computer.
                            <br />
                            <br />
                            You can delete or backup your collection folder, or import it back into
                            Spark in the future.
                        </AlertDialog.Description>
                        <div className="flex justify-end gap-4">
                            <AlertDialog.Cancel asChild>
                                <button className="px-4 py-2 text-[#3F4E4F] hover:underline text-sm rounded-lg">Cancel</button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action asChild>
                                <button
                                    className="p-2 text-sm bg-[#4A6D4A] text-[#F9F2E2] hover:bg-[#4A6D4A]/80 rounded-lg"
                                    onClick={() => {
                                        deleteMemo(memo.name);
                                    }}
                                >
                                    Yes, remove collection
                                </button>
                            </AlertDialog.Action>
                        </div>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AnimatePresence>
        </AlertDialog.Root>
    )
}
