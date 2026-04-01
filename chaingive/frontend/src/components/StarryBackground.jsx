import React, { useEffect, useRef } from 'react';

const StarryBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Particle class
        class Particle {
            constructor(width, height) {
                this.reset(width, height);
            }

            reset(width, height) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.7 + 0.3;
                this.twinkleSpeed = Math.random() * 0.03 + 0.01;
                this.twinkleFactor = 1;
                this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
            }

            update(width, height, mouseX, mouseY) {
                // Regular movement
                this.x += this.speedX;
                this.y += this.speedY;

                // Parallax shift based on mouse (increased for more "control" feel)
                const dx = (mouseX - width / 2) * (this.size * 0.02);
                const dy = (mouseY - height / 2) * (this.size * 0.02);
                
                // Magnetic effect: move towards mouse if close
                const distMouseX = mouseX - (this.x + dx);
                const distMouseY = mouseY - (this.y + dy);
                const distance = Math.sqrt(distMouseX * distMouseX + distMouseY * distMouseY);
                let magneticX = 0;
                let magneticY = 0;
                
                if (distance < 250) {
                    const force = (250 - distance) / 250;
                    magneticX = distMouseX * force * 0.05;
                    magneticY = distMouseY * force * 0.05;
                }

                const drawX = this.x + dx + magneticX;
                const drawY = this.y + dy + magneticY;

                // Twinkle effect
                this.twinkleFactor += this.twinkleSpeed * this.twinkleDirection;
                if (this.twinkleFactor > 1.3 || this.twinkleFactor < 0.3) {
                    this.twinkleDirection *= -1;
                }

                // Wrap around edges
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;

                return { drawX, drawY, distance };
            }

            draw(ctx, drawX, drawY, distance) {
                ctx.beginPath();
                ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
                
                // Stars glow brighter near mouse
                const proximityAlpha = distance < 300 ? (300 - distance) / 300 : 0;
                const color = this.size > 1.5 ? '#E8CA88' : '#D0E3C5';
                
                ctx.fillStyle = color;
                ctx.globalAlpha = (this.opacity * this.twinkleFactor * 0.9) + (proximityAlpha * 0.3);
                ctx.fill();
                
                // Interactive glow
                if (distance < 150) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = color;
                } else if (this.size > 1.5) {
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = color;
                } else {
                    ctx.shadowBlur = 0;
                }
                
                ctx.globalAlpha = 1.0;
            }
        }

        let particles = [];
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            // Increase density slightly
            const particleCount = Math.floor((canvas.width * canvas.height) / 8000);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(canvas.width, canvas.height));
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw interactive lines
            particles.forEach((p, i) => {
                const { drawX, drawY, distance } = p.update(canvas.width, canvas.height, mouseX, mouseY);
                
                // Draw line to mouse if close
                if (distance < 200) {
                    ctx.beginPath();
                    ctx.moveTo(drawX, drawY);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.strokeStyle = `rgba(232, 202, 136, ${(200 - distance) / 200 * 0.4})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }

                p.draw(ctx, drawX, drawY, distance);
            });
            
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const handleResize = () => {
            init();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);
        
        init();
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 bg-[#0B0F19]"
            style={{ 
                background: 'radial-gradient(circle at 50% 50%, #1a2235 0%, #0B101B 100%)'
            }}
        />
    );
};

export default StarryBackground;
