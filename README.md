# Tail Database

This is a web3 app which connects to a Tail Database data store in DataLayer running on the Chia blockchain.

## How data is retrieved from DataLayer

The application is configured to use [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation) with a [Context Bridge](https://www.electronjs.org/docs/latest/api/context-bridge) to facilitate communication between the UI (Main world) and Node processes running in the back-end. This allows the UI to trigger RPC calls to a locally running full node securely without being able to access Electron internals.

The DataLayer RPC provided by the full node is used for creating, updating, and deleting data from DataLayer.

## Available Scripts

Currently in development. Run `npm run electron:dev` to try it out against a local full node (must be running testnet10).