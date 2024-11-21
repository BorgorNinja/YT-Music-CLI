# YT Music Player - Terminal CLI

A terminal-based music player that allows you to search for and play YouTube music videos directly using `mpv`.

## Features

- **Search** for YouTube music videos directly from the terminal.
- **Play audio** using `mpv` with no video output.
- **Progress bar** and **elapsed time** display during playback.
- **Easy navigation** through search results.
- **Loading screen** displayed while the video is being prepared.

## Requirements

Before running the program, ensure the following dependencies are installed:

- `Python 3.x`
- `mpv` (for audio playback)
- `youtubesearchpython` (for searching YouTube)

You can install the required Python package by running:

```bash
pip install youtubesearchpython

To install mpv, use the following:

On Ubuntu/Debian:

sudo apt install mpv

On macOS (using Homebrew):

brew install mpv

On Windows, download from mpv's website.


Usage

1. Clone this repository:

git clone https://github.com/yourusername/yt-music-player.git
cd yt-music-player


2. Run the program:

python3 main.py


3. Use the following commands within the terminal interface:

UP/DOWN: Navigate through the search results.

ENTER: Play the selected video.

S: Start a new search.

Q: Quit the application.




How It Works

1. Search: Enter a search term, and the program will fetch YouTube video results.


2. Select & Play: Navigate to a video and press ENTER to start playback.


3. Progress Bar: While playing, the progress bar and elapsed time are displayed.


4. Loading Screen: A loading screen is shown while the video is being prepared by mpv.



Troubleshooting

If you’re not seeing any progress or playback, make sure that mpv is correctly installed and available in your system’s PATH.

If the terminal interface is glitchy, try resizing your terminal window to ensure proper rendering.


License

This project is licensed under the MIT License - see the LICENSE file for details.


---

Notes

This project was developed for educational purposes and is intended for users who enjoy terminal-based applications.

Use at your own risk. If the program crashes or behaves unexpectedly, just restart it. We’re not responsible for any random errors that may pop up. Seriously.


### Key Sections:
- **Features**: Lists what the program can do.
- **Requirements**: Includes installation instructions for Python and `mpv`.
- **Usage**: Explains how to run the program and interact with the terminal interface.
- **How It Works**: Describes the core functionality.
- **Troubleshooting**: Offers basic help if something goes wrong.
- **License**: Includes an MIT license note (you can replace it with your own if you prefer another license)

