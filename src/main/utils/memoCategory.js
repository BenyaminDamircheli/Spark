const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

const presetColors = [
    '#FF703A', '#4de64d', '#017AFF', '#FFA500', '#9370DB', 
    '#20B2AA', '#FF69B4', '#1E90FF', '#32CD32', '#FF6347'
];

const defaultCategories = new Map([
    ['Do Later', {color: '#4169E1', posts: []}],
    ['New Ideas', {color: '#391656', posts: []}],
])

class MemoCategory {
    constructor() {
        this.filename = 'category.json';
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

        this.categories.set(categoryName, newCategory);
        
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

    updatePostCategory(postPath, categoryName) {
        // Ensure the postPath is absolute
        const fullPostPath = path.isAbsolute(postPath) ? postPath : path.join(this.memoPath, postPath);

        // Check if the file exists
        if (!fs.existsSync(fullPostPath)) {
            console.error(`File not found: ${fullPostPath}`);
            return this.categories; // Return current categories without changes
        }

        // Remove the post from its current category
        for (const [name, category] of this.categories) {
            const index = category.posts.indexOf(postPath);
            if (index > -1) {
                category.posts.splice(index, 1);
            }
        }

        // Add the post to the new category
        if (categoryName) {
            if (!this.categories.has(categoryName)) {
                this.createCategory(categoryName);
            }
            const category = this.categories.get(categoryName);
            category.posts.push(postPath);
        }

        // Update the post's frontmatter
        const fileContent = fs.readFileSync(fullPostPath, 'utf-8');
        const { data, content } = matter(fileContent);
        data.category = categoryName || null;
        const updatedContent = matter.stringify(content, data);
        fs.writeFileSync(fullPostPath, updatedContent);

        this.save();
        return this.categories;
    }

    save() {
        const categoriesFilePath = path.join(this.memoPath, this.filename);
        const data = JSON.stringify(Array.from(this.categories.entries()));
        fs.writeFileSync(categoriesFilePath, data, 'utf-8');
    }

}

module.exports = new MemoCategory();


