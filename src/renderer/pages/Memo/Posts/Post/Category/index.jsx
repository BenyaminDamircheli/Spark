import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import styles from './Category.module.scss';
import { useCategoryContext } from '../../../../../context/CategoryContext';
import { useMemoContext } from '../../../../../context/MemoContext';

const Category = ({
  isAI,
  categoryColor,
  postPath,
  currentCategory,
  onCategoryColorChange,
}) => {
  const { categories, updatePostCategory } = useCategoryContext();
  const { getCurrentMemoPath } = useMemoContext();

  const handleCategoryChange = async (categoryName) => {
    const fullPostPath = getCurrentMemoPath(postPath);
    await updatePostCategory(fullPostPath, categoryName);
  };

  const renderCategories = () => {
    return Array.from(categories, ([category, data]) => (
      <DropdownMenu.Item
        key={`category-${category}`}
        className={styles.DropdownMenuItem}
        onSelect={() => handleCategoryChange(category)}
      >
        <div
          className={styles.menuBall}
          style={{ background: data.color }}
        ></div>
        {category}
      </DropdownMenu.Item>
    ));
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
            onSelect={() => handleCategoryChange(null)}
          >
            <div
              className={styles.menuBall}
              style={{ background: '#6B6155' }}
            ></div>
            None
          </DropdownMenu.Item>
          {renderCategories()}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default Category;