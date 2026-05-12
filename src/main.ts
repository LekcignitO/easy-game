import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'app',
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#2b2b2b',
    scene: [BootScene, MenuScene, GameScene, UIScene]
};

window.addEventListener('resize', () => {
    if (game.scale) {
        game.scale.resize(window.innerWidth, window.innerHeight);
    }
});

const game = new Phaser.Game(config);
