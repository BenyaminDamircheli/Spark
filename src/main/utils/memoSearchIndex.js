const fs = require('fs');
const path = require('path');
const lunr = require('lunr');
const matter = require('gray-matter');
const { BrowserWindow } = require('electron');
const { convertHTMLToPlainText } = require('../util');

class memoSearchIndex {
  constructor() {
    this.memoPath = null;
    this.indexFileName = 'search_index.json';
    this.index = null;
  }

   initializeIndex(memoPath, index) {
    this.memoPath = memoPath;
    this.index = this.loadIndex(memoPath, index);
    return this.index;
  }

  loadIndex(memoPath, index) {
    try {
      this.index = lunr((builder) => {
        builder.ref('id');
        builder.field('title');
        builder.field('content');
        builder.field('tags');
        builder.field('category');
        builder.field('attatchments');
        builder.field('bookmarks');
        builder.field('createdAt');
        builder.field('updatedAt');
        builder.field('isReply');
        builder.field('isAI');

        for (let [filePath, metadata] of index) {
          try {
            if (metadata.isReply) {
              continue;
            }

            let fullPath = path.join(this.memoPath, filePath);
            let fileContent = fs.readFileSync(fullPath, 'utf-8');
            let { content } = matter(fileContent);

            //concatenate the contents of the replies.
            for (let replyPath of metadata.replies) {
              let replyFullPath = path.join(memoPath, replyPath);
              let replyFileContent = fs.readFileSync(replyFullPath, 'utf8');
              let { content: replyContent } = matter(replyFileContent);
              content += '\n' + replyContent;
            }

            let doc = {
              id: filePath,
              title: metadata.title,
              content: convertHTMLToPlainText(content),
              tags: metadata.tags,
              category: metadata.category,
              bookmarks: metadata.bookmarks,
              createdAt: metadata.createdAt,
              updatedAt: metadata.updatedAt,
              isReply: metadata.isReply,
              isAI: metadata.isAI,
            };

            builder.add(doc);
          } catch (error) {
            console.error('Error indexing memo:', filePath, error);
          }
        }
      });
      return this.index;
    } catch (error) {
      console.error('Error loading index:', error);
    }
  }

  // write index to the file
  async saveIndex() {
    const indexPath = path.join(this.memoPath, this.indexFileName);
    fs.writeFileSync(indexPath, JSON.stringify(this.index));
  }

  // use lunr for search
  search(searchQuery) {
    return this.index.search(searchQuery);
  }
}

module.exports = new memoSearchIndex();
