

const { getBookmarkPreview, getBookmarkContent } = require('./memoBookmarkPreview');

async function runTests() {
  console.log('Testing getBookmarkPreview:');
  
  const previewUrls = [
    'https://en.wikipedia.org/wiki/Achaemenid_Empire'
  ];

  for (const url of previewUrls) {
    console.log(`\nTesting URL for preview: ${url}`);
    try {
      const preview = await getBookmarkPreview(url);
      console.log('Preview:', preview)
    } catch (error) {
      console.error('Error in getBookmarkPreview:', error.message);
    }
  }

  console.log('\n\nTesting getBookmarkContent:');
  
  const contentUrls = [
    'https://en.wikipedia.org/wiki/Achaemenid_Empire',
  ];

  for (const url of contentUrls) {
    console.log(`\nTesting URL for content: ${url}`);
    try {
      const content = await getBookmarkContent(url);
      console.log('Content:', content);
      //console.assert(content.text, 'Text content should not be empty');
      //console.assert(Array.isArray(content.images), 'Images should be an array');
      //console.assert(Array.isArray(content.links), 'Links should be an array');

    } catch (error) {
      console.error('Error in getBookmarkContent:', error.message);
    }
  }
}

runTests();
