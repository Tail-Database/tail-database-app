export interface TailRecord {
    hash: string;
    name: string;
    code: string;
    category: string;
    description: string;
    launcherId: string;
    eveCoinId: string;
    website_url?: string;
    discord_url?: string;
    twitter_url?: string;
}

export const tailRecord = (data: any): data is TailRecord => {
    for (const check of ['hash', 'name', 'code', 'category', 'description'] as const) {
        if (typeof data[check] !== 'string') {
            return false;
        }
    }

    return true;
};
