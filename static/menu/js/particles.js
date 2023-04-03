export class ParticleEffect {
    constructor(canvas, color) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.COLOR = color;
        this.PARTICLE_NUMBER = this.calculateParticleNumber();
        this.CONNECT_RADIUS = this.calculateConnectRadius();
        this.PARTICLE_RADIUS = 2;
        this.PARTICLE_LINE_WEIGHT = 1;
        this.DRAG_RADIUS = 10;
        this.HOVER_RADIUS = 50;
        this.particles = [];
        this.dragging = false;
        this.closestParticleIndex = null;
        this.mouse = {
            x: null,
            y: null,
        };
    }

    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener("resize", () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.PARTICLE_NUMBER = this.calculateParticleNumber();
            this.CONNECT_RADIUS = this.calculateConnectRadius();
            this.createParticles();
        });

        this.createParticles();
        this.draw();
    }

    calculateParticleNumber() {
        const baseSize = 1920 * 1080;
        const currentSize = window.innerWidth * window.innerHeight;
        const scaleFactor = currentSize / baseSize;
        const baseParticleNumber = 500; 
        return Math.floor(baseParticleNumber * scaleFactor);
    }
    
    calculateConnectRadius() {
        const baseWidth = 1920; 
        const scaleFactor = window.innerWidth / baseWidth;
        const baseConnectRadius = 200; 
        return baseConnectRadius * scaleFactor;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.PARTICLE_NUMBER; i++) {
            const vx = Math.random() * 2 - 1;
            const vy = Math.random() * 2 - 1;

            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: this.PARTICLE_RADIUS,
                vx,
                vy,
                color: this.COLOR,
                lineWidth: this.PARTICLE_LINE_WEIGHT,
            });
        }
    }
    

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((particle, i) => {
            particle.x += (particle.vx + Math.random() * 0.2 - 0.1) * 0.5;
            particle.y += (particle.vy + Math.random() * 0.2 - 0.1) * 0.5;

                switch (true) {
                    case particle.x < 0:
                        particle.x = Math.floor(Math.random() * this.canvas.width);
                        break;
                    case particle.x > this.canvas.width:
                        particle.x = Math.floor(Math.random() * this.canvas.width);
                        break;
                    case particle.y < 0:
                        particle.y = Math.floor(Math.random() * this.canvas.height);
                        break;
                    case particle.y > this.canvas.height:
                        particle.y = Math.floor(Math.random() * this.canvas.height);
                        break;
                }

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = particle.color;
            this.ctx.closePath();
            this.ctx.fill();

            for (let j = i + 1; j < this.particles.length; j++) {
                let subParticle = this.particles[j];
                let dx = particle.x - subParticle.x;
                let dy = particle.y - subParticle.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.CONNECT_RADIUS) {
                    let opacity = Math.round((1 - distance / this.CONNECT_RADIUS) * 10) / 10;

                    this.ctx.beginPath();
                    this.ctx.lineWidth = particle.lineWidth;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(subParticle.x, subParticle.y);
                    this.ctx.strokeStyle = `rgba(119, 214, 167, ${opacity})`;
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }
        });

        requestAnimationFrame(this.draw.bind(this));
    }
}
