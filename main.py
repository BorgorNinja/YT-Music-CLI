import curses
import time
import subprocess
from youtubesearchpython import VideosSearch

# Search YouTube for music. I can't believe I'm still doing this...
def search_music(query):
    search = VideosSearch(query, limit=10)  # Limited to 10, 'cause apparently more is too much
    results = search.result()['result']
    return [{"title": entry["title"], "url": entry["link"]} for entry in results]

# Playing video via mpv. I swear if this doesn't work, I’m done.
def play_video(url, stdscr):
    mpv_cmd = ["mpv", "--no-video", "--input-ipc-server=/tmp/mpv-socket", url]
    
    # Start mpv process, don’t mess it up
    proc = subprocess.Popen(mpv_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Loading screen. Like, come on, how long does it take?
    h, w = stdscr.getmaxyx()
    stdscr.clear()
    curses.curs_set(0)
    loading_msg = "Loading, please wait..."
    stdscr.addstr(h // 2, w // 2 - len(loading_msg) // 2, loading_msg, curses.A_BOLD)
    stdscr.refresh()
    time.sleep(2)  # Ugh, seriously?

    # Progress bar variables, don’t make me repeat myself
    total_duration = 0
    current_time = 0

    while proc.poll() is None:
        stdscr.clear()
        
        # Get time, if mpv even decides to give it to us
        output = proc.stdout.readline().decode("utf-8")
        
        # Get current playback time if mpv isn't being a jerk
        if "time-pos" in output:
            try:
                current_time = float(output.split("=")[1].strip())
            except ValueError:
                pass

        # Get duration, if it's even available, like seriously
        if "duration" in output and total_duration == 0:
            try:
                total_duration = float(output.split("=")[1].strip())
            except ValueError:
                pass

        # Don’t screw up the progress bar, it’s not rocket science
        if total_duration > 0:
            progress = int((current_time / total_duration) * (w - 4))
            elapsed_time = time.strftime("%M:%S", time.gmtime(current_time))
            remaining_time = time.strftime("%M:%S", time.gmtime(total_duration - current_time))

            # Format progress bar like it’s meant to work
            progress_bar = "[" + "#" * (progress // 2) + " " * ((w - 4) - (progress // 2)) + "]"
            stdscr.addstr(2, w // 2 - len(progress_bar) // 2, progress_bar)
            stdscr.addstr(3, w // 2 - len(elapsed_time) // 2, f"{elapsed_time} / {remaining_time}")
        
        # Display the title, it better be correct
        title = f"Playing: {url}"
        stdscr.addstr(0, w // 2 - len(title) // 2, title, curses.A_BOLD)

        stdscr.refresh()
        time.sleep(0.1)

    # Playback done. Finally.
    stdscr.clear()
    stdscr.addstr(h // 2, w // 2 - len("Playback Finished") // 2, "Playback Finished", curses.A_BOLD)
    stdscr.refresh()
    time.sleep(2)

    proc.wait()  # If you mess this up, I’m done.

# Main menu, because we obviously need it
def main_menu(stdscr):
    stdscr.clear()
    curses.curs_set(0)

    search_query = "Enter your search here..."
    search_results = []
    current_index = 0

    while True:
        stdscr.clear()
        h, w = stdscr.getmaxyx()

        # Header, not like it matters, you know?
        header = "YT Music Player - Select a Song"
        stdscr.addstr(0, w // 2 - len(header) // 2, header, curses.A_BOLD)

        # Search prompt, because you can’t read minds
        stdscr.addstr(2, w // 2 - len(search_query) // 2, search_query, curses.A_DIM)

        # Display results, let’s hope it’s what you want
        for i, result in enumerate(search_results):
            if i == current_index:
                stdscr.addstr(4 + i, 2, f"> {result['title']}", curses.A_REVERSE)
            else:
                stdscr.addstr(4 + i, 2, f"  {result['title']}")

        # Footer, not that it’ll help you much
        footer = "Navigate with UP/DOWN, Select with ENTER, Search with 'S', Quit with 'Q'"
        stdscr.addstr(h - 1, w // 2 - len(footer) // 2, footer, curses.A_DIM)

        stdscr.refresh()

        key = stdscr.getch()
        if key == curses.KEY_UP and current_index > 0:
            current_index -= 1
        elif key == curses.KEY_DOWN and current_index < len(search_results) - 1:
            current_index += 1
        elif key in (ord("\n"), curses.KEY_ENTER) and search_results:
            # Play the selected video. Don’t screw this up.
            play_video(search_results[current_index]["url"], stdscr)
        elif key == ord("s"):
            stdscr.addstr(2, w // 2 - len("Enter search term: ") // 2, "Enter search term: ")
            stdscr.refresh()
            curses.echo()
            query = stdscr.getstr(2, w // 2 + len("Enter search term: ") // 2, 50).decode("utf-8")
            curses.noecho()
            search_results = search_music(query)
            current_index = 0
        elif key == ord("q"):
            break

# Main function to start the curses-based interface, obviously
def main():
    curses.wrapper(main_menu)

if __name__ == "__main__":
    main()
