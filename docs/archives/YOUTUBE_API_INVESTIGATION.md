# YouTube APIs Investigation - Internal vs External

**Date**: January 22, 2025
**Purpose**: Investigate available YouTube APIs for accessing video transcripts and AI summaries

---

## 🔴 TL;DR Quick Answer

| Feature | Available Internally | Requires External API |
|---------|-------------------|---------------------|
| **Transcript** | ✅ YES (via DOM) | Optional (YouTube Data API) |
| **AI Summary** | ✅ YES (via DOM) | No API available |
| **Video Info** | ✅ YES (window.yt) | Optional (YouTube Data API) |
| **Comments** | ✅ YES (via DOM) | Optional (YouTube Data API) |
| **Metadata** | ✅ YES (via DOM) | Optional (YouTube Data API) |

**Veredicto**: **NO necesitas API externa**. Casi todo está disponible internamente vía el navegador (DOM/window.yt).

---

## 🎯 YouTube APIs Overview

### 1. YouTube Data API (External)

**Type**: Official Google REST API
**Requires**: Google Cloud API Key
**Documentation**: https://developers.google.com/youtube/v3

**Available Endpoints**:
- `GET /videos` - Video metadata
- `GET /captions` - Captions/transcripts
- `GET /commentThreads` - Comments
- `GET /search` - Search

**Pros**:
- ✅ Official and documented
- ✅ Stable (won't break with YouTube updates)
- ✅ Can be used from any context (not just YouTube page)
- ✅ Rate limiting and quotas

**Cons**:
- ❌ Requires Google Cloud project and API key
- ❌ Quotas (10,000 units/day free)
- ❌ No AI summary endpoint available
- ❌ Transcript requires extra request
- ❌ Requires server-side or CORS handling
- ❌ Transcript format is XML/JSON, not formatted text

**Cost**: Free tier limited, then pay-as-you-go

---

### 2. window.yt (Internal Browser API)

**Type**: Internal YouTube JavaScript API (exposed in browser)
**Requires**: Running on youtube.com page
**Documentation**: None (undocumented, reverse-engineered)

**Available Objects**:
```javascript
window.yt = {
  // Player management
  player: {
    Application: {...},
    Player: {...},
    config_: {...}
  },

  // Service workers
  pubsub: {...},
  net: {...},
  utils: {...}
}
```

**How to Access**:
```javascript
// Run in YouTube console (F12)
window.yt.player
window.yt.pubsub
window.yt.utils
```

**Pros**:
- ✅ No API key needed
- ✅ No quotas
- ✅ Real-time access to player state
- ✅ Can access internal YouTube data
- ✅ Direct access to YouTube's own data structures

**Cons**:
- ❌ Undocumented (can change without warning)
- ❌ Only works on youtube.com page
- ❌ Reverse-engineering required
- ❌ Breaks when YouTube updates UI
- ❌ Limited to what YouTube exposes

**Cost**: Free, but maintenance-heavy

---

### 3. DOM Parsing (Internal Page Data)

**Type**: Extracting data directly from YouTube's HTML structure
**Requires**: Running on youtube.com page
**Documentation**: YouTube's own HTML structure

**Available Data**:

#### Transcript
```javascript
// Method 1: YouTube's transcript button (most reliable)
const transcriptButton = document.querySelector('button[aria-label*="Show transcript"]');
transcriptButton.click();

// Transcript modal opens, data is in DOM
const transcriptDialog = document.querySelector('ytd-transcript-search-panel-renderer');
const transcriptLines = transcriptDialog.querySelectorAll('yt-formatted-string');

// Format as array
const transcript = Array.from(transcriptLines).map(line => ({
  timestamp: line.parentElement.querySelector('.segment-timestamp').textContent,
  text: line.textContent
}));
```

```javascript
// Method 2: YouTube's internal data (ytd-player config)
const playerData = document.querySelector('#movie_player').data;
const captions = playerData.playerResponse.captions;
// Returns captions data (requires parsing)
```

```javascript
// Method 3: YouTube's timedtext API (internal endpoint)
const videoId = 'VIDEO_ID';
const timedtextUrl = `/api/timedtext?v=${videoId}&lang=en`;
fetch(timedtextUrl)
  .then(r => r.text())
  .then(xml => parseTranscript(xml));
```

#### AI Summary
```javascript
// YouTube's AI Summary (Google Bard integration)
// When available, appears as "Key topics" in description

const summarySection = document.querySelector('ytd-expandable-video-description-body-renderer ytd-text-inline-expander');

// Or check for "Key topics" button
const summaryButton = document.querySelector('button[aria-label*="Key topics"]');

// Extract summary text
const summaryText = summarySection?.textContent;

// Format as array of points
const summaryPoints = Array.from(document.querySelectorAll('.ytd-reel-shelf-renderer .ytd-text-inline-expander'))
  .map(el => el.textContent.trim());
```

#### Video Metadata
```javascript
// Method 1: YouTube's initial data (in <script>)
const initialData = document.querySelector('#initial-data').textContent;
const data = JSON.parse(initialData);
const videoData = data.contents.twoColumnWatchNextResults.results.results.contents;

// Method 2: Player data object
const playerData = document.querySelector('#movie_player').data;
const videoId = playerData.playerResponse.videoDetails.videoId;
const title = playerData.playerResponse.videoDetails.title;
const duration = playerData.playerResponse.videoDetails.lengthSeconds;
```

**Pros**:
- ✅ No API key needed
- ✅ Real-time data (as user sees it)
- ✅ Access to AI summary (when available)
- ✅ Access to formatted transcript
- ✅ No quotas
- ✅ Works offline (data already loaded)

**Cons**:
- ❌ Only works on youtube.com page
- ❌ YouTube can change HTML structure
- ❌ Transcript requires clicking button (user interaction)
- ❌ AI summary not available for all videos
- ❌ Some data requires user gesture (clicking buttons)

**Cost**: Free, but requires maintenance

---

## 📊 Comparison Matrix

| Feature | YouTube Data API | window.yt | DOM Parsing |
|---------|-----------------|------------|-------------|
| **Transcript** | ✅ XML format | ❌ Not exposed | ✅ Formatted text |
| **AI Summary** | ❌ Not available | ❌ Not exposed | ✅ When available |
| **Video Info** | ✅ Full metadata | ✅ Partial | ✅ Full metadata |
| **Comments** | ✅ All comments | ❌ Not exposed | ✅ Visible comments |
| **Requirements** | API Key | N/A | On youtube.com |
| **Quotas** | Yes | No | No |
| **Stability** | ✅ High | ⚠️ Medium | ⚠️ Medium |
| **Maintenance** | Low | High | Medium |

---

## 🎯 Recommended Approach for Yutu Labs

### Option 1: DOM Parsing (Recommended) ⭐⭐⭐⭐⭐

**Why**: Best balance of features and simplicity

**Implementation**:

```javascript
// content/transcript-extractor.js
export class TranscriptExtractor {
  /**
   * Get transcript for current video
   * @returns {Promise<Array>} Transcript lines with timestamps
   */
  async getTranscript() {
    try {
      // Find and click transcript button
      const transcriptBtn = document.querySelector(
        'button[aria-label*="Show transcript"], button[aria-label*="transcript"]'
      );

      if (!transcriptBtn) {
        console.log('No transcript available for this video');
        return null;
      }

      // Click to open transcript panel
      transcriptBtn.click();

      // Wait for transcript panel to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Extract transcript data from DOM
      const transcriptPanel = document.querySelector(
        'ytd-transcript-search-panel-renderer'
      );

      if (!transcriptPanel) {
        return null;
      }

      // Extract transcript lines
      const segments = transcriptPanel.querySelectorAll(
        'ytd-transcript-segment-list-renderer ytd-transcript-segment-renderer'
      );

      const transcript = Array.from(segments).map(segment => {
        const timestampEl = segment.querySelector('.segment-timestamp');
        const textEl = segment.querySelector('yt-formatted-string');

        return {
          timestamp: timestampEl?.textContent || '',
          text: textEl?.textContent || '',
          start: this.parseTimestamp(timestampEl?.textContent)
        };
      });

      // Close transcript panel
      transcriptBtn.click();

      return transcript;
    } catch (error) {
      console.error('Error extracting transcript:', error);
      return null;
    }
  }

  /**
   * Parse timestamp string to seconds
   * @param {string} timestamp - "0:05", "1:23", "10:30"
   * @returns {number} Seconds
   */
  parseTimestamp(timestamp) {
    if (!timestamp) return 0;
    const parts = timestamp.split(':').map(Number);
    return parts.length === 2
      ? parts[0] * 60 + parts[1]
      : parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  /**
   * Get AI summary if available
   * @returns {Promise<string|null>} Summary text
   */
  async getAISummary() {
    try {
      // Look for "Key topics" or AI summary section
      const summarySection = document.querySelector(
        'ytd-rich-section-renderer:has(button[aria-label*="Key topics"]), ' +
        'ytd-rich-section-renderer:has(button[aria-label*="summary"])'
      );

      if (!summarySection) {
        return null;
      }

      // Extract summary content
      const summaryContent = summarySection.querySelector('yt-formatted-string');

      return summaryContent?.textContent || null;
    } catch (error) {
      console.error('Error extracting AI summary:', error);
      return null;
    }
  }

  /**
   * Get video metadata
   * @returns {Object} Video information
   */
  getVideoMetadata() {
    const playerData = document.querySelector('#movie_player')?.data;

    if (!playerData) {
      return null;
    }

    const details = playerData.playerResponse?.videoDetails;

    return {
      videoId: details?.videoId,
      title: details?.title,
      author: details?.author,
      channelId: details?.channelId,
      lengthSeconds: details?.lengthSeconds,
      viewCount: details?.viewCount,
      uploadDate: details?.uploadDate,
      thumbnail: details?.thumbnail?.thumbnails?.[0]?.url
    };
  }
}
```

**Integration with Yutu Labs**:

```javascript
// content/content.js
import { TranscriptExtractor } from './transcript-extractor.js';

class YutuPiPManager {
  constructor() {
    this.transcriptExtractor = new TranscriptExtractor();
    // ... rest of code
  }

  async openPiPPlayer(videoId) {
    // ... existing code ...

    // Get transcript when window opens
    const transcript = await this.transcriptExtractor.getTranscript();

    if (transcript) {
      console.log('📝 Transcript found:', transcript.length, 'lines');
      // Can display transcript in floating window
    }

    // Get AI summary
    const summary = await this.transcriptExtractor.getAISummary();

    if (summary) {
      console.log('🤖 AI Summary found:', summary);
      // Can display summary in floating window
    }
  }
}
```

**Features**:
- ✅ Transcript extraction (formatted with timestamps)
- ✅ AI summary extraction (when available)
- ✅ Video metadata
- ✅ No API key needed
- ✅ No quotas
- ✅ Works in floating window context

**Limitations**:
- ⚠️ Transcript requires clicking button (user gesture)
- ⚠️ AI summary not available for all videos
- ⚠️ YouTube may change selectors

---

### Option 2: YouTube Data API (Alternative) ⭐⭐⭐

**When to use**:
- Need data from outside YouTube.com
- Need stable, documented API
- Building server-side features

**Implementation**:

```javascript
// background/youtube-api.js
const API_KEY = 'YOUR_GOOGLE_API_KEY';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

async function getVideoTranscript(videoId) {
  // NOTE: YouTube Data API v3 DOES NOT have transcript endpoint
  // You would need to use captions endpoint and parse manually

  const url = `${BASE_URL}/captions?part=snippet&videoId=${videoId}&key=${API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  // Returns list of caption tracks
  // You would need to download and parse each track
  return data;
}

async function getVideoDetails(videoId) {
  const url = `${BASE_URL}/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.items[0];
}
```

**Why NOT recommended for Yutu Labs**:
- ❌ No AI summary endpoint available
- ❌ Transcript requires extra requests and parsing
- ❌ Requires API key management
- ❌ Has quotas
- ❌ More complex than DOM parsing

---

## 🎨 Practical Implementation for Yutu Labs

### Use Case 1: Show Transcript in Floating Window

```javascript
// Add transcript panel to floating window
async enhanceFloatingWindow(pipWindow, videoId) {
  const transcript = await this.transcriptExtractor.getTranscript();

  if (transcript && transcript.length > 0) {
    // Create transcript panel
    const transcriptPanel = pipWindow.document.createElement('div');
    transcriptPanel.className = 'pip-transcript';
    transcriptPanel.innerHTML = `
      <div class="pip-transcript__header">
        <h4>📝 Transcript</h4>
        <button class="pip-transcript__toggle">Show</button>
      </div>
      <div class="pip-transcript__content">
        ${transcript.map(line => `
          <div class="pip-transcript__line" data-time="${line.start}">
            <span class="pip-transcript__time">${line.timestamp}</span>
            <span class="pip-transcript__text">${line.text}</span>
          </div>
        `).join('')}
      </div>
    `;

    pipWindow.document.body.appendChild(transcriptPanel);

    // Auto-scroll transcript based on video time
    const iframe = pipWindow.document.querySelector('iframe');
    iframe.contentWindow.postMessage('getPlaybackTime', '*');
  }
}
```

### Use Case 2: Show AI Summary in Floating Window

```javascript
// Add summary to floating window
async enhanceWithSummary(pipWindow) {
  const summary = await this.transcriptExtractor.getAISummary();

  if (summary) {
    const summaryPanel = pipWindow.document.createElement('div');
    summaryPanel.className = 'pip-summary';
    summaryPanel.innerHTML = `
      <div class="pip-summary__header">
        <h4>🤖 AI Summary</h4>
      </div>
      <div class="pip-summary__content">
        ${summary}
      </div>
    `;

    pipWindow.document.body.appendChild(summaryPanel);
  }
}
```

### Use Case 3: Search Within Transcript

```javascript
// Add search functionality
searchTranscript(query, transcript) {
  return transcript.filter(line =>
    line.text.toLowerCase().includes(query.toLowerCase())
  ).map(line => ({
    ...line,
    highlighted: line.text.replace(
      new RegExp(query, 'gi'),
      match => `<mark>${match}</mark>`
    )
  }));
}
```

---

## 🔍 Debugging Tools

### Check if Transcript is Available
```javascript
// Run in YouTube console (F12)
document.querySelector('button[aria-label*="transcript"]')
// Returns button if transcript available, null if not
```

### Check if AI Summary is Available
```javascript
// Run in YouTube console (F12)
document.querySelector('button[aria-label*="Key topics"]')
// Returns button if summary available, null if not
```

### Extract Transcript Manually
```javascript
// Run in YouTube console (F12)
const transcriptBtn = document.querySelector('button[aria-label*="transcript"]');
transcriptBtn.click();

setTimeout(() => {
  const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
  const transcript = Array.from(segments).map(seg => ({
    time: seg.querySelector('.segment-timestamp').textContent,
    text: seg.querySelector('yt-formatted-string').textContent
  }));
  console.log(transcript);
}, 1000);
```

### Inspect window.yt
```javascript
// Run in YouTube console (F12)
console.log(window.yt);
console.log(window.yt.player);
console.log(window.yt.pubsub);
```

---

## ⚠️ Limitations and Known Issues

### Transcript Limitations
1. **Not available for all videos**
   - User-disabled captions
   - Auto-generated only (no manual captions)
   - Region restrictions

2. **Requires user gesture**
   - Must click transcript button to load
   - Cannot load in background without user action

3. **Format limitations**
   - Only plain text (no rich formatting)
   - Timestamps in "MM:SS" format
   - No speaker identification

### AI Summary Limitations
1. **Not available for all videos**
   - Only for videos with YouTube Premium/US region
   - Only for longer videos (>10 min typically)
   - YouTube's AI model availability varies

2. **Format varies**
   - Sometimes bullet points
   - Sometimes paragraphs
   - Sometimes just "Key topics" list
   - No consistent structure

3. **Language restrictions**
   - Only English supported initially
   - Other languages rolling out gradually

---

## 📝 Summary

### Can we access transcript internally?
**YES** ✅
- Method: DOM parsing (click transcript button)
- No API key needed
- No quotas
- Real-time data

### Can we access AI summary internally?
**YES** ✅
- Method: DOM parsing (check description/sections)
- No API key needed
- Not available for all videos
- Only when YouTube provides it

### Do we need external API?
**NO** ❌
- Everything is available internally
- DOM parsing is sufficient
- window.yt provides additional data
- Only need API if building server-side features

---

## 🚀 Next Steps for Implementation

### Immediate (Proof of Concept)
1. Create `content/transcript-extractor.js`
2. Implement `getTranscript()` method
3. Test on YouTube videos with captions
4. Log transcript to console

### Medium (Integration)
1. Integrate transcript extractor into floating window
2. Add transcript panel to PiP window
3. Add auto-scroll based on playback time
4. Add search functionality

### Advanced (Features)
1. Implement AI summary extraction
2. Add toggle for transcript/summary visibility
3. Add export transcript to clipboard
4. Add timestamps to jump to specific time

---

## 📚 References

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [YouTube Player API](https://developers.google.com/youtube/iframe_api_reference)
- [YouTube Caption Formats](https://developers.google.com/youtube/v3/docs/captions)
- [YouTube HTML Structure](https://github.com/ytdl-org/youtube-dl) (for reverse engineering)

---

*Last updated: January 22, 2025*
