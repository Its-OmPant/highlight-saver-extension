# Highlight Saver Chrome Extension

A Chrome extension that lets you save text highlights from any webpage and access them later.

## Features

-   Save text highlights from any webpage with a convenient floating button
-   View all saved highlights in the extension popup
-   Each highlight includes:
    -   Selected text
    -   Source page URL and title
    -   Timestamp of when it was saved
-   Dark/light theme support matching system preferences
-   Local storage of highlights using Chrome's storage API
-   Clean minimal interface

## Usage

1. Select any text on a webpage
2. Click the "Save highlight?" button that appears
3. Click the extension icon in toolbar to view your saved highlights
4. In the popup you can:
    - View all highlights with their sources and timestamps
    - Click "Open page" to revisit the source webpage
    - Delete individual highlights
    - Clear all highlights at once

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Technical Details

Built using:

-   Chrome Extension Manifest V3
-   Chrome Storage API for data persistence
-   Content Scripts for webpage interaction
-   Custom CSS for theming and
