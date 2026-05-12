import { YandexSDK } from './YandexSDK';

export class StorageService {
    private static instance: StorageService;

    private bestScore: number = 0;
    private language: string = 'en';
    private soundEnabled: boolean = true;

    private constructor() {}

    public static getInstance(): StorageService {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }

    public async load(): Promise<void> {
        let data: any = null;

        if (YandexSDK.getInstance().isInitialized) {
            data = await YandexSDK.getInstance().getPlayerData();
        }

        if (!data) {
            // Fallback to localStorage
            const localData = localStorage.getItem('match3_data');
            if (localData) {
                try {
                    data = JSON.parse(localData);
                } catch (e) {
                    console.error('Failed to parse localStorage data', e);
                }
            }
        }

        if (data) {
            if (data.bestScore !== undefined) this.bestScore = data.bestScore;
            if (data.language !== undefined) this.language = data.language;
            if (data.soundEnabled !== undefined) this.soundEnabled = data.soundEnabled;
        }
    }

    public async save(): Promise<void> {
        const data = {
            bestScore: this.bestScore,
            language: this.language,
            soundEnabled: this.soundEnabled
        };

        if (YandexSDK.getInstance().isInitialized) {
            await YandexSDK.getInstance().setPlayerData(data);
        }

        localStorage.setItem('match3_data', JSON.stringify(data));
    }

    public getBestScore(): number { return this.bestScore; }
    public async setBestScore(score: number): Promise<void> {
        if (score > this.bestScore) {
            this.bestScore = score;
            await this.save();
            await YandexSDK.getInstance().submitLeaderboardScore(this.bestScore);
        }
    }

    public getLanguage(): string { return this.language; }
    public async setLanguage(lang: string): Promise<void> {
        this.language = lang;
        await this.save();
    }

    public getSoundEnabled(): boolean { return this.soundEnabled; }
    public async setSoundEnabled(enabled: boolean): Promise<void> {
        this.soundEnabled = enabled;
        await this.save();
    }
}
