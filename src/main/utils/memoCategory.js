const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

const presetColors = [
    '#FF703A', '#4de64d', '#017AFF', '#FFA500', '#9370DB', 
    '#20B2AA', '#FF69B4', '#1E90FF', '#32CD32', '#FF6347'
];

const defaultCategories = new Map([
    ['Do Later', {color: '#4de64d', posts: []}],
    ['New Ideas', {color: '#017AFF', posts: []}],
])

class MemoCategory {
    constructor() {
        this.filename = 'categories.json';
        this.memoPath = null;
        this.categories = new Map();
    }

    sortMap(map) {
        let sorted = new Map(
            [...map.entries()].sort((a, b) => a[1].posts.length - b[1].posts.length)
        );
        return sorted;
    }

    load(memoPath) {
        if (!memoPath) return;
        this.memoPath = memoPath;
        const categoriesFilePath = path.join(this.memoPath, this.filename);
        
        if (fs.existsSync(categoriesFilePath)) {
            const data = fs.readFileSync(categoriesFilePath, 'utf-8');
            const loadedCategories = new Map(JSON.parse(data));
            const sortedCategories = this.sortMap(loadedCategories);

            this.categories = sortedCategories;
            return this.categories;
        } else {
            this.categories = defaultCategories;
            this.save();
            return this.categories;
        }
    }

    getCategories() {
        return this.categories;
    }

    sync(filePath) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const {data, content} = matter(fileContent);

        const tags = data.tags || [];
        if (!tags) return;

        tags.forEach(tag => {
            this.add(tag, filePath);
        })
    }

    createCategory(categoryName) {
        if(this.categories.has(categoryName)) return;

        const randomColor = presetColors[Math.floor(Math.random() * presetColors.length)];
        const newCategory = {
            color: randomColor,
            posts: []
        }

        this.categories.set(categoryName, [categoryName, newCategory]);
        this.save();
        return this.categories;
    }


    assignCategory(filePath, categoryName) {
        if (!this.categories.has(categoryName)) {
            this.createCategory(categoryName);
        }

        let category = this.categories.get(categoryName);
        if (!category.posts.includes(filePath)) {
            category.posts.push(filePath);
            this.categories.set(categoryName, category);
            this.save();
        }
    }

    syncPostCategory(filePath) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const {data, content} = matter(fileContent);
        const category = data.category;

        if (category) {
            this.assignCategory(filePath, category);
        }
    }

    deleteCategory(categoryName) {
        if (this.categories.has(categoryName)) {
            const categoryToDelete = this.categories.get(categoryName);
            
            // Remove the category from all posts
            categoryToDelete.posts.forEach(filePath => {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const { data, content } = matter(fileContent);
                
                if (data.category === categoryName) {
                    delete data.category;
                    const updatedContent = matter.stringify(content, data);
                    fs.writeFileSync(filePath, updatedContent);
                }
            });

            // Remove the category from the categories Map
            this.categories.delete(categoryName);

            this.save();
        }
    }
    
}

module.exports = new MemoCategory();


