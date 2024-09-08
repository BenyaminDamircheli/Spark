import {useState, useEffect} from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import styles from "./Category.module.scss";
import { useCategoryContext } from "../../../../../context/CategoryContext";

const Category = ({
    isAI,
    categoryColor,
    setCategory = () => {},
}) => {
    const { categories, openCategories, onOpenChange } = useCategoryContext();

    const renderCategories = () => {
        return Array.from(categories, ([category, data], index) => {
            return (
                <DropdownMenu.Item
                    key={`category-${category}`}
                    className={styles.DropdownMenuItem}
                    onSelect={() => setCategory(category)}
                >
                    <div
                        className={styles.menuBall}
                        style={{ background: data.color }}
                    ></div>
                    {category}
                </DropdownMenu.Item>
            );
        });
    };

    return (
        <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
                <button
                    tabIndex={2}
                    className={`${styles.ball} ${isAI && styles.ai}`}
                    style={{
                        backgroundColor: categoryColor,
                    }}
                    aria-label="Change category"
                ></button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className={styles.DropdownMenuContent}
                    sideOffset={6}
                    side="right"
                    align="start"
                >
                    <DropdownMenu.Item
                        className={styles.DropdownMenuItem}
                        onSelect={() => setCategory(null)}
                    >
                        <div
                            className={styles.menuBall}
                            style={{ background: '#6B6155' }}
                        ></div>
                        None
                    </DropdownMenu.Item>
                    {renderCategories()}
                    <DropdownMenu.Item
                        className={styles.DropdownMenuItem}
                        onSelect={openCategories}
                    >
                        <div
                            className={styles.menuBall}
                            style={{ background: '#6B6155' }}
                        >
                            +
                        </div>
                        Create new category
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default Category;