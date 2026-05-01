document.addEventListener('DOMContentLoaded', () => {
    const engine = new window.GameEngine();

    // UI Elements
    const terminalLog = document.getElementById('terminal-log');
    const batteryLevel = document.getElementById('battery-level');
    const powerPercentage = document.getElementById('power-percentage');
    const sonarCooldownFill = document.getElementById('sonar-cooldown-fill');
    const sonarStatusText = document.getElementById('sonar-status-text');
    const engineDebugCanvas = document.getElementById('engine-debug');
    const cartographyCanvas = document.getElementById('cartography-board');

    const ctxDebug = engineDebugCanvas.getContext('2d');
    const ctxCartmap = cartographyCanvas.getContext('2d');

    // Engine Hooks
    engine.setCallbacks(
        (msg, type) => {
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.textContent = msg;
            terminalLog.appendChild(entry);
            terminalLog.scrollTop = terminalLog.scrollHeight;
        },
        (percentage) => {
            const p = Math.max(0, percentage * 100);
            batteryLevel.style.width = `${p}%`;
            powerPercentage.textContent = `${p.toFixed(1)}%`;
            if (p < 20) batteryLevel.className = 'battery-fill critical';
            else if (p < 50) batteryLevel.className = 'battery-fill low';
            else batteryLevel.className = 'battery-fill';
        },
        (state) => {
            if (state === 'GAMEOVER' || state === 'WIN') {
                let workersTagged = 0;
                engine.workers.forEach(w => {
                    let tagged = false;
                    pins.filter(p => p.type === 'worker').forEach(p => {
                        if (engine._distance(w.x, w.y, p.x, p.y) < 40) tagged = true;
                    });
                    if (tagged) workersTagged++;
                });

                if (state === 'GAMEOVER') {
                    document.getElementById('stat-lose-bumps').textContent = `CHASSIS COLLISIONS: ${engine.stats.bumps}`;
                    document.getElementById('stat-lose-workers').textContent = `CREW LOCATED: ${workersTagged} / ${engine.workers.length}`;
                    document.getElementById('game-over-screen').classList.remove('hidden');
                } else if (state === 'WIN') {
                    document.getElementById('stat-win-bumps').textContent = `CHASSIS COLLISIONS: ${engine.stats.bumps}`;
                    document.getElementById('stat-win-workers').textContent = `CREW LOCATED: ${workersTagged} / ${engine.workers.length}`;
                    document.getElementById('game-win-screen').classList.remove('hidden');
                }
            } else {
                document.getElementById('game-over-screen').classList.add('hidden');
                document.getElementById('game-win-screen').classList.add('hidden');
            }
        }
    );

    // Input State
    const keys = {};
    document.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        keys[k] = true;
        // Audio API needs user interaction to un-suspend
        window.AudioUtils.resume();

        if (engine.gameState === 'TITLE' && e.key === 'Enter') {
            engine.gameState = 'PLAYING';
            document.getElementById('title-screen').classList.add('hidden');
            engine.logMessage('> UPLINK ESTABLISHED. DRONE DEPLOYED.', 'sys');
        }

        if (k === ' ') {
            e.preventDefault();
            triggerSonar();
        }

        if (k === 'r') {
            e.preventDefault();
            engine.reset();
            pins = [];
            drawCartography();
            // Re-hide overlays
            document.getElementById('game-over-screen').classList.add('hidden');
            document.getElementById('game-win-screen').classList.add('hidden');
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    // Sonar Logic
    let isSonarReady = true;
    function triggerSonar() {
        if (!isSonarReady) return;

        if (engine.triggerPing()) {
            isSonarReady = false;

            // Show debug map for 3 seconds
            engineDebugCanvas.classList.add('active');
            setTimeout(() => {
                engineDebugCanvas.classList.remove('active');
            }, 3000);

            // 3.5 seconds cooldown
            sonarStatusText.textContent = "RECHARGING";
            sonarStatusText.style.color = "var(--alert-yellow)";

            let cooldownTime = 3500;
            let elapsed = 0;
            sonarCooldownFill.style.transition = 'none';
            sonarCooldownFill.style.width = '100%';

            // Re-enable transition for smooth drop
            setTimeout(() => {
                sonarCooldownFill.style.transition = 'width 3.5s linear';
                sonarCooldownFill.style.width = '0%';
            }, 50);

            setTimeout(() => {
                isSonarReady = true;
                sonarStatusText.textContent = "SONAR READY";
                sonarStatusText.style.color = "var(--neon-green)";
            }, cooldownTime);
        }
    }

    // Buttons previously used here for gates removed

    // Cartography Tools
    let currentTool = 'select';
    let pins = [];

    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active-tool'));
            btn.classList.add('active-tool');
            currentTool = btn.getAttribute('data-tool');
        });
    });

    cartographyCanvas.addEventListener('mousedown', (e) => {
        const rect = cartographyCanvas.getBoundingClientRect();
        const scaleX = cartographyCanvas.width / rect.width;
        const scaleY = cartographyCanvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        let clickedGate = null;
        engine.gates.forEach(g => {
            if (x >= g.x - 10 && x <= g.x + g.w + 10 && y >= g.y - 10 && y <= g.y + g.h + 10) {
                clickedGate = g;
            }
        });

        if (clickedGate && !clickedGate.isBroken) {
            window.AudioUtils.resume();
            engine.toggleGate(clickedGate.id);
            drawCartography();
            return;
        }

        if (currentTool === 'erase') {
            pins = pins.filter(p => engine._distance(p.x, p.y, x, y) > 15);
        } else if (currentTool !== 'select') {
            const typePins = pins.filter(p => p.type === currentTool);
            if (typePins.length >= 3) {
                const indexToRemove = pins.findIndex(p => p.type === currentTool);
                if (indexToRemove !== -1) pins.splice(indexToRemove, 1);
            }
            pins.push({ x, y, type: currentTool });
        }
        drawCartography();
    });

    function drawCartography() {
        ctxCartmap.clearRect(0, 0, cartographyCanvas.width, cartographyCanvas.height);
        
        ctxCartmap.fillStyle = 'rgba(0, 100, 255, 0.3)';
        ctxCartmap.fillRect(engine.spawnPos.x - 15, engine.spawnPos.y - 15, 30, 30);
        ctxCartmap.strokeStyle = '#00aaff';
        ctxCartmap.strokeRect(engine.spawnPos.x - 15, engine.spawnPos.y - 15, 30, 30);

        engine.gates.forEach(g => {
            if (g.isBroken) {
                ctxCartmap.strokeStyle = 'purple';
                ctxCartmap.setLineDash([2, 5]);
            } else {
                ctxCartmap.strokeStyle = g.isDropped ? 'red' : 'rgba(100, 100, 100, 0.5)';
                ctxCartmap.setLineDash([]);
            }
            ctxCartmap.strokeRect(g.x, g.y, g.w, g.h);
        });
        ctxCartmap.setLineDash([]);

        ctxCartmap.font = '16px monospace';
        ctxCartmap.textAlign = 'center';
        ctxCartmap.textBaseline = 'middle';

        pins.forEach(p => {
            if (p.type === 'wall') { ctxCartmap.fillStyle = 'red'; ctxCartmap.fillText('X', p.x, p.y); }
            if (p.type === 'worker') { ctxCartmap.fillStyle = '#39ff14'; ctxCartmap.fillText('●', p.x, p.y); }
            if (p.type === 'anomaly') { ctxCartmap.fillStyle = 'yellow'; ctxCartmap.fillText('⚠️', p.x, p.y); }
        });
    }

    // Engine loop rendering
    function renderDebug() {
        ctxDebug.clearRect(0, 0, engineDebugCanvas.width, engineDebugCanvas.height);

        ctxDebug.save();
        ctxDebug.beginPath();
        ctxDebug.arc(engine.drone.x, engine.drone.y, 100, 0, Math.PI * 2);
        ctxDebug.clip();

        // Draw Map Background
        ctxDebug.fillStyle = '#050505';
        ctxDebug.fillRect(0, 0, engineDebugCanvas.width, engineDebugCanvas.height);

        // Draw Walls
        ctxDebug.fillStyle = 'rgba(255, 0, 0, 0.5)';
        engine.walls.forEach(w => ctxDebug.fillRect(w.x, w.y, w.w, w.h));

        // Draw Water
        ctxDebug.fillStyle = 'rgba(0, 100, 255, 0.3)';
        engine.water.forEach(w => ctxDebug.fillRect(w.x, w.y, w.w, w.h));

        // Draw Workers
        ctxDebug.fillStyle = 'rgba(0, 255, 0, 0.5)';
        engine.workers.forEach(w => {
            ctxDebug.beginPath();
            ctxDebug.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
            ctxDebug.fill();
        });

        // Draw Gates
        engine.gates.forEach(g => {
            ctxDebug.fillStyle = g.isDropped ? 'rgba(255, 255, 0, 0.8)' : 'rgba(100, 100, 100, 0.3)';
            ctxDebug.fillRect(g.x, g.y, g.w, g.h);
        });

        // Draw Drone
        ctxDebug.fillStyle = '#fff';
        ctxDebug.beginPath();
        ctxDebug.arc(engine.drone.x, engine.drone.y, engine.drone.radius, 0, Math.PI * 2);
        ctxDebug.fill();

        // Draw Anomaly
        ctxDebug.fillStyle = 'purple';
        ctxDebug.beginPath();
        ctxDebug.arc(engine.anomaly.x, engine.anomaly.y, engine.anomaly.radius, 0, Math.PI * 2);
        ctxDebug.fill();

        ctxDebug.restore(); // Remove clipping mask
    }

    // Main Game Loop
    function gameLoop() {
        engine.update(keys);
        
        if (engine.gameState === 'PLAYING') {
            let workersTagged = 0;
            let minDistToUnsecured = Infinity;

            engine.workers.forEach(w => {
                let tagged = false;
                pins.filter(p => p.type === 'worker').forEach(p => {
                    if (engine._distance(w.x, w.y, p.x, p.y) < 40) tagged = true;
                });
                
                if (tagged) {
                    if (!w.previouslySecured) {
                        w.previouslySecured = true;
                        if (window.AudioUtils) window.AudioUtils.playWorkerSecured();
                        engine.logMessage(`> CREW SIGNAL LOCKED`, 'action');
                    }
                    workersTagged++;
                } else {
                    let dist = engine._distance(engine.drone.x, engine.drone.y, w.x, w.y);
                    if (dist < minDistToUnsecured) minDistToUnsecured = dist;
                }
            });

            let crewStatusEl = document.getElementById('crew-status');
            if (crewStatusEl) {
                crewStatusEl.textContent = `${workersTagged} / ${engine.workers.length}`;
                crewStatusEl.style.color = workersTagged === engine.workers.length ? "var(--neon-green)" : "var(--alert-red)";
            }

            if (window.AudioUtils) {
                window.AudioUtils.updateHeartbeat(minDistToUnsecured);
            }

            const isAtSpawn = engine._distance(engine.drone.x, engine.drone.y, engine.spawnPos.x, engine.spawnPos.y) < 30;

            if (workersTagged === engine.workers.length && isAtSpawn) {
                engine.gameState = 'WIN';
                if (engine.onStateChange) engine.onStateChange('WIN');
                if (engine.logMessage) engine.logMessage("> VITAL: ALL CREW LOCATED. DRONE EXTRACTED.", 'action');
            }
        }

        renderDebug();
        drawCartography();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});
