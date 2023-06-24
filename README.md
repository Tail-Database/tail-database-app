# Tail Database

This is a web3 app which connects to a Tail Database data store in DataLayer running on the Chia blockchain.

## Install

To install the app:

```bash
npm install
```

## How to run

The quickest way to run the app is to execute the following command.

```bash
npm run electron:dev
```

## How data is retrieved from DataLayer

The application is configured to use [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation) with a [Context Bridge](https://www.electronjs.org/docs/latest/api/context-bridge) to facilitate communication between the UI (Main world) and Node processes running in the back-end. This allows the UI to trigger RPC calls to a locally running full node securely without being able to access Electron internals.

The DataLayer RPC provided by the full node is used for creating, updating, and deleting data from DataLayer.

## Todo

The following needs to be implemented:

* UI should display discord/website/twitter URL
* Production build artifact for running in non-dev mode
