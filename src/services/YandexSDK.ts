declare var YaGames: any;

export class YandexSDK {
    private static instance: YandexSDK;
    private ys: any = null;
    private player: any = null;
    private leaderboard: any = null;
    public isInitialized: boolean = false;

    private constructor() {}

    public static getInstance(): YandexSDK {
        if (!YandexSDK.instance) {
            YandexSDK.instance = new YandexSDK();
        }
        return YandexSDK.instance;
    }

    public async init(): Promise<void> {
        try {
            if (typeof YaGames !== 'undefined') {
                this.ys = await YaGames.init();
                this.isInitialized = true;
                console.log('Yandex SDK initialized');

                try {
                    this.player = await this.ys.getPlayer({ scopes: false });
                } catch (e) {
                    console.log('Player init failed', e);
                }

                try {
                    this.leaderboard = await this.ys.getLeaderboards();
                } catch (e) {
                    console.log('Leaderboard init failed', e);
                }
            } else {
                console.log('YaGames not found, using mock SDK');
            }
        } catch (error) {
            console.error('Yandex SDK init error:', error);
        }
    }

    public showInterstitial(onOpen?: () => void, onClose?: () => void): void {
        if (this.ys) {
            this.ys.adv.showFullscreenAdv({
                callbacks: {
                    onOpen: () => {
                        console.log('Interstitial opened');
                        if (onOpen) onOpen();
                    },
                    onClose: (wasShown: boolean) => {
                        console.log('Interstitial closed', wasShown);
                        if (onClose) onClose();
                    },
                    onError: (error: any) => {
                        console.error('Interstitial error', error);
                        if (onClose) onClose();
                    }
                }
            });
        } else {
            console.log('Mock Interstitial shown');
            if (onOpen) onOpen();
            setTimeout(() => {
                if (onClose) onClose();
            }, 1000);
        }
    }

    public showRewarded(onOpen?: () => void, onRewarded?: () => void, onClose?: () => void): void {
        if (this.ys) {
            this.ys.adv.showRewardedVideo({
                callbacks: {
                    onOpen: () => {
                        console.log('Rewarded opened');
                        if (onOpen) onOpen();
                    },
                    onRewarded: () => {
                        console.log('Rewarded success');
                        if (onRewarded) onRewarded();
                    },
                    onClose: () => {
                        console.log('Rewarded closed');
                        if (onClose) onClose();
                    },
                    onError: (error: any) => {
                        console.error('Rewarded error', error);
                        if (onClose) onClose();
                    }
                }
            });
        } else {
            console.log('Mock Rewarded shown');
            if (onOpen) onOpen();
            setTimeout(() => {
                if (onRewarded) onRewarded();
                if (onClose) onClose();
            }, 1000);
        }
    }

    public async submitLeaderboardScore(score: number): Promise<void> {
        if (this.leaderboard) {
            try {
                await this.leaderboard.setLeaderboardScore('best_score', score);
                console.log('Score submitted:', score);
            } catch (e) {
                console.error('Failed to submit score:', e);
            }
        } else {
            console.log('Mock submit score:', score);
        }
    }

    public async getPlayerData(): Promise<any> {
        if (this.player) {
            try {
                return await this.player.getData();
            } catch (e) {
                console.error('Failed to get player data', e);
            }
        }
        return null;
    }

    public async setPlayerData(data: any): Promise<void> {
        if (this.player) {
            try {
                await this.player.setData(data);
            } catch (e) {
                console.error('Failed to set player data', e);
            }
        }
    }
}
