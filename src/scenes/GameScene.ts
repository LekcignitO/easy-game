import Phaser from 'phaser';
import { GridManager, GRID_WIDTH, GRID_HEIGHT, type Position } from '../logic/GridManager';
import { StorageService } from '../services/Storage';

const COLORS = [0xFF5733, 0x33FF57, 0x3357FF, 0xF3FF33, 0xFF33F3];
const SHAPES = ['circle', 'rect', 'diamond', 'star', 'hex']; // For representation

export class GameScene extends Phaser.Scene {
    private gridManager!: GridManager;
    private cellSize: number = 0;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private cells: (Phaser.GameObjects.Graphics | null)[][] = [];

    private selectedCell: Position | null = null;
    private isAnimating: boolean = false;

    private audioCtx: AudioContext | null = null;

    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        this.gridManager = new GridManager();
        this.cells = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Calculate cell size and offsets to center the grid
        this.cellSize = Math.floor(Math.min(width * 0.9 / GRID_WIDTH, height * 0.7 / GRID_HEIGHT));
        this.offsetX = (width - this.cellSize * GRID_WIDTH) / 2;
        this.offsetY = (height * 0.8 - this.cellSize * GRID_HEIGHT) / 2 + height * 0.1;

        // Background grid
        const bg = this.add.graphics();
        bg.lineStyle(2, 0x444444);
        for (let y = 0; y <= GRID_HEIGHT; y++) {
            bg.moveTo(this.offsetX, this.offsetY + y * this.cellSize);
            bg.lineTo(this.offsetX + GRID_WIDTH * this.cellSize, this.offsetY + y * this.cellSize);
        }
        for (let x = 0; x <= GRID_WIDTH; x++) {
            bg.moveTo(this.offsetX + x * this.cellSize, this.offsetY);
            bg.lineTo(this.offsetX + x * this.cellSize, this.offsetY + GRID_HEIGHT * this.cellSize);
        }
        bg.strokePath();

        this.drawInitialGrid();

        this.input.on('pointerdown', this.onPointerDown, this);

        // Init simple audio
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        } catch (e) {
            console.error('WebAudio not supported');
        }

        // Launch UI Scene
        this.scene.launch('UIScene', { gameScene: this });
    }

    private playSound(type: 'swap' | 'merge') {
        if (!StorageService.getInstance().getSoundEnabled() || this.sound.mute || !this.audioCtx) return;

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        if (type === 'swap') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, this.audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.1);
        } else if (type === 'merge') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, this.audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.15);
        }
    }

    private drawInitialGrid() {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const type = this.gridManager.getCell(x, y);
                this.createCellVisual(x, y, type);
            }
        }
    }

    private createCellVisual(x: number, y: number, type: number) {
        if (this.cells[y][x]) {
            this.cells[y][x]?.destroy();
        }

        const graphics = this.add.graphics();
        const cx = this.offsetX + x * this.cellSize + this.cellSize / 2;
        const cy = this.offsetY + y * this.cellSize + this.cellSize / 2;
        const size = this.cellSize * 0.8;
        const color = COLORS[type];

        graphics.fillStyle(color, 1);

        switch (SHAPES[type]) {
            case 'circle':
                graphics.fillCircle(0, 0, size / 2);
                break;
            case 'rect':
                graphics.fillRect(-size / 2, -size / 2, size, size);
                break;
            case 'diamond':
                graphics.beginPath();
                graphics.moveTo(0, -size / 2);
                graphics.lineTo(size / 2, 0);
                graphics.lineTo(0, size / 2);
                graphics.lineTo(-size / 2, 0);
                graphics.closePath();
                graphics.fillPath();
                break;
            case 'star': // Approximation
                graphics.fillCircle(0, 0, size/2);
                break;
            case 'hex':
                graphics.fillCircle(0, 0, size/2);
                break;
        }

        graphics.setPosition(cx, cy);

        // Add a transparent interactive zone
        const zone = this.add.zone(cx, cy, this.cellSize, this.cellSize).setInteractive();
        zone.on('pointerdown', () => {
            if (!this.isAnimating) {
                this.handleCellClick(x, y);
            }
        });

        // Store zone reference in graphics to clean up later
        (graphics as any).zone = zone;

        this.cells[y][x] = graphics;
    }

    private handleCellClick(x: number, y: number) {
        if (this.isAnimating) return;

        if (!this.selectedCell) {
            this.selectedCell = { x, y };
            // Highlight selected
            const g = this.cells[y][x];
            if (g) {
                this.tweens.add({
                    targets: g,
                    scale: 1.2,
                    duration: 100,
                    yoyo: true,
                    repeat: -1
                });
            }
        } else {
            const dx = Math.abs(this.selectedCell.x - x);
            const dy = Math.abs(this.selectedCell.y - y);

            // Stop highlighting
            const gSelected = this.cells[this.selectedCell.y][this.selectedCell.x];
            if (gSelected) {
                this.tweens.killTweensOf(gSelected);
                gSelected.setScale(1);
            }

            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                // Adjacent cells, swap
                this.swapCells(this.selectedCell, { x, y });
            }
            this.selectedCell = null;
        }
    }

    private onPointerDown(_pointer: Phaser.Input.Pointer) {
        // Handle dragging/swipe logic if pointer started on a cell
        // For simplicity, click-to-swap is fully implemented in handleCellClick.
        // A swipe can just be simulated if they down-click one cell and up-click another nearby.
    }

    private async swapCells(p1: Position, p2: Position) {
        this.isAnimating = true;
        this.playSound('swap');

        const g1 = this.cells[p1.y][p1.x]!;
        const g2 = this.cells[p2.y][p2.x]!;

        const pos1 = { x: g1.x, y: g1.y };
        const pos2 = { x: g2.x, y: g2.y };

        // Swap logical
        this.gridManager.swap(p1, p2);

        // Swap visual array
        this.cells[p1.y][p1.x] = g2;
        this.cells[p2.y][p2.x] = g1;

        // Swap visual positions
        await new Promise<void>(resolve => {
            this.tweens.add({
                targets: g1,
                x: pos2.x,
                y: pos2.y,
                duration: 200
            });
            this.tweens.add({
                targets: g2,
                x: pos1.x,
                y: pos1.y,
                duration: 200,
                onComplete: () => resolve()
            });
        });

        const matchResult = this.gridManager.checkMatches();

        if (matchResult.positions.length > 0) {
            await this.processMatches(matchResult.positions, matchResult.score, 1);
        } else {
            // Swap back
            this.gridManager.swap(p1, p2);
            this.cells[p1.y][p1.x] = g1;
            this.cells[p2.y][p2.x] = g2;

            await new Promise<void>(resolve => {
                this.tweens.add({
                    targets: g1,
                    x: pos1.x,
                    y: pos1.y,
                    duration: 200
                });
                this.tweens.add({
                    targets: g2,
                    x: pos2.x,
                    y: pos2.y,
                    duration: 200,
                    onComplete: () => resolve()
                });
            });
            this.isAnimating = false;
        }
    }

    private async processMatches(positions: Position[], baseScore: number, comboMultiplier: number) {
        this.playSound('merge');

        const finalScore = Math.floor(baseScore * comboMultiplier);

        // Notify UIScene to update score
        this.events.emit('addScore', finalScore);

        this.gridManager.removeMatches(positions);

        // Animate removal
        await new Promise<void>(resolve => {
            let removedCount = 0;
            positions.forEach(pos => {
                const g = this.cells[pos.y][pos.x];
                if (g) {
                    if ((g as any).zone) (g as any).zone.destroy();
                    this.tweens.add({
                        targets: g,
                        scale: 0,
                        alpha: 0,
                        duration: 200,
                        onComplete: () => {
                            g.destroy();
                            removedCount++;
                            if (removedCount === positions.length) resolve();
                        }
                    });
                    this.cells[pos.y][pos.x] = null;
                } else {
                    removedCount++;
                    if (removedCount === positions.length) resolve();
                }
            });
            if (positions.length === 0) resolve();
        });

        const gravityResult = this.gridManager.applyGravity();

        // Animate falls
        const fallPromises: Promise<void>[] = [];

        gravityResult.falls.forEach(fall => {
            const g = this.cells[fall.from.y][fall.from.x]!;
            this.cells[fall.to.y][fall.to.x] = g;
            this.cells[fall.from.y][fall.from.x] = null;

            const newCy = this.offsetY + fall.to.y * this.cellSize + this.cellSize / 2;

            fallPromises.push(new Promise<void>(res => {
                this.tweens.add({
                    targets: g,
                    y: newCy,
                    duration: 300,
                    ease: 'Bounce.easeOut',
                    onComplete: () => {
                        // Update zone position
                        if ((g as any).zone) {
                            (g as any).zone.setPosition(g.x, g.y);
                        }
                        res();
                    }
                });
            }));
        });

        // Create new cells falling from top
        gravityResult.newCells.forEach(newCell => {
            const cx = this.offsetX + newCell.pos.x * this.cellSize + this.cellSize / 2;
            const cy = this.offsetY + newCell.pos.y * this.cellSize + this.cellSize / 2;
            const startY = this.offsetY - this.cellSize;

            const graphics = this.add.graphics();
            const size = this.cellSize * 0.8;
            const color = COLORS[newCell.type];

            graphics.fillStyle(color, 1);
            switch (SHAPES[newCell.type]) {
                case 'circle': graphics.fillCircle(0, 0, size / 2); break;
                case 'rect': graphics.fillRect(-size / 2, -size / 2, size, size); break;
                case 'diamond':
                    graphics.beginPath();
                    graphics.moveTo(0, -size / 2);
                    graphics.lineTo(size / 2, 0);
                    graphics.lineTo(0, size / 2);
                    graphics.lineTo(-size / 2, 0);
                    graphics.closePath();
                    graphics.fillPath();
                    break;
                case 'star': graphics.fillCircle(0, 0, size/2); break;
                case 'hex': graphics.fillCircle(0, 0, size/2); break;
            }

            graphics.setPosition(cx, startY);

            const zone = this.add.zone(cx, cy, this.cellSize, this.cellSize).setInteractive();
            zone.on('pointerdown', () => {
                if (!this.isAnimating) this.handleCellClick(newCell.pos.x, newCell.pos.y);
            });
            (graphics as any).zone = zone;

            this.cells[newCell.pos.y][newCell.pos.x] = graphics;

            fallPromises.push(new Promise<void>(res => {
                this.tweens.add({
                    targets: graphics,
                    y: cy,
                    duration: 400,
                    ease: 'Bounce.easeOut',
                    onComplete: () => {
                        res();
                    }
                });
            }));
        });

        if (fallPromises.length > 0) {
            await Promise.all(fallPromises);
        }

        // Check for cascades
        const cascadeMatch = this.gridManager.checkMatches();
        if (cascadeMatch.positions.length > 0) {
            await this.processMatches(cascadeMatch.positions, cascadeMatch.score, comboMultiplier + 0.5);
        } else {
            // Check if possible moves exist
            const possibleSwaps = this.gridManager.getPossibleSwaps();
            if (possibleSwaps.length === 0) {
                // Board shuffle or reset needed (simplification: reinit board)
                console.log("No moves left, reshuffling");
                this.gridManager.initializeGrid();
                this.cells.forEach(row => row.forEach(c => {
                    if (c) {
                        if ((c as any).zone) (c as any).zone.destroy();
                        c.destroy();
                    }
                }));
                this.drawInitialGrid();
            }

            this.isAnimating = false;
        }
    }
}
