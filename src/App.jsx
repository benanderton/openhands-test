import { useState, useEffect } from 'react'

function App() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // In a real app, we would call a backend API here because of CORS.
    // Since this is a client-side only demo request, we might run into CORS issues
    // if we try to fetch directly from BBC.
    // However, the prompt asks to "scrape". Client-side scraping is limited.
    // I will try to use a CORS proxy or simulate the scraping if direct access fails.
    // For now, let's try to fetch via a proxy or just display a message if it fails.
    
    // Using a public CORS proxy for demonstration purposes
    const fetchStories = async () => {
      try {
        // We'll use a simple approach: fetch the HTML and parse it.
        // Note: This is fragile and depends on BBC's structure.
        // Using allorigins.win to bypass CORS
        const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.bbc.com/news'))
        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()
        
        const parser = new DOMParser()
        const doc = parser.parseFromString(data.contents, 'text/html')
        
        // Select stories. BBC structure changes, but let's try to find common article selectors
        // This selector targets the main promo stories usually found on the news front page
        // We look for card wrappers
        const cardSelectors = [
          '[data-testid="card-text-wrapper"]', 
          '[data-testid="card-main-wrapper"]',
          '.gs-c-promo-body' // Legacy selector just in case
        ];
        
        let articles = [];
        for (const selector of cardSelectors) {
          const found = doc.querySelectorAll(selector);
          if (found.length > 0) {
            articles = Array.from(found);
            break;
          }
        }

        const parsedArticles = articles
          .slice(0, 10)
          .map(article => {
            const headline = article.querySelector('h2, h3, .gs-c-promo-heading__title')?.innerText
            const description = article.querySelector('p, .gs-c-promo-summary')?.innerText
            // Find the closest anchor tag for the link
            const linkElement = article.closest('div')?.querySelector('a') || article.querySelector('a');
            let link = linkElement?.getAttribute('href')
            
            if (link && !link.startsWith('http')) {
              link = `https://www.bbc.com${link}`
            }

            return { headline, description, link }
          })
          .filter(story => story.headline && story.headline.trim().length > 0) // Filter out empty ones

        setStories(parsedArticles)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch stories. CORS or parsing issue.')
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  return (
    <div className="container">
      <h1>BBC News Top 10</h1>
      {loading && <p>Loading stories...</p>}
      {error && <p className="error">{error}</p>}
      <div className="stories">
        {stories.map((story, index) => (
          <div key={index} className="story-card">
            <h2><a href={story.link} target="_blank" rel="noopener noreferrer">{story.headline}</a></h2>
            <p>{story.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
