import { Dexie } from 'dexie';

export const db = new Dexie('TailDatabase');

db.version(1).stores({
    tails: "&hash,name,code,category"
});
