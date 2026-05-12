import Phaser from 'phaser';
import { Localization } from '../services/Localization';
import { StorageService } from '../services/Storage';
import { YandexSDK } from '../services/YandexSDK';

export class UIScene extends Phaser.Scene {
    private score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private timerText!: Phaser.GameObjects.Text;
    private timeLeft: number = 60;
    private timerEvent!: Phaser.Time.TimerEvent;
    private rewardedUsed: boolean = false;
    private gameScene!: Phaser.Scene;

    constructor() {
        super({ key: 'UIScene' });
    }

    create(data: any) {
        this.gameScene = data.gameScene;
        this.score = 0;
        this.timeLeft = 60;
        this.rewardedUsed = false;

        const width = this.cameras.main.width;

        this.scoreText = this.add.text(10, 10, `${Localization.getText('Score')}: 0`, {
            fontSize: '24px',
            color: '#ffffff'
        });

        this.timerText = this.add.text(width - 10, 10, `${Localization.getText('Time')}: ${this.timeLeft}`, {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(1, 0);

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Listen for score updates from GameScene
        this.gameScene.events.on('addScore', (points: number) => {
            this.score += points;
            this.scoreText.setText(`${Localization.getText('Score')}: ${this.score}`);
        });
    }

    private updateTimer() {
        this.timeLeft--;
        this.timerText.setText(`${Localization.getText('Time')}: ${this.timeLeft}`);

        if (this.timeLeft <= 0) {
            this.timerEvent.remove();
            this.showGameOver();
        }
    }

    private async showGameOver() {
        this.gameScene.scene.pause();

        await StorageService.getInstance().setBestScore(this.score);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

        const goText = this.add.text(width / 2, height * 0.3, Localization.getText('Game over'), {
            fontSize: '40px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const scoreText = this.add.text(width / 2, height * 0.4, `${Localization.getText('Score')}: ${this.score}`, {
            fontSize: '30px',
            color: '#ffffff'
        }).setOrigin(0.5);

        let adBtn: Phaser.GameObjects.Container | null = null;

        if (!this.rewardedUsed) {
            const adBg = this.add.rectangle(0, 0, 250, 50, 0xFF9800);
            const adText = this.add.text(0, 0, Localization.getText('Watch Ad for +15s'), {
                fontSize: '18px',
                color: '#fff'
            }).setOrigin(0.5);

            adBtn = this.add.container(width / 2, height * 0.55, [adBg, adText]);
            adBg.setInteractive().on('pointerdown', () => {
                // Mute game
                const previousMute = this.sound.mute;
                this.sound.mute = true;

                YandexSDK.getInstance().showRewarded(
                    () => console.log('Ad opened'),
                    () => {
                        // Rewarded
                        this.rewardedUsed = true;
                        this.timeLeft += 15;
                    },
                    () => {
                        // Closed
                        this.sound.mute = previousMute;
                        if (this.rewardedUsed && this.timeLeft > 0) {
                            // Resume game
                            overlay.destroy();
                            goText.destroy();
                            scoreText.destroy();
                            adBtn?.destroy();
                            menuBtn.destroy();

                            this.timerText.setText(`${Localization.getText('Time')}: ${this.timeLeft}`);
                            this.timerEvent = this.time.addEvent({
                                delay: 1000,
                                callback: this.updateTimer,
                                callbackScope: this,
                                loop: true
                            });
                            this.gameScene.scene.resume();
                        }
                    }
                );
            });
        }

        const menuBg = this.add.rectangle(0, 0, 200, 50, 0x2196F3);
        const menuText = this.add.text(0, 0, Localization.getText('Leaderboard'), {
            fontSize: '18px',
            color: '#fff'
        }).setOrigin(0.5); // Using leaderboard text here as requested or "Main Menu"
        menuText.setText("Main Menu");

        const menuBtn = this.add.container(width / 2, height * 0.7, [menuBg, menuText]);
        menuBg.setInteractive().on('pointerdown', () => {
            const previousMute = this.sound.mute;
            this.sound.mute = true;

            YandexSDK.getInstance().showInterstitial(
                undefined,
                () => {
                    this.sound.mute = previousMute;
                    this.gameScene.scene.stop();
                    this.scene.start('MenuScene');
                }
            );
        });
    }
}
