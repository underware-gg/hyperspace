
# Hyperspace

A collaborative, self-sovereign metaverse for the Hyperbox Protocol.

Each room is a Hyperbox, which can encapsulate code, state and permissions, and integrate composably with other Hyperboxes.

Each client is local-first and uses CRDT state-synchronisation via an cloud edge worker to communicate with other peers.

## Development Server

**requires node >=v16.14.0**

To run the development server:

```bash
yarn run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser and there you have it!


## Deployment

Committing to the `main` branch triggers an automatic deployment to Vercel.
