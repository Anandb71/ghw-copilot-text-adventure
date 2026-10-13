# ghw-copilot-text-adventure

A small browser text adventure built with GitHub Copilot.

## The Game

Explore the connected rooms beneath an old station, collect useful items, and find the brass key. Use it at the sealed iron door, then enter the treasure room to win.

The game includes five rooms, including an archive, flooded hall, observatory, sealed door, and treasure room. Items can be collected and used as you explore.

## Commands

- `go <direction>`: Move north, south, east, or west.
- `take <item>`: Pick up an item in the current room.
- `use <item>`: Use an item you are carrying.
- `look`: Inspect the current room and its exits.
- `inventory`: List the items you are carrying.
- `help`: Show the available commands.
- `restart`: Start a new session.

## Run Locally

From the project root, start a local web server:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Built With

This project was built with GitHub Copilot.
