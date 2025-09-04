# Telnyx Links - Chrome/Edge Extension

A powerful browser extension that allows you to select and open multiple links simultaneously with customizable keyboard shortcuts. Similar to Link Clump but with a cleaner interface and green-themed design.

![Telnyx Links Icon](icon128.png)

## Features

- 🔗 **Multi-Link Selection**: Hold a customizable key and drag to select multiple links
- 🎨 **Visual Feedback**: Light green transparent overlay shows selected links
- ⌨️ **Customizable Hotkey**: Choose any keyboard key as your activation trigger
- 🚀 **Batch Opening**: Open all selected links in new tabs with one action
- 💚 **Clean Green UI**: Beautiful green-themed interface

## Installation

### From Source (Developer Mode)

1. Clone this repository or download the source code
2. Open Chrome or Microsoft Edge
3. Navigate to `chrome://extensions` or `edge://extensions`
4. Enable **Developer mode** (toggle in top right)
5. Click **Load unpacked**
6. Select the folder containing this extension
7. The Telnyx Links icon should appear in your extensions bar

### From Chrome Web Store
*Coming soon*

## Usage

### Basic Operation

1. **Click the extension icon** to open settings
2. **Set your activation key** (default is Shift)
3. **On any webpage:**
   - Hold your activation key
   - Click and drag to select multiple links (green highlight appears)
   - Release the key to open all selected links in new tabs

### Changing the Activation Key

1. Click the Telnyx Links extension icon
2. Click the activation key button
3. Press any key you want to use
4. The key will be saved automatically

## File Structure

```
telnyx-links/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for tab management
├── content.js            # Main selection logic
├── popup.html            # Settings interface
├── popup.js              # Settings functionality
├── popup.css             # Green-themed styling
├── selection.css         # Selection overlay styles
├── icon16.png            # Toolbar icon
├── icon48.png            # Medium icon
├── icon128.png           # Large icon
└── README.md             # This file
```

## Development

### Prerequisites
- Chrome or Edge browser
- Basic knowledge of JavaScript and Chrome Extension APIs

### Making Changes

1. Edit the source files as needed
2. Go to `chrome://extensions` or `edge://extensions`
3. Click the refresh icon on the Telnyx Links card
4. Test your changes on any webpage

### Key Files

- `content.js` - Contains the core link selection logic
- `popup.js` - Manages the settings interface
- `background.js` - Handles opening links in new tabs

## Browser Compatibility

- ✅ Google Chrome (version 88+)
- ✅ Microsoft Edge (Chromium-based)
- ✅ Brave Browser
- ✅ Opera (version 74+)
- ⚠️ Firefox (requires manifest v2 conversion)

## Privacy

This extension:
- ✅ Does not collect any user data
- ✅ Does not track browsing history
- ✅ Works entirely offline
- ✅ Only activates when you use the hotkey

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have suggestions:
- Open an issue on GitHub
- Contact the developer

## Acknowledgments

- Inspired by the Link Clump extension
- Built with Chrome Extension Manifest V3
- Green theme for better visual comfort

---

**Version:** 1.0.0  
**Author:** Tony Rizo  
**Last Updated:** September 2025
