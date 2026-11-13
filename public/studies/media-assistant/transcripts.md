# Media assistant demo transcripts

These transcripts give the exact text of each exchange in the demo screenshots. The owner
sent each message in a Discord direct message to the bot, which appears as **Lab-Agent**.
Each bot reply ends with a small footer that names the tools the reply read.

Redactions match the screenshots:

- `[owner]` replaces the owner's Discord display name.
- `[Plex user]` replaces the owner's Plex account name.
- `[title]` replaces the name of a title in the library.

The screenshots also crop out avatars, the server and channel lists, and the sidebar.

## Shot 1: library question

`shot-1-library.png`

> **[owner]:** Do we have Night of the Living Dead?
>
> **Lab-Agent:** We don't have "Night of the Living Dead" in the library.
> read: library

## Shot 2: server status

`shot-2-status.png`

> **[owner]:** What's the server status?
>
> **Lab-Agent:** Plex is active with 1 session: [Plex user] is watching "[title]".
> read: now_playing

## Shot 3: write request with confirmation

`shot-3-write.png`

Before this exchange, the owner asked "Which titles are missing subtitles?" to pick a target.
That exchange is not in a screenshot, because its reply lists titles in the library.

The bot does not run a write directly. It proposes the action with **Confirm** and
**Cancel** buttons, and runs it only after the owner taps **Confirm**. The bot then removes
the buttons, so the screenshot shows the proposal and the result, not the buttons.

> **[owner]:** Search for missing subtitles for [title]
>
> **Lab-Agent:** Confirm to search for subtitles for "[title]".
> read: propose_action
>
> *The owner taps **Confirm**.*
>
> **Lab-Agent:** Running: Search subtitles for [title] (0 missing) (edited)
>
> **Lab-Agent:** ✅ [title]: Bazarr accepted the search (HTTP 204). It runs in Bazarr's task
> queue; new subtitles land beside the media and Bazarr refreshes Plex after each one.

## Shot 4: off-topic decline

`shot-4-decline.png`

> **[owner]:** What's the weather?
>
> **Lab-Agent:** I cannot check the weather. Would you like me to help with something else?
> read: none
