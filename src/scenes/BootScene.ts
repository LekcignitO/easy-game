import Phaser from 'phaser';
import { YandexSDK } from '../services/YandexSDK';
import { StorageService } from '../services/Storage';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
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

        // Load assets
        this.load.image('bg', 'assets/bg.svg');
        this.load.image('type_0', 'assets/lokum_pink.svg');
        this.load.image('type_1', 'assets/baklava.svg');
        this.load.image('type_2', 'assets/lokum_green.svg');
        this.load.image('type_3', 'assets/tulumba.svg');
        this.load.image('type_4', 'assets/kunefe.svg');
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
