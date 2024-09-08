const axiosBase = require('axios');
const cheerio = require('cheerio');
// Do twitter on the frontend in the Bookmark context.

const axios = axiosBase.create({
    timeout: 10000,
    maxContentLength: 5 * 1024 * 1024, // 5MB response size
    maxBodyLength: 10 * 1024 * 1024, // 10MB request size
})

// set headers directly on the instance
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 Axiom/0.1.0';
axios.defaults.headers.post['Content-Type'] = 'application/json';


export const getBookmarkPreview = async (url) => {
    try {
        const response = await axios.get(
            url, {
                headers: {
                    Accept: "text/html",
                },
            }
        ).then((response) => {
            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('text/html')) {
                return response
            }

            throw new Error('Failed to get HTML content');
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const parsedURL = new URL(url);

        let metaData = {
            title: "",
            images: [],
            url: parsedURL.host,
            favicon: ''
        }
        
        // Extract the title of the page
        const title = $('title').first().text();
        metaData.title = title;

        // Extract open graph images
        $('meta').each((i, el) => {
            const property = $(el).attr('property');
            const content = $(el).attr('content');
            if (property === 'og:image') {
                metaData.images.push(content);
            }
            
        })

        // Extract favicon
        $('link').each((i, el) => {
            const rel = $(el).attr('rel')?.toLowerCase();
            const href = $(el).attr('href');
            if (rel && (rel.includes('icon') || rel.includes('shortcut icon')) && href) {
                metaData.favicon = new URL(href, parsedURL.origin).href;
                return false; // break out of the each loop to prevent searching other links (jQuery + Cheerio thing)
            }
        });

    
        return metaData;
    } catch (error) {
        console.error('Error in getBookmarkPreview:', error);
        return null;
    }
}

export const getBookmarkContent = async (url) =>{

  try {
    // Use jina AI to get markdown of full page. Markdown better for LLMs than HTML.
    const markdownContent = await axios.get(`https://r.jina.ai/${url}`, {
      headers: {
        'Accept': 'text/markdown'
      }
    });

    // Use cheerio to get the main content of the page.
    const response = await axios.get(url);
    const $ = cheerio.load(response.data)

    // stuff we skip over
    $('script, style, iframe, noscript, nav, header, footer, .nav, .menu, .footer').remove()

    let contentSections = [];

    // stuff we focus on
    const sectionSelectors = 'div, section, article, main, [role="main"]';

    $(sectionSelectors).each(function () {
        sectionText = $(this).text().trim()
        const textLength = sectionText.replace(/\s+/g, ' ').length;
        // Any section of html with more than 200 words may have useful images and/or links.
        // Add it to the content sections.
        if (textLength > 200){
            contentSections.push({
                html: $(this).html(),
                textLength: textLength
            });
        }
    })

    // Sort the content sections by text length. Longest to shortest.
    contentSections.sort((a, b) => b.textLength - a.textLength);

    // Get the first 3 content sections, should be enough for images and links.
    // even on sparse pages with little links/images
    let mainContentHTML = contentSections
    .slice(0, 3)
    .map(section => section.html)
    .join(' ');

    const mainContent = cheerio.load(mainContentHTML);

    // get images and their src.
    const images = mainContent('img').map((i, el) => mainContent(el).attr('src')).get()

    // get links, their href, and text.
    const links = mainContent('a').map((i, el) => ({
        href: mainContent(el).attr('href'),
        text: mainContent(el).text().trim()
    })).get()

    return {
        text: markdownContent.data,
        images: images,
        links: links
    }
  } catch (error) {
    console.error('Error fetching bookmark content:', error);
    return null;
  }
}