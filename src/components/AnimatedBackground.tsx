import { motion } from "framer-motion";

const FloatingParticle = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/20"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{
      y: [0, -20, 0],
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.3, 1],
    }}
    transition={{ duration: 3 + delay, repeat: Infinity, delay }}
  />
);

const particles = [
  { delay: 0, x: "10%", y: "20%", size: 4 },
  { delay: 0.5, x: "80%", y: "15%", size: 3 },
  { delay: 1, x: "25%", y: "70%", size: 5 },
  { delay: 1.5, x: "70%", y: "60%", size: 3 },
  { delay: 2, x: "50%", y: "85%", size: 4 },
  { delay: 0.8, x: "90%", y: "40%", size: 3 },
  { delay: 1.2, x: "15%", y: "50%", size: 4 },
  { delay: 0.3, x: "60%", y: "30%", size: 5 },
  { delay: 1.8, x: "35%", y: "90%", size: 3 },
  { delay: 2.2, x: "85%", y: "75%", size: 4 },
];

const AnimatedBackground = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    {/* Radial glow */}
    <div
      className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
      style={{
        background:
          "radial-gradient(circle, hsl(221 83% 53% / 0.3) 0%, hsl(221 83% 53% / 0.06) 45%, transparent 70%)",
      }}
    />

    {/* Rotating rings */}
    <motion.div
      className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/5"
      animate={{ rotate: -360 }}
      transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />

    {/* Grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "linear-gradient(hsl(221 83% 53%) 1px, transparent 1px), linear-gradient(90deg, hsl(221 83% 53%) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />

    {/* Floating particles */}
    {particles.map((p, i) => (
      <FloatingParticle key={i} {...p} />
    ))}

    {/* DNA helix left */}
    <div className="absolute left-4 top-1/4 hidden flex-col items-center gap-3 opacity-10 lg:flex">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="h-2 rounded-full bg-primary"
          style={{ width: `${12 + Math.sin(i * 0.8) * 10}px` }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>

    {/* DNA helix right */}
    <div className="absolute right-4 bottom-1/4 hidden flex-col items-center gap-3 opacity-10 lg:flex">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="h-2 rounded-full bg-primary"
          style={{ width: `${12 + Math.cos(i * 0.8) * 10}px` }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  </div>
);

export default AnimatedBackground;
