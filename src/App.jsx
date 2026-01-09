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
      setLoading(true)
      setError(null)
      try {
        // Fetching RSS feed via allorigins.win to bypass CORS
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('http://feeds.bbci.co.uk/news/rss.xml'), {
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (!response.ok) throw new Error('Network response was not ok')
        const data = await response.json()
        
        const parser = new DOMParser()
        const doc = parser.parseFromString(data.contents, 'text/xml')
        
        const items = Array.from(doc.querySelectorAll('item'))

        const parsedArticles = items
          .slice(0, 10)
          .map(item => {
            const headline = item.querySelector('title')?.textContent
            const description = item.querySelector('description')?.textContent
            const link = item.querySelector('link')?.textContent
            
            return { headline, description, link }
          })
          .filter(story => story.headline && story.headline.trim().length > 0)

        setStories(parsedArticles)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch stories: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="container">
      <h1>BBC News Top 10</h1>
      <button onClick={handleReload} style={{marginBottom: '1rem'}}>Reload App</button>
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
