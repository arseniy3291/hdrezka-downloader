// Function to extract URLs from page scripts directly, mostly useful for movies
function extractUrlsFromPage() {
    // Check if we are on a rezka or hdrezka domain
    const hostname = window.location.hostname;
    if (!hostname.includes('rezka') && !hostname.includes('hdrezka')) {
        return null;
    }

    const scripts = document.querySelectorAll('script');
    for (let script of scripts) {
        if (script.textContent.includes('initCDNMoviesEvents')) {
            const match = script.textContent.match(/streams\s*:\s*'([^']+)'/);
            if (match && match[1]) {
                const urls = match[1];
                browser.storage.local.set({ lastVideoUrls: urls });
                console.log("HDRezka Downloader: Captured URLs directly from page source.");
                return urls;
            }
        }
    }
    return null;
}

// Run on initial load
extractUrlsFromPage();

// Also observe for player container if it changes
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === 'childList') {
            const player = document.getElementById('cdnplayer');
            if (player) {
                // If player is reloaded or appeared, try parsing again
                extractUrlsFromPage();
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
