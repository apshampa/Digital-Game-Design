class AudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.lureOscillators = [];
        this.isLureActive = false;
        this.lastHeartbeatTime = 0;

        // Setup noise buffer for water and gate sounds
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // pan: -1.0 (left) to 1.0 (right)
    createPanner(panValue) {
        const panner = this.ctx.createStereoPanner();
        // Clamping between -1 and 1 just in case
        panner.pan.value = Math.max(-1, Math.min(1, panValue));
        return panner;
    }

    playWallEcho(delaySecs, pan) {
        setTimeout(() => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const panner = this.createPanner(pan);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(250, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);

            gain.gain.setValueAtTime(1.5, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(panner);
            panner.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        }, delaySecs * 1000);
    }

    playWaterSplash(delaySecs, pan) {
        setTimeout(() => {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;
            const noiseFilter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            const panner = this.createPanner(pan);

            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.value = 800;

            gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

            noise.connect(noiseFilter);
            noiseFilter.connect(gain);
            gain.connect(panner);
            panner.connect(this.ctx.destination);

            noise.start();
            noise.stop(this.ctx.currentTime + 0.5);
        }, delaySecs * 1000);
    }

    playWorkerClink(delaySecs, pan) {
        setTimeout(() => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const panner = this.createPanner(pan);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.4);

            gain.gain.setValueAtTime(0.5, this.ctx.currentTime); // Calmer volume
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

            osc.connect(gain);
            gain.connect(panner);
            panner.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.5);
        }, delaySecs * 1000);
    }

    playGateSlam() {
        // A huge loud explosion like sound
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(400, this.ctx.currentTime);
        lowpass.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 1.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);

        noise.connect(lowpass);
        lowpass.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
        noise.stop(this.ctx.currentTime + 1.5);
    }

    playAnomalySquelch(pan) {
        // Low distorted sound indicating the monster
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const panner = this.createPanner(pan);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, this.ctx.currentTime);
        // Wobble
        osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.2);
        osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    startLureSiren() {
        if (this.isLureActive) return;
        this.isLureActive = true;
        this._playSirenLoop();
    }

    _playSirenLoop() {
        if (!this.isLureActive) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.5);

        // Pulse volume
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
        this.lureOscillators.push(osc);

        setTimeout(() => this._playSirenLoop(), 600);
    }

    stopLureSiren() {
        this.isLureActive = false;
        this.lureOscillators.forEach(osc => {
            try { osc.stop(); } catch (e) { }
        });
        this.lureOscillators = [];
    }

    playDamageThud() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(2.0, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    playAnomalyPing(delaySecs, pan) {
        setTimeout(() => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const panner = this.createPanner(pan);

            // Guttural, terrifying high-low ping
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.1);
            osc.frequency.linearRampToValueAtTime(400, this.ctx.currentTime + 0.3);

            gain.gain.setValueAtTime(2.0, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.5);
        }, delaySecs * 1000);
    }

    playWorkerSecured() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    updateHeartbeat(distance) {
        if (distance > 150) return;

        const now = this.ctx.currentTime;
        const interval = 0.3 + (distance / 150) * 1.2;

        if (now - this.lastHeartbeatTime >= interval) {
            this.lastHeartbeatTime = now;
            this._playHeartbeatThump();
        }
    }

    _playHeartbeatThump() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(1.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }
}

window.AudioUtils = new AudioEngine();
