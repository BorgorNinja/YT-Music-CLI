const blessed = require('blessed');
const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const ytSearch = require('yt-search');

// MPV IPC Socket Path
const mpvSocketPath = '/tmp/mpv-socket';

// Helper function to search YouTube
async function searchYouTube(query) {
    const searchResults = await ytSearch(query);
    return searchResults.videos.slice(0, 10).map(video => ({
        title: video.title,
        url: video.url,
        duration: video.timestamp,
    }));
}

// Function to play video using MPV with a custom UI
function playVideo(url, screen, mainMenuCallback) {
    if (fs.existsSync(mpvSocketPath)) fs.unlinkSync(mpvSocketPath);

    const mpv = spawn('mpv', [
        '--no-video',
        `--input-ipc-server=${mpvSocketPath}`,
        url,
    ]);

    const playerBox = blessed.box({
        parent: screen,
        label: 'YT Music Player',
        top: 'center',
        left: 'center',
        width: '80%',
        height: '40%',
        border: { type: 'line' },
        style: { border: { fg: 'cyan' }, fg: 'white' },
    });

    const titleBox = blessed.text({
        parent: playerBox,
        top: 1,
        left: 'center',
        width: 'shrink',
        content: `Playing: ${url}`,
        style: { fg: 'yellow', bold: true },
    });

    const progressBarBox = blessed.box({
        parent: playerBox,
        top: 3,
        left: 'center',
        width: '70%',
        height: 1,
        content: `[${' '.repeat(50)}]`, // Initial progress bar
        style: { fg: 'white' },
    });

    const timestampBox = blessed.text({
        parent: playerBox,
        top: 5,
        left: 'center',
        width: 'shrink',
        content: `Elapsed: 00:00 / Total: --:--`,
        style: { fg: 'white' },
    });

    screen.render();

    let totalDuration = 0;

    function updatePlayer() {
        const client = net.createConnection({ path: mpvSocketPath }, () => {
            client.write('{"command":["get_property","time-pos"]}\n');
            client.write('{"command":["get_property","duration"]}\n');
        });

        client.on('data', (data) => {
            try {
                const responses = data.toString().split('\n').filter(line => line.trim());
                const parsed = responses.map(line => JSON.parse(line));

                const currentTime = parsed.find(p => p.data && p.data !== 'error')?.data || 0;
                const duration = parsed.find(p => p.data && p.data > 0)?.data;

                if (duration) totalDuration = duration;

                if (currentTime && totalDuration) {
                    const progress = Math.round((currentTime / totalDuration) * 50);
                    const elapsed = new Date(currentTime * 1000).toISOString().substr(14, 5);
                    const total = new Date(totalDuration * 1000).toISOString().substr(14, 5);

                    // Update progress bar and timestamps
                    progressBarBox.setContent(`[${'#'.repeat(progress)}${' '.repeat(50 - progress)}]`);
                    timestampBox.setContent(`Elapsed: ${elapsed} / Total: ${total}`);
                }
            } catch (err) {
                // Handle parsing errors silently
            } finally {
                client.end();
            }
        });

        client.on('error', () => {
            // Handle connection errors silently
        });
    }

    const interval = setInterval(() => {
        if (mpv.killed) return clearInterval(interval);
        updatePlayer();
        screen.render();
    }, 500);

    screen.key('p', () => {
        clearInterval(interval);
        mpv.kill('SIGTERM');
        playerBox.destroy();
        mainMenuCallback();
    });

    screen.key('q', () => {
        clearInterval(interval);
        mpv.kill('SIGTERM');
        process.exit(0);
    });
}

// Main menu to search and select songs
async function mainMenu(screen) {
    const menuBox = blessed.box({
        parent: screen,
        label: 'Search YouTube Music',
        top: 'center',
        left: 'center',
        width: '80%',
        height: '60%',
        border: { type: 'line' },
        style: { border: { fg: 'cyan' }, fg: 'white' },
    });

    const inputBox = blessed.textbox({
        parent: menuBox,
        top: 2,
        left: 'center',
        width: '70%',
        height: 3,
        border: { type: 'line' },
        style: { fg: 'yellow', bold: true },
        inputOnFocus: true,
    });

    const resultsList = blessed.list({
        parent: menuBox,
        top: 6,
        left: 'center',
        width: '70%',
        height: '70%',
        border: { type: 'line' },
        style: { item: { fg: 'white' }, selected: { fg: 'black', bg: 'yellow' } },
        keys: true,
        mouse: true,
        interactive: true,
    });

    screen.render();

    inputBox.focus();

    // On search
    inputBox.on('submit', async (query) => {
        const results = await searchYouTube(query);
        resultsList.setItems(results.map(r => r.title));
        resultsList.results = results; // Store results for later use
        resultsList.select(0);
        resultsList.focus(); // Enable navigation
        screen.render();
    });

    // On selection
    resultsList.on('select', (item, index) => {
        const selectedUrl = resultsList.results[index].url;
        menuBox.destroy();
        playVideo(selectedUrl, screen, () => mainMenu(screen));
    });

    // Exit the app
    screen.key('q', () => process.exit(0));
}

// Initialize the app
function main() {
    const screen = blessed.screen({
        smartCSR: true,
        title: 'YouTube Music Player',
    });

    mainMenu(screen);

    screen.render();
}

main();
