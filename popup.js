document.addEventListener('DOMContentLoaded', () => {
    browser.storage.local.get('lastVideoUrls').then((result) => {
        if (result.lastVideoUrls) {
            parseAndDisplayUrls(result.lastVideoUrls);
        }
    });

    // Listen for storage changes in case URLs are updated while popup is open
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.lastVideoUrls) {
            parseAndDisplayUrls(changes.lastVideoUrls.newValue);
        }
    });
});

function parseAndDisplayUrls(urlsString) {
    const container = document.getElementById('links-container');
    container.innerHTML = '';

    if (!urlsString) {
        container.innerHTML = '<p id="no-links">Видео не найдено. Запустите плеер.</p>';
        return;
    }

    // Usually separated by commas: [720p]https://link.mp4,[1080p]https://link.mp4
    const links = urlsString.split(',');
    let hasLinks = false;

    links.forEach(linkStr => {
        if (!linkStr.trim()) return;
        hasLinks = true;
        
        let quality = "Скачать";
        let urlParts = linkStr;
        
        // Match quality tag
        const match = linkStr.match(/^\[(.*?)\](.*)$/);
        if (match) {
            quality = match[1];
            urlParts = match[2];
        }

        // Get actual URL (remove alternative links separated by ' or ')
        let url = urlParts.split(' or ')[0].trim();
        let isMp4 = url.includes('.mp4');
        
        const btn = document.createElement('a');
        btn.href = url;
        btn.className = 'quality-btn';
        if (isMp4) {
            btn.className += ' mp4-btn';
        }
        
        btn.textContent = `${quality} ${isMp4 ? '(MP4)' : '(M3U8)'}`;
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (isMp4) {
                // Use downloads API to trigger proper download
                browser.downloads.download({
                    url: url,
                    filename: `hdrezka_${quality.replace(/[^a-zA-Z0-9]/g, '')}.mp4`,
                    saveAs: true
                });
            } else {
                // Open HLS streams in new tab (users can use extensions like HLS Downloader)
                window.open(url, '_blank');
            }
        });

        container.appendChild(btn);
    });

    if (!hasLinks) {
        container.innerHTML = '<p id="no-links">Подходящих ссылок не найдено.</p>';
    }
}
