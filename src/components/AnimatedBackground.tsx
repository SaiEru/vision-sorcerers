import { motion } from "framer-motion";

const AnimatedBackground = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    {/* Deep radial glow behind eye */}
    <div
      className="absolute left-1/2 top-1/2 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        background:
          "radial-gradient(circle, hsl(221 83% 53% / 0.12) 0%, hsl(200 70% 40% / 0.05) 40%, transparent 70%)",
      }}
    />

    {/* === The Eye === */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <svg
        viewBox="0 0 800 400"
        className="h-[min(80vh,600px)] w-[min(90vw,900px)] opacity-[0.06]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Upper eyelid curve */}
        <motion.path
          d="M 50 200 Q 400 10 750 200"
          stroke="hsl(200 70% 60%)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />
        {/* Lower eyelid curve */}
        <motion.path
          d="M 50 200 Q 400 390 750 200"
          stroke="hsl(200 70% 60%)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
        />

        {/* Outer iris ring */}
        <motion.circle
          cx="400"
          cy="200"
          r="110"
          stroke="hsl(210 80% 55%)"
          strokeWidth="1.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1 }}
          style={{ transformOrigin: "400px 200px" }}
        />

        {/* Iris detail rings */}
        <motion.circle
          cx="400"
          cy="200"
          r="90"
          stroke="hsl(195 75% 50%)"
          strokeWidth="1"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1, delay: 1.3 }}
          style={{ transformOrigin: "400px 200px" }}
        />
        <motion.circle
          cx="400"
          cy="200"
          r="70"
          stroke="hsl(210 70% 50%)"
          strokeWidth="0.8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1, delay: 1.5 }}
          style={{ transformOrigin: "400px 200px" }}
        />

        {/* Pupil */}
        <motion.circle
          cx="400"
          cy="200"
          r="40"
          fill="hsl(221 83% 53%)"
          fillOpacity="0.3"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.1, 0.95, 1] }}
          transition={{
            scale: {
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            },
            default: { duration: 0.8, delay: 1.5 },
          }}
          style={{ transformOrigin: "400px 200px" }}
        />

        {/* Pupil inner dot */}
        <motion.circle
          cx="400"
          cy="200"
          r="18"
          fill="hsl(222 47% 8%)"
          fillOpacity="0.6"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.15, 0.9, 1] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.5,
          }}
          style={{ transformOrigin: "400px 200px" }}
        />

        {/* Light reflection */}
        <motion.circle
          cx="375"
          cy="175"
          r="8"
          fill="white"
          fillOpacity="0.4"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="420"
          cy="185"
          r="4"
          fill="white"
          fillOpacity="0.25"
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Iris radial lines */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const x1 = 400 + Math.cos(angle) * 45;
          const y1 = 200 + Math.sin(angle) * 45;
          const x2 = 400 + Math.cos(angle) * 105;
          const y2 = 200 + Math.sin(angle) * 105;
          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="hsl(200 60% 55%)"
              strokeWidth="0.5"
              strokeOpacity="0.4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 1.6 + i * 0.04 }}
            />
          );
        })}
      </svg>
    </div>

    {/* Slow-rotating outer ring for depth */}
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/[0.04]"
      style={{ width: "min(95vw, 950px)", height: "min(85vh, 650px)" }}
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
    />

    {/* Subtle floating particles */}
    {[
      { x: "12%", y: "18%", size: 3, delay: 0 },
      { x: "85%", y: "22%", size: 4, delay: 0.8 },
      { x: "20%", y: "75%", size: 3, delay: 1.5 },
      { x: "78%", y: "68%", size: 4, delay: 0.4 },
      { x: "55%", y: "88%", size: 3, delay: 2 },
      { x: "8%", y: "55%", size: 3, delay: 1.2 },
    ].map((p, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-primary/15"
        style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
        animate={{ y: [0, -15, 0], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 4 + p.delay, repeat: Infinity, delay: p.delay }}
      />
    ))}

    {/* Very faint grid */}
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage:
          "linear-gradient(hsl(200 60% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(200 60% 50%) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }}
    />
  </div>
);

export default AnimatedBackground;
