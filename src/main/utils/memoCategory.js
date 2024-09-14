const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

const defaultCategories = new Map([
  ['Thoughts', { color: '#FF703A', posts: [] }],
  ['Do later', { color: '#4de64d', posts: [] }],
  ['New idea', { color: '#017AFF', posts: [] }],
  [`Learning`, { color: '#FF69B4', posts: [] }],

]);

class MemoCategory {
  constructor() {
    this.filename = 'category.json';
    this.memoPath = null;
    this.categories = new Map();
  }

  sortMap(map) {
    let sortedMap = new Map(
      [...map.entries()].sort((a, b) => a[1].posts.length - b[1].posts.length)
    );

    return sortedMap;
  }

  load(memoPath) {
    if (!memoPath) return;
    this.memoPath = memoPath;
    const categoriesFilePath = path.join(this.memoPath, this.filename);

    if (fs.existsSync(categoriesFilePath)) {
      const data = fs.readFileSync(categoriesFilePath);
      const loadedCategories = new Map(JSON.parse(data));
      this.categories = this.sortMap(loadedCategories);
      return this.categories;
    } else {
      // save to initialize an empty index
      this.categories = this.sortMap(defaultCategories);
      this.save();
      return this.categories;
    }
  }

  getCategories() {
    return this.categories;
  }

  sync(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    const category = data.category;

    if (category) {
      this.assignCategory(filePath, category);
    }
  }

  createCategory(categoryName) {
    if (this.categories.has(categoryName)) {
      return;
    }

    // create a new category
    const newCategory = { color: null, posts: [] };
    this.categories.set(categoryName, newCategory);

    this.save();

    return this.categories;
  }

  deleteCategory(categoryName) {
    if (this.categories.has(categoryName)) {
      let updatedCategory = this.categories.get(categoryName);
      
      // Remove the category from all posts
      updatedCategory.posts.forEach(filePath => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);
        
        if (data.category === categoryName) {
          delete data.category;
          const updatedContent = matter.stringify(content, data);
          fs.writeFileSync(filePath, updatedContent);
        }
      });

      this.categories.delete(categoryName);

      this.save();
    }

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
    if (!this.memoPath) return;
    if (!fs.existsSync(this.memoPath)) {
      fs.mkdirSync(this.memoPath, { recursive: true });
    }

    const categoriesFilePath = path.join(this.memoPath, this.filename);
    const sortedCategories = this.sortMap(this.categories);

    this.categories = sortedCategories;
    const entries = Array.from(this.categories.entries());

    if (!entries) return;

    let strMap = JSON.stringify(entries);

    fs.writeFileSync(categoriesFilePath, strMap);
  }
}

module.exports = new MemoCategory();
