export const GRID_WIDTH = 8;
export const GRID_HEIGHT = 8;
export const CELL_TYPES = 5;

export interface Position {
    x: number;
    y: number;
}

export interface MatchResult {
    positions: Position[];
    score: number;
}

export class GridManager {
    public grid: number[][] = [];

    constructor() {
        this.initializeGrid();
    }

    public initializeGrid(): void {
        this.grid = [];
        for (let y = 0; y < GRID_HEIGHT; y++) {
            this.grid[y] = [];
            for (let x = 0; x < GRID_WIDTH; x++) {
                let type: number;
                do {
                    type = Math.floor(Math.random() * CELL_TYPES);
                } while (this.createsMatchOnSpawn(x, y, type));
                this.grid[y][x] = type;
            }
        }
    }

    private createsMatchOnSpawn(x: number, y: number, type: number): boolean {
        // Check left
        if (x >= 2 && this.grid[y][x - 1] === type && this.grid[y][x - 2] === type) {
            return true;
        }
        // Check up
        if (y >= 2 && this.grid[y - 1][x] === type && this.grid[y - 2][x] === type) {
            return true;
        }
        return false;
    }

    public swap(p1: Position, p2: Position): void {
        const temp = this.grid[p1.y][p1.x];
        this.grid[p1.y][p1.x] = this.grid[p2.y][p2.x];
        this.grid[p2.y][p2.x] = temp;
    }

    public getCell(x: number, y: number): number {
        return this.grid[y][x];
    }

    public setCell(x: number, y: number, type: number): void {
        this.grid[y][x] = type;
    }

    public checkMatches(): MatchResult {
        let matchedPositions: Position[] = [];
        let score = 0;

        // Check horizontal matches
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH - 2; x++) {
                const type = this.grid[y][x];
                if (type === -1) continue;

                let matchLength = 1;
                while (x + matchLength < GRID_WIDTH && this.grid[y][x + matchLength] === type) {
                    matchLength++;
                }

                if (matchLength >= 3) {
                    score += this.calculateScore(matchLength);
                    for (let i = 0; i < matchLength; i++) {
                        matchedPositions.push({ x: x + i, y });
                    }
                    x += matchLength - 1; // Skip the rest of the match
                }
            }
        }

        // Check vertical matches
        for (let x = 0; x < GRID_WIDTH; x++) {
            for (let y = 0; y < GRID_HEIGHT - 2; y++) {
                const type = this.grid[y][x];
                if (type === -1) continue;

                let matchLength = 1;
                while (y + matchLength < GRID_HEIGHT && this.grid[y + matchLength][x] === type) {
                    matchLength++;
                }

                if (matchLength >= 3) {
                    score += this.calculateScore(matchLength);
                    for (let i = 0; i < matchLength; i++) {
                        matchedPositions.push({ x, y: y + i });
                    }
                    y += matchLength - 1; // Skip the rest of the match
                }
            }
        }

        // Remove duplicates
        const uniqueMatches: Position[] = [];
        const seen = new Set<string>();
        for (const pos of matchedPositions) {
            const key = `${pos.x},${pos.y}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueMatches.push(pos);
            }
        }

        return { positions: uniqueMatches, score };
    }

    private calculateScore(matchLength: number): number {
        if (matchLength === 3) return 30;
        if (matchLength === 4) return 60;
        if (matchLength >= 5) return 120;
        return 0;
    }

    public removeMatches(positions: Position[]): void {
        for (const pos of positions) {
            this.grid[pos.y][pos.x] = -1;
        }
    }

    public applyGravity(): { falls: { from: Position, to: Position, type: number }[], newCells: { pos: Position, type: number }[] } {
        const falls: { from: Position, to: Position, type: number }[] = [];
        const newCells: { pos: Position, type: number }[] = [];

        for (let x = 0; x < GRID_WIDTH; x++) {
            let emptySpaces = 0;
            for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
                if (this.grid[y][x] === -1) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    // Move cell down
                    const targetY = y + emptySpaces;
                    this.grid[targetY][x] = this.grid[y][x];
                    this.grid[y][x] = -1;
                    falls.push({
                        from: { x, y },
                        to: { x, y: targetY },
                        type: this.grid[targetY][x]
                    });
                }
            }

            // Fill empty spaces at the top
            for (let i = 0; i < emptySpaces; i++) {
                const type = Math.floor(Math.random() * CELL_TYPES);
                const targetY = emptySpaces - 1 - i;
                this.grid[targetY][x] = type;
                newCells.push({
                    pos: { x, y: targetY },
                    type
                });
            }
        }

        return { falls, newCells };
    }

    public getPossibleSwaps(): { p1: Position, p2: Position }[] {
         const swaps: { p1: Position, p2: Position }[] = [];

         for (let y = 0; y < GRID_HEIGHT; y++) {
             for (let x = 0; x < GRID_WIDTH; x++) {
                 // Try swap right
                 if (x < GRID_WIDTH - 1) {
                     this.swap({x, y}, {x: x+1, y});
                     if (this.checkMatches().positions.length > 0) {
                         swaps.push({ p1: {x, y}, p2: {x: x+1, y} });
                     }
                     this.swap({x, y}, {x: x+1, y}); // swap back
                 }
                 // Try swap down
                 if (y < GRID_HEIGHT - 1) {
                     this.swap({x, y}, {x, y: y+1});
                     if (this.checkMatches().positions.length > 0) {
                         swaps.push({ p1: {x, y}, p2: {x, y: y+1} });
                     }
                     this.swap({x, y}, {x, y: y+1}); // swap back
                 }
             }
         }
         return swaps;
    }
}
