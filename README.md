# ADHD Timer

A countdown timer for a second monitor, with a big bar that shows time passing.

**Live:** https://homemade-vhs.github.io/adhd-timer/

## Features

- Set hours, minutes and seconds, or use the 5–60 minute presets. Add or remove a minute while it runs.
- Glossy progress bar that drains or fills, left or right. Place it at the top or bottom edge, inline with the text, or as a full-screen background.
- Optional color shift from green to yellow to orange to red as time runs low, with adjustable thresholds and colors.
- Title, subheader, countdown and "23 minutes left" text, each with its own font, size, weight, color, justification and letter spacing.
- Flashes the screen and plays a sound at zero (chime, bell, marimba, beep or alarm). After time's up, +1m works as a snooze.
- Theme presets, auto-hiding controls, fullscreen, and an option to keep the screen awake.
- Settings and the running timer are saved in your browser, so a reload picks up where you left off.

## Keyboard

| Key | Action |
| --- | --- |
| Space | Start / pause |
| R | Reset |
| + / − (or ↑ / ↓) | Add / remove a minute |
| S | Open settings |
| F | Fullscreen |
| H | Hide / show controls |
| Esc | Close settings; any key dismisses the alarm |

No build step: it's plain `index.html`, `style.css` and `app.js`.
