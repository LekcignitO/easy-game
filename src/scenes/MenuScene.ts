import Phaser from 'phaser';
import { Localization } from '../services/Localization';
import { StorageService } from '../services/Storage';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Title
        this.add.text(width / 2, height * 0.2, 'TURKISH DELIGHTS', {
            fontSize: '32px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Best Score
        const bestScore = StorageService.getInstance().getBestScore();
        this.add.text(width / 2, height * 0.3, `${Localization.getText('Best score')}: ${bestScore}`, {
            fontSize: '24px',
            color: '#ffd700'
        }).setOrigin(0.5);

        // Play Button
         this.add.rectangle(width / 2, height * 0.5, 200, 60, 0x4CAF50)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('GameScene');
            });
        this.add.text(width / 2, height * 0.5, Localization.getText('Play'), {
            fontSize: '24px',
            color: '#fff'
        }).setOrigin(0.5);

        // Leaderboard Button
         this.add.rectangle(width / 2, height * 0.65, 200, 60, 0x2196F3)
            .setInteractive()
            .on('pointerdown', () => {
                // Leaderboard is automatically submitted, but could show a custom UI or call SDK method here
                console.log('Leaderboard button clicked');
            });
        this.add.text(width / 2, height * 0.65, Localization.getText('Leaderboard'), {
            fontSize: '20px',
            color: '#fff'
        }).setOrigin(0.5);

        // Language Switcher
        const langs = ['ru', 'en', 'tr'];
        let currentLangIdx = langs.indexOf(StorageService.getInstance().getLanguage());
        if (currentLangIdx === -1) currentLangIdx = 1;

        const langText = this.add.text(width * 0.2, height * 0.85, langs[currentLangIdx].toUpperCase(), {
            fontSize: '20px',
            color: '#fff'
        })
        .setInteractive()
        .on('pointerdown', async () => {
            currentLangIdx = (currentLangIdx + 1) % langs.length;
            await StorageService.getInstance().setLanguage(langs[currentLangIdx]);
            this.scene.restart();
        });
        langText.setOrigin(0.5);

        // Sound Toggle
        const isSoundEnabled = StorageService.getInstance().getSoundEnabled();
        const soundText = this.add.text(width * 0.8, height * 0.85, isSoundEnabled ? '🔊' : '🔇', {
            fontSize: '30px'
        })
        .setInteractive()
        .on('pointerdown', async () => {
            const newState = !StorageService.getInstance().getSoundEnabled();
            await StorageService.getInstance().setSoundEnabled(newState);
            this.sound.mute = !newState;
            soundText.setText(newState ? '🔊' : '🔇');
        });
        soundText.setOrigin(0.5);

        // Initial sync of phaser sound mute state
        this.sound.mute = !isSoundEnabled;
    }
}
