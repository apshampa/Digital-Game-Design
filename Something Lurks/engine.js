const ENGINE_CONSTANTS = {
    MAP_SIZE: 600,
    CELL_SIZE: 20,
    DRONE_MAX_SPEED: 1.5,
    DRONE_ACCEL: 0.15,
    DRONE_DRAG: 0.85,
    ANOMALY_SPEED: 0.60,
    HUNT_RADIUS: 180,
    PING_SPEED: 300,
    MAX_POWER: 1000,
    LURE_DRAIN: 5,
    BUMP_DRAIN: 7,
    PING_DRAIN: 10
};

class GameEngine {
    constructor() {
        this.drone = { x: 50, y: 50, radius: 5, vx: 0, vy: 0 };
        this.spawnPos = { x: 60, y: 60 };
        this.anomaly = { x: 550, y: 550, radius: 8, state: 'WANDERING', targetX: 550, targetY: 550 };
        this.power = ENGINE_CONSTANTS.MAX_POWER;

        this.walls = [];
        this.water = [];
        this.workers = [];
        this.gates = [];

        this.stats = { bumps: 0 };
        this.gameState = 'TITLE'; // TITLE, PLAYING, WIN, GAMEOVER
        this.lurePos = null;
        this.logMessage = null;
        this.onPowerUpdate = null;
        this.onStateChange = null;

        this.generateMap();
    }

    reset() {
        this.drone = { x: this.spawnPos.x, y: this.spawnPos.y, radius: 5, vx: 0, vy: 0 };
        this.anomaly = { x: 550, y: 550, radius: 8, state: 'WANDERING', targetX: 550, targetY: 550 };
        this.power = ENGINE_CONSTANTS.MAX_POWER;
        this.stats = { bumps: 0 };
        this.gameState = 'PLAYING';
        this.lurePos = null;
        if (window.AudioUtils) window.AudioUtils.stopLureSiren();
        if (this.onStateChange) this.onStateChange(this.gameState);
        this.generateMap();
        if (this.logMessage) this.logMessage('> SYSTEM RESET. NEW SECTOR LOADED.', 'sys');
        if (this.onPowerUpdate) this.onPowerUpdate(1.0);
    }

    setCallbacks(logCb, powerCb, stateCb) {
        this.logMessage = logCb;
        this.onPowerUpdate = powerCb;
        this.onStateChange = stateCb;
    }

    generateMap() {
        this.walls = [];
        this.water = [];
        this.gates = [];
        this.workers = [];

        // Pre-place entities to avoid walls
        this.drone.x = this.spawnPos.x; this.drone.y = this.spawnPos.y;

        let possibleAnomalyPos = [{ x: 540, y: 540 }, { x: 540, y: 60 }, { x: 60, y: 540 }];
        let startPos = possibleAnomalyPos[Math.floor(Math.random() * possibleAnomalyPos.length)];
        this.anomaly.x = startPos.x;
        this.anomaly.y = startPos.y;

        // Base structural walls
        this.walls.push({ x: 0, y: 0, w: 600, h: 20 });
        this.walls.push({ x: 0, y: 580, w: 600, h: 20 });
        this.walls.push({ x: 0, y: 0, w: 20, h: 600 });
        this.walls.push({ x: 580, y: 0, w: 20, h: 600 });

        const vertX = 280;
        const horizY = 280;

        this.walls.push({ x: vertX, y: horizY, w: 20, h: 20 });

        this.walls.push({ x: vertX, y: 20, w: 20, h: horizY - 60 });
        this.gates.push({ id: 'gate-alpha', x: vertX, y: horizY - 40, w: 20, h: 40, isDropped: false, hp: 180 });

        this.walls.push({ x: vertX, y: horizY + 20, w: 20, h: 100 });
        this.gates.push({ id: 'gate-beta', x: vertX, y: horizY + 120, w: 20, h: 40, isDropped: false, hp: 180 });
        this.walls.push({ x: vertX, y: horizY + 160, w: 20, h: 160 });

        this.walls.push({ x: 20, y: horizY, w: 100, h: 20 });
        this.gates.push({ id: 'gate-gamma', x: 120, y: horizY, w: 40, h: 20, isDropped: false, hp: 180 });
        this.walls.push({ x: 160, y: horizY, w: 120, h: 20 });

        this.walls.push({ x: vertX + 20, y: horizY, w: 260, h: 20 });

        // Place 2 workers
        const quadrants = [
            { x: 300, y: 0, w: 280, h: 280 }, // TR 
            { x: 0, y: 300, w: 280, h: 280 }  // BL
        ];

        for (let i = 0; i < 2; i++) {
            let quad = quadrants[i];
            let wx, wy;
            let collides = true;
            let attempts = 0;
            while(collides && attempts < 100) {
                attempts++;
                wx = Math.random() * (quad.w - 40) + quad.x + 20;
                wy = Math.random() * (quad.h - 40) + quad.y + 20;
                collides = false;
                let rect = { x: wx - 20, y: wy - 20, w: 40, h: 40 };
                for (let w of this.walls) if (this._rectIntersect(rect, w)) collides = true;
                if (this._distance(wx, wy, this.drone.x, this.drone.y) < 100) collides = true;
                for (let w of this.workers) if (this._distance(wx, wy, w.x, w.y) < 70) collides = true;
                if (this._distance(wx, wy, this.anomaly.x, this.anomaly.y) < 100) collides = true;
            }
            this.workers.push({ x: wx, y: wy, radius: 10, quadrantId: i + 1 });
        }

        // Scatter random walls cleanly avoiding entities
        const scatterWalls = (startX, startY, endX, endY, count) => {
            let placed = 0;
            let attempts = 0;
            while (placed < count && attempts < 150) {
                attempts++;
                let wx = Math.floor((Math.random() * (endX - startX - 40) + startX) / 20) * 20;
                let wy = Math.floor((Math.random() * (endY - startY - 40) + startY) / 20) * 20;
                let isHoriz = Math.random() > 0.5;
                let w = isHoriz ? Math.random() * 60 + 40 : 20;
                let h = isHoriz ? 20 : Math.random() * 60 + 40;

                // Expand rect by generous buffer
                let rect = { x: wx - 30, y: wy - 30, w: w + 60, h: h + 60 };
                let conflict = false;

                for (let gate of this.gates) if (this._rectIntersect(rect, gate)) conflict = true;
                
                let droneRect = { x: this.drone.x - 20, y: this.drone.y - 20, w: 40, h: 40 };
                if (this._rectIntersect(rect, droneRect)) conflict = true;
                
                let anomalyRect = { x: this.anomaly.x - 40, y: this.anomaly.y - 40, w: 80, h: 80 };
                if (this._rectIntersect(rect, anomalyRect)) conflict = true;
                
                for(let wrk of this.workers) {
                    let wrkRect = { x: wrk.x - 30, y: wrk.y - 30, w: 60, h: 60 };
                    if (this._rectIntersect(rect, wrkRect)) conflict = true;
                }

                if (!conflict) {
                    this.walls.push({ x: wx, y: wy, w: w, h: h });
                    placed++;
                }
            }
        };

        scatterWalls(20, 20, 280, 280, 4); // TL
        scatterWalls(300, 20, 580, 280, 4); // TR
        scatterWalls(20, 300, 280, 580, 4); // BL
        scatterWalls(300, 300, 580, 580, 4); // BR
    }

    toggleGate(gateId) {
        if (this.gameState === 'GAMEOVER') return { handled: false };
        const gate = this.gates.find(g => g.id === gateId);
        if (gate && !gate.isBroken) {
            gate.isDropped = !gate.isDropped;
            if (gate.isDropped) {
                if (window.AudioUtils) window.AudioUtils.playGateSlam();
                if (this.logMessage) this.logMessage(`> HYDRAULICS ENGAGED: ${gateId.toUpperCase()} SEALED.`, 'action');

            } else {
                if (window.AudioUtils) window.AudioUtils.playGateSlam();
                if (this.logMessage) this.logMessage(`> HYDRAULICS DISENGAGED: ${gateId.toUpperCase()} OPENED.`, 'action');
            }
            return { handled: true, isDropped: gate.isDropped };
        }
        return { handled: false };
    }

    update(keys) {
        if (this.gameState !== 'PLAYING') return;

        // Drone Movement (weighted)
        if (keys['w']) this.drone.vy -= ENGINE_CONSTANTS.DRONE_ACCEL;
        if (keys['s']) this.drone.vy += ENGINE_CONSTANTS.DRONE_ACCEL;
        if (keys['a']) this.drone.vx -= ENGINE_CONSTANTS.DRONE_ACCEL;
        if (keys['d']) this.drone.vx += ENGINE_CONSTANTS.DRONE_ACCEL;

        this.drone.vx *= ENGINE_CONSTANTS.DRONE_DRAG;
        this.drone.vy *= ENGINE_CONSTANTS.DRONE_DRAG;

        let movedX = Math.abs(this.drone.vx) > 0.1;
        let movedY = Math.abs(this.drone.vy) > 0.1;

        if (movedX || movedY) {
            this._moveDrone(this.drone.vx, this.drone.vy);
        }

        // Lure Logic
        if (this.lurePos) {
            this.power -= ENGINE_CONSTANTS.LURE_DRAIN;
        }

        // Anomaly Logic
        this._updateAnomaly();

        // Power bounds
        if (this.power <= 0 && this.gameState === 'PLAYING') {
            this.power = 0;
            this.gameState = 'GAMEOVER';
            if (this.onStateChange) this.onStateChange(this.gameState);
            if (this.logMessage) this.logMessage("> CRITICAL FAILURE: POWER DEPLETED", 'crit');
            if (window.AudioUtils) window.AudioUtils.playDamageThud();
        }

        if (this.onPowerUpdate) this.onPowerUpdate(this.power / ENGINE_CONSTANTS.MAX_POWER);
    }

    _moveDrone(dx, dy) {
        const newX = this.drone.x + dx;
        const newY = this.drone.y + dy;

        const rectX = { x: newX - this.drone.radius, y: this.drone.y - this.drone.radius, w: this.drone.radius * 2, h: this.drone.radius * 2 };
        const rectY = { x: this.drone.x - this.drone.radius, y: newY - this.drone.radius, w: this.drone.radius * 2, h: this.drone.radius * 2 };

        let collisionX = false;
        let collisionY = false;

        // Check X
        for (let wall of this.walls) if (this._rectIntersect(rectX, wall)) collisionX = true;
        for (let gate of this.gates) if (gate.isDropped && this._rectIntersect(rectX, gate)) collisionX = true;

        if (!collisionX) {
            this.drone.x = newX;
        } else {
            this.drone.vx = 0;
            this.power -= ENGINE_CONSTANTS.BUMP_DRAIN;
            if (Math.abs(dx) > 0.5) {
                this.stats.bumps++;
                if (this.logMessage) this.logMessage("> CHASSIS COLLISION DETECTED.", 'warn');
            }
        }

        // Check Y
        for (let wall of this.walls) if (this._rectIntersect(rectY, wall)) collisionY = true;
        for (let gate of this.gates) if (gate.isDropped && this._rectIntersect(rectY, gate)) collisionY = true;

        if (!collisionY) {
            this.drone.y = newY;
        } else {
            this.drone.vy = 0;
            if (!collisionX) {
                this.power -= ENGINE_CONSTANTS.BUMP_DRAIN; // prevent double drain
                if (Math.abs(dy) > 0.5) this.stats.bumps++;
            }
            if (Math.abs(dy) > 0.5 && this.logMessage) this.logMessage("> CHASSIS COLLISION DETECTED.", 'warn');
        }
    }

    _updateAnomaly() {
        const distToDrone = this._distance(this.anomaly.x, this.anomaly.y, this.drone.x, this.drone.y);

        if (distToDrone < this.drone.radius + this.anomaly.radius) {
            // GAMEOVER
            this.gameState = 'GAMEOVER';
            this.power = 0;
            if (window.AudioUtils) window.AudioUtils.playDamageThud();
            if (this.logMessage) this.logMessage("> SIGNAL LOST. DRONE DESTROYED.", 'crit');
            if (this.onStateChange) this.onStateChange(this.gameState);
            return;
        }

        // State Transitions
        if (this.lurePos) {
            this.anomaly.state = 'LURED';
            this.anomaly.targetX = this.lurePos.x;
            this.anomaly.targetY = this.lurePos.y;
        } else if (distToDrone < ENGINE_CONSTANTS.HUNT_RADIUS) {
            this.anomaly.state = 'HUNTING';
            this.anomaly.targetX = this.drone.x;
            this.anomaly.targetY = this.drone.y;
            if (Math.random() < 0.05 && window.AudioUtils) {
                const pan = (this.anomaly.x - this.drone.x) / ENGINE_CONSTANTS.HUNT_RADIUS;
                window.AudioUtils.playAnomalySquelch(pan);
            }
        } else {
            this.anomaly.state = 'WANDERING';
            if (Math.random() < 0.01 || this._distance(this.anomaly.x, this.anomaly.y, this.anomaly.targetX, this.anomaly.targetY) < 10) {
                this.anomaly.targetX = Math.random() * 500 + 50;
                this.anomaly.targetY = Math.random() * 500 + 50;
            }
        }

        let angle = Math.atan2(this.anomaly.targetY - this.anomaly.y, this.anomaly.targetX - this.anomaly.x);
        let moveX = Math.cos(angle) * ENGINE_CONSTANTS.ANOMALY_SPEED;
        let moveY = Math.sin(angle) * ENGINE_CONSTANTS.ANOMALY_SPEED;

        // X collision / slide check
        let newX = this.anomaly.x + moveX;
        let rectX = { x: newX - this.anomaly.radius, y: this.anomaly.y - this.anomaly.radius, w: this.anomaly.radius * 2, h: this.anomaly.radius * 2 };
        let collisionX = false;
        for (let wall of this.walls) if (this._rectIntersect(rectX, wall)) collisionX = true;
        for (let gate of this.gates) {
            if (gate.isDropped && this._rectIntersect(rectX, gate)) {
                collisionX = true;
                this._damageGate(gate);
            }
        }

        if (!collisionX) {
            this.anomaly.x = newX;
        }

        // Y collision / slide check
        let newY = this.anomaly.y + moveY;
        let rectY = { x: this.anomaly.x - this.anomaly.radius, y: newY - this.anomaly.radius, w: this.anomaly.radius * 2, h: this.anomaly.radius * 2 };
        let collisionY = false;
        for (let wall of this.walls) if (this._rectIntersect(rectY, wall)) collisionY = true;
        for (let gate of this.gates) {
            if (gate.isDropped && this._rectIntersect(rectY, gate)) {
                collisionY = true;
                this._damageGate(gate);
            }
        }

        if (!collisionY) {
            this.anomaly.y = newY;
        }

        // Only pick new random target if completely stuck during Wandering
        if (collisionX && collisionY && this.anomaly.state === 'WANDERING') {
            this.anomaly.targetX = Math.random() * 500 + 50;
            this.anomaly.targetY = Math.random() * 500 + 50;
        }
    }

    _damageGate(gate) {
        if (gate.isBroken) return;
        gate.hp -= 1;
        if (gate.hp <= 0) {
            gate.isDropped = false; 
            gate.isBroken = true;
            if (this.logMessage) this.logMessage(`> CRITICAL: ${gate.id.toUpperCase()} DESTROYED BY ANOMALY!`, 'crit');
            if (window.AudioUtils) window.AudioUtils.playDamageThud();
        } else if (gate.hp === 120 || gate.hp === 60) {
            if (this.logMessage) this.logMessage(`> WARNING: ${gate.id.toUpperCase()} TAKING HEAVY DAMAGE!`, 'warn');
        }
    }

    triggerPing() {
        if (this.gameState !== 'PLAYING' || this.power < ENGINE_CONSTANTS.PING_DRAIN) return false;
        this.power -= ENGINE_CONSTANTS.PING_DRAIN;

        const numRays = 32;
        let hits = { walls: [], water: [], workers: [], gates: [], anomaly: [] };

        for (let i = 0; i < numRays; i++) {
            const angle = (i / numRays) * Math.PI * 2;
            const res = this._castRay(this.drone.x, this.drone.y, angle);
            if (res) {
                if (res.type === 'wall' || res.type === 'gate') hits.walls.push(res);
                if (res.type === 'water') hits.water.push(res);
                if (res.type === 'worker') hits.workers.push(res);
                if (res.type === 'anomaly') hits.anomaly.push(res);
            }
        }

        const sortHits = (arr) => arr.sort((a, b) => a.dist - b.dist);

        if (window.AudioUtils) {
            sortHits(hits.walls).slice(0, 3).forEach(h => {
                window.AudioUtils.playWallEcho(h.dist / ENGINE_CONSTANTS.PING_SPEED, Math.cos(h.angle));
            });
            sortHits(hits.workers).slice(0, 1).forEach(h => {
                window.AudioUtils.playWorkerClink(h.dist / ENGINE_CONSTANTS.PING_SPEED, Math.cos(h.angle));
            });
            sortHits(hits.anomaly).slice(0, 1).forEach(h => {
                window.AudioUtils.playAnomalyPing(h.dist / ENGINE_CONSTANTS.PING_SPEED, Math.cos(h.angle));
            });
        }

        if (this.logMessage) this.logMessage("> ECHOLOCATION PING TRANSMITTED.", 'sys');
        return true;
    }

    _castRay(x, y, angle) {
        let step = 5;
        let maxDist = 300;
        let cx = x; let cy = y;

        for (let d = 0; d < maxDist; d += step) {
            cx += Math.cos(angle) * step;
            cy += Math.sin(angle) * step;
            const point = { x: cx, y: cy, w: 1, h: 1 };

            if (this._distance(cx, cy, this.anomaly.x, this.anomaly.y) < this.anomaly.radius + 5) {
                return { type: 'anomaly', dist: d, angle: angle };
            }

            for (let w of this.walls) {
                if (this._rectIntersect(point, w)) return { type: 'wall', dist: d, angle: angle };
            }
            for (let g of this.gates) {
                if (g.isDropped && this._rectIntersect(point, g)) return { type: 'gate', dist: d, angle: angle };
            }
            for (let wrk of this.workers) {
                if (this._distance(cx, cy, wrk.x, wrk.y) < wrk.radius) return { type: 'worker', dist: d, angle: angle };
            }
        }
        return null;
    }

    checkWinState() {
        // Obsolete, handled in main loop now
    }

    _rectIntersect(a, b) {
        return (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
    }

    _distance(x1, y1, x2, y2) { return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); }
}

window.GameEngine = GameEngine;
