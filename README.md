
# Hyperspace

A collaborative, self-sovereign metaverse for the Hyperbox Protocol.

Each room is a Hyperbox, which can encapsulate code, state, and permissions, and integrate composably with other Hyperboxes.

Each client is local-first and uses CRDT state-synchronisation via a cloud edge worker to communicate with other peers.


## Local Server

Install [node.js](https://nodejs.org/en/download) 16+

To run a local development server...

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser and there you have it!

To use a local [sync server](https://github.com/funDAOmental/hyperbox-server), edit `.env.local` to contain, and restart:

```
SERVER_URL=ws://localhost:8787
```


## Deployment

Committing to the `main` branch triggers an automatic deployment to Vercel.


## Slug Rules

Slugs define a room's name and are used as identifiers of its CRDT data file

* ex: `myroom`, `lounge`, `221bakerstreet`

Slugs must comply with this regex: `/^[a-zA-Z0-9-+_]+$/`, and are always converted to lowercase internally.

A **Branch** is created by adding `:` and another slug, cloning the original Room. The branch is synched on the server and is **multi-player**, without affecting the original **Main Room**

* ex: `myroom:demo`, `lounge:backstage`

A special **branch** called `local` is not synched with the server, and is **single-player**. It resides on the local machine as long as the URL is open.

* ex: `myroom:local`, `lounge:local`

Every room has one special **session** slug, with the `::session` suffix. It contains transient data and can be deleted at any time from the database.

* ex: `myroom::session`, `myroom:demo::session`

Special slugs starting with `:` do not contain room data...

* `:agents`, a global slug that stores users profiles 
* `:endlessquest`, containing **Endless Quest** metadata and messages


## Room Routes

A **Room URL** is built by adding the room slug after the domain...

* `http://localhost:3000/roomName`

To open a **branch**, add the branch name after the slug...

* `http://localhost:3000/roomName/branchName`

A Room slug that matches one **Endless Crawler** chamber name will always load the original Chamber...

* `http://localhost:3000/N1W1`
* `http://localhost:3000/S3E4`

A Room URL starting with `/endlessquest`, followed by an **Endless Crawler** chamber name will always load the **Endless Quest** chamber, including NPCs, metadata, messages, and tilesets.

* `http://localhost:3000/endlessquest/N1W1`
* `http://localhost:3000/endlessquest/S3E4`




