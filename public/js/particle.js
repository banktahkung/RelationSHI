document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("heartCanvas");
  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const hearts = [];

  class HeartParticle {
    constructor() {
      this.x = Math.random() * canvas.width; // Random X position
      this.y = canvas.height; // Start from the bottom
      this.size = Math.random() * 10 + 10; // Random size
      this.speedX = (Math.random() - 0.5) * 2; // Random side movement
      this.speedY = Math.random() * 3 + 2; // Speed upwards
      this.alpha = 1;
      this.scale = Math.random() * 1 + 0.4; // Scaling effect
      this.life = Math.random() * 40 + 20; // Shorter lifespan
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = "red";

      // Draw heart shape
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale, this.scale);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size, -this.size, -this.size * 1.5, this.size / 2, 0, this.size * 1.5);
      ctx.bezierCurveTo(this.size * 1.5, this.size / 2, this.size, -this.size, 0, 0);
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.x += this.speedX; // Move sideways randomly
      this.y -= this.speedY; // Move upwards
      this.alpha -= 0.02; // Fade out faster
      this.life--;

      // Remove when lifespan ends or fully faded out
      if (this.alpha <= 0 || this.life <= 0) {
        const index = hearts.indexOf(this);
        if (index > -1) hearts.splice(index, 1);
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    hearts.forEach((heart) => {
      heart.update();
      heart.draw();
    });

    requestAnimationFrame(animate);
  }

  // Generate hearts at a shorter interval
  setInterval(() => {
    for (let i = 0; i < 5; i++) {
      hearts.push(new HeartParticle());
    }
  }, 100);

  // Start animation loop
  animate();

  // Adjust canvas size on window resize
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
});
