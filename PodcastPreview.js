/**
 * PodcastPreview Web Component
 * A reusable custom element for displaying podcast preview cards
 * 
 * @class PodcastPreview
 * @extends HTMLElement
 */
class PodcastPreview extends HTMLElement {
  /**
   * Define which attributes to observe for changes
   * @static
   * @returns {string[]} Array of attribute names to observe
   */
  static get observedAttributes() {
    return ['podcast-id', 'title', 'image', 'genres', 'seasons', 'updated'];
  }

  /**
   * Constructor - sets up shadow DOM and initial state
   */
  constructor() {
    super();
    
    // Create shadow DOM for encapsulation
    this.attachShadow({ mode: 'open' });
    
    // Initialize component state
    this.podcastData = {
      id: '',
      title: '',
      image: '',
      genres: [],
      seasons: 0,
      updated: ''
    };
    
    this.render();
  }

  /**
   * Called when component is added to DOM
   */
  connectedCallback() {
    this.updateFromAttributes();
    this.addEventListeners();
  }

  /**
   * Called when component is removed from DOM
   */
  disconnectedCallback() {
    this.removeEventListeners();
  }

  /**
   * Called when observed attributes change
   * @param {string} name - Attribute name
   * @param {string} oldValue - Previous value
   * @param {string} newValue - New value
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.updateFromAttributes();
      this.render();
    }
  }

  /**
   * Update internal state from HTML attributes
   * @private
   */
  updateFromAttributes() {
    this.podcastData = {
      id: this.getAttribute('podcast-id') || '',
      title: this.getAttribute('title') || '',
      image: this.getAttribute('image') || '',
      genres: this.parseGenres(this.getAttribute('genres') || ''),
      seasons: parseInt(this.getAttribute('seasons') || '0', 10),
      updated: this.getAttribute('updated') || ''
    };
  }

  /**
   * Parse genres from string attribute
   * @param {string} genresStr - Comma-separated genre names
   * @returns {string[]} Array of genre names
   * @private
   */
  parseGenres(genresStr) {
    return genresStr ? genresStr.split(',').map(g => g.trim()).filter(Boolean) : [];
  }

  /**
   * Format date string to human-readable format
   * @param {string} dateStr - ISO date string
   * @returns {string} Formatted date
   * @private
   */
  formatDate(dateStr) {
    if (!dateStr) return 'Unknown';
    
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Get component styles
   * @returns {string} CSS styles
   * @private
   */
  getStyles() {
    return `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 300px;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .podcast-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .podcast-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .podcast-card:focus {
          outline: 2px solid #007AFF;
          outline-offset: 2px;
        }

        .image-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
        }

        .podcast-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .podcast-card:hover .podcast-image {
          transform: scale(1.05);
        }

        .content {
          padding: 16px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .title {
          font-size: 18px;
          font-weight: 600;
          color: #1d1d1f;
          margin: 0 0 8px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .genres {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .genre-tag {
          background: #f0f0f0;
          color: #666;
          padding: 4px 8px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .metadata {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: #666;
        }

        .seasons {
          font-weight: 500;
        }

        .updated {
          font-size: 12px;
          color: #999;
        }

        .loading-placeholder {
          background: #f5f5f5;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          color: #666;
        }

        @media (max-width: 768px) {
          :host {
            max-width: 100%;
          }
          
          .content {
            padding: 12px;
          }
          
          .title {
            font-size: 16px;
          }
          
          .metadata {
            font-size: 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .podcast-card,
          .podcast-image {
            transition: none;
          }
          
          .podcast-card:hover {
            transform: none;
          }
          
          .podcast-card:hover .podcast-image {
            transform: none;
          }
        }
      </style>
    `;
  }

  /**
   * Render the component HTML
   * @private
   */
  render() {
    const { title, image, genres, seasons, updated } = this.podcastData;
    
    if (!title) {
      this.shadowRoot.innerHTML = `
        ${this.getStyles()}
        <div class="loading-placeholder">
          <p>Loading podcast...</p>
        </div>
      `;
      return;
    }

    const genreTags = genres.map(genre => 
      `<span class="genre-tag">${genre}</span>`
    ).join('');

    const seasonsText = seasons === 1 ? '1 Season' : `${seasons} Seasons`;
    const formattedDate = this.formatDate(updated);

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <article class="podcast-card" tabindex="0" role="button" aria-label="View ${title} details">
        <div class="image-container">
          <img 
            class="podcast-image" 
            src="${image}" 
            alt="${title} cover art"
            loading="lazy"
          />
        </div>
        <div class="content">
          <h3 class="title">${title}</h3>
          <div class="genres">
            ${genreTags}
          </div>
          <div class="metadata">
            <span class="seasons">${seasonsText}</span>
            <span class="updated">Updated ${formattedDate}</span>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Add event listeners
   * @private
   */
  addEventListeners() {
    const card = this.shadowRoot.querySelector('.podcast-card');
    if (card) {
      card.addEventListener('click', this.handleClick.bind(this));
      card.addEventListener('keydown', this.handleKeydown.bind(this));
    }
  }

  /**
   * Remove event listeners
   * @private
   */
  removeEventListeners() {
    const card = this.shadowRoot.querySelector('.podcast-card');
    if (card) {
      card.removeEventListener('click', this.handleClick.bind(this));
      card.removeEventListener('keydown', this.handleKeydown.bind(this));
    }
  }

  /**
   * Handle click events
   * @param {Event} event - Click event
   * @private
   */
  handleClick(event) {
    event.preventDefault();
    this.dispatchPodcastEvent();
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} event - Keyboard event
   * @private
   */
  handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.dispatchPodcastEvent();
    }
  }

  /**
   * Dispatch custom podcast interaction event
   * @private
   */
  dispatchPodcastEvent() {
    const customEvent = new CustomEvent('podcast-selected', {
      detail: {
        podcastId: this.podcastData.id,
        title: this.podcastData.title,
        image: this.podcastData.image,
        genres: this.podcastData.genres,
        seasons: this.podcastData.seasons,
        updated: this.podcastData.updated
      },
      bubbles: true,
      cancelable: true
    });
    
    this.dispatchEvent(customEvent);
  }

  /**
   * Public method to update podcast data programmatically
   * @param {Object} data - Podcast data object
   * @param {string} data.id - Podcast ID
   * @param {string} data.title - Podcast title
   * @param {string} data.image - Podcast image URL
   * @param {string[]} data.genres - Array of genre names
   * @param {number} data.seasons - Number of seasons
   * @param {string} data.updated - Last updated date
   */
  updatePodcast(data) {
    this.podcastData = { ...this.podcastData, ...data };
    this.render();
  }
}

// Register the custom element
customElements.define('podcast-preview', PodcastPreview);

export default PodcastPreview;


