import Phaser from 'phaser';
import { YandexSDK } from '../services/YandexSDK';
import { StorageService } from '../services/Storage';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Here we could load game assets.
        // For now, we will draw geometric shapes in GameScene instead of loading images to keep it simple and asset-free.

        // Show loading text
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                color: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
    }

    async create() {
        try {
            await YandexSDK.getInstance().init();
            await StorageService.getInstance().load();
            this.scene.start('MenuScene');
        } catch (e) {
            console.error('Initialization error:', e);
            this.scene.start('MenuScene'); // Fallback to menu anyway
        }
    }
}
