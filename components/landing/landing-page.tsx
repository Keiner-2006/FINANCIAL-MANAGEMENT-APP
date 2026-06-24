"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useInView, useMotionValue, useSpring, type Variants } from "framer-motion"
import {
  Wallet,
  Car,
  BarChart3,
  PiggyBank,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
  ChevronRight,
} from "lucide-react"

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -15 },
  visible: {
    opacity: 1, scale: 1, rotate: 0,
    transition: { type: "spring", stiffness: 350, damping: 16 },
  },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
}

const cardRise: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 250, damping: 22 },
  },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 14 },
  },
}

function staggerContainer(stagger = 0.08, delay = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }
}

function MagneticField({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 250, damping: 18 })
  const springY = useSpring(y, { stiffness: 250, damping: 18 })

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onPointerMove={(e) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        x.set(((e.clientX - cx) / rect.width) * 8)
        y.set(((e.clientY - cy) / rect.height) * 8)
      }}
      onPointerLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedCounter({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const duration = 1800
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, target])

  return <span ref={ref}>{prefix}{count.toLocaleString("es-CO")}{suffix}</span>
}

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0e1a] text-white">
      <BackgroundEffects />
      <div className="relative z-10 max-w-md mx-auto px-5 py-8 min-h-screen flex flex-col">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <TestimonialSection />
        <CTASection />
      </div>
    </div>
  )
}

function BackgroundEffects() {
  const colors = [
    "rgba(16,185,129,0.15)",
    "rgba(59,130,246,0.12)",
    "rgba(139,92,246,0.10)",
  ]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent blur-3xl animate-gradient" />
      <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl animate-gradient animate-aurora" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-transparent blur-3xl animate-gradient" style={{ animationDelay: "4s" }} />

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${3 + (i % 3) * 4}px`,
            height: `${3 + (i % 3) * 4}px`,
            left: `${8 + i * 9}%`,
            top: `${10 + (i % 4) * 22}%`,
            background: colors[i % 3],
            animation: `dot-float ${4 + (i % 5) * 1.2}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)",
      }} />
    </div>
  )
}

function HeroSection() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <motion.div
      className="text-center mt-10 mb-8"
      variants={staggerContainer(0.12, 0.1)}
      initial="hidden"
      animate={mounted ? "visible" : "hidden"}
    >
      <motion.div variants={popIn} className="relative inline-flex items-center justify-center mb-8">
        <div className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400/30 to-blue-500/20 blur-xl animate-glow-ring" />
        <motion.div
          className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 shadow-2xl"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "ease-in-out", delay: 0.8 }}
        >
          <Wallet className="w-9 h-9 text-white drop-shadow-lg" />
        </motion.div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-emerald-400/60"
            style={{
              "--orbit-radius": "56px",
              animation: `orbit ${5 + i}s linear infinite`,
              animationDelay: `${i * 1.7}s`,
            } as React.CSSProperties}
          />
        ))}
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="text-4xl font-extrabold tracking-tight mb-4"
      >
        <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">Smart</span>
        <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Pocket</span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="text-base text-white/50 leading-relaxed max-w-xs mx-auto"
      >
        Controla el dinero de tu hogar
        <br />
        <span className="text-white/70 font-medium">sin complicaciones.</span>
      </motion.p>

      <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mt-5">
        <div className="flex -space-x-2">
          {["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500"].map((bg, i) => (
            <motion.div
              key={i}
              className={`w-7 h-7 rounded-full ${bg} border-2 border-[#0a0e1a] flex items-center justify-center text-[10px] font-bold`}
              initial={{ opacity: 0, y: 12, scale: 0.6 }}
              animate={mounted ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.5 + i * 0.07 }}
            >
              {["K", "M", "A", "L"][i]}
            </motion.div>
          ))}
        </div>
        <motion.span
          className="text-xs text-white/40"
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          +1,200 familias activas
        </motion.span>
      </motion.div>
    </motion.div>
  )
}

function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })

  const stats = [
    { value: 1200, suffix: "+", label: "Familias activas", color: "from-blue-500/20 to-blue-600/5", barColor: "bg-blue-500/40" },
    { value: 380, prefix: "$", suffix: "k", label: "Ahorro promedio", color: "from-emerald-500/20 to-emerald-600/5", barColor: "bg-emerald-500/40" },
    { value: 15000, suffix: "+", label: "Gastos registrados", color: "from-violet-500/20 to-violet-600/5", barColor: "bg-violet-500/40" },
  ]

  return (
    <motion.div
      ref={ref}
      className="grid grid-cols-3 gap-2.5 mb-10"
      variants={staggerContainer(0.1, 0.15)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {stats.map((s, i) => (
        <motion.div
          key={i}
          variants={cardRise}
          whileHover={{ y: -3, transition: { type: "spring", stiffness: 300, damping: 20 } }}
          className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br ${s.color} backdrop-blur-xl p-3.5 text-center cursor-default`}
        >
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.04]">
            <motion.div
              className={`h-full ${s.barColor} rounded-full`}
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.1 }}
              style={{ originX: 0 }}
            />
          </div>
          <p className="text-xl font-bold text-white tracking-tight">
            <AnimatedCounter target={s.value} prefix={s.prefix} suffix={s.suffix} />
          </p>
          <p className="text-[10px] text-white/40 mt-1 leading-tight">{s.label}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}

function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  const features = [
    {
      icon: <Wallet className="w-5 h-5" />,
      title: "Presupuesto Inteligente",
      desc: "Organiza tus gastos por período y nunca te pases del límite",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <Car className="w-5 h-5" />,
      title: "Gestión Vehicular",
      desc: "SOAT, tecnomecanica y gastos de tu moto o carro",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Reportes Detallados",
      desc: "Gráficos y tendencias de tu patrón de gasto",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: <PiggyBank className="w-5 h-5" />,
      title: "Bolsillo de Ahorros",
      desc: "Aparta dinero y construye tu fondo de emergencia",
      gradient: "from-amber-500 to-orange-500",
    },
  ]

  return (
    <motion.div
      ref={ref}
      className="space-y-2.5 mb-8"
      variants={staggerContainer(0.1, 0.2)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {features.map((f, i) => (
        <motion.div
          key={i}
          variants={cardRise}
          whileHover={{
            x: 4,
            transition: { type: "spring", stiffness: 300, damping: 22 },
          }}
          whileTap={{ scale: 0.98 }}
          className="group relative flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-4 cursor-pointer transition-colors hover:bg-white/[0.06] hover:border-white/[0.12]"
        >
          <motion.div
            className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg`}
            whileHover={{ scale: 1.12, rotate: 4 }}
            transition={{ type: "spring", stiffness: 350, damping: 14 }}
          >
            {f.icon}
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-white/90">{f.title}</p>
            <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{f.desc}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 transition-all duration-300 group-hover:text-white/50 group-hover:translate-x-1" />
        </motion.div>
      ))}
    </motion.div>
  )
}

function TestimonialSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })

  const badges = [
    { icon: <Shield className="w-3.5 h-3.5" />, text: "Seguro y privado" },
    { icon: <Zap className="w-3.5 h-3.5" />, text: "Rápido y fácil" },
    { icon: <TrendingUp className="w-3.5 h-3.5" />, text: "Gratis para siempre" },
  ]

  return (
    <motion.div
      ref={ref}
      className="mb-8"
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ type: "spring", stiffness: 250, damping: 24, delay: 0.1 }}
    >
      <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-5">
        <div className="absolute inset-0 rounded-2xl animate-pulse-spread border border-white/[0.03]" />

        <motion.div
          className="flex gap-2 mb-4 relative"
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} variants={scaleIn}>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="text-sm text-white/60 leading-relaxed italic relative"
          initial={{ opacity: 0, letterSpacing: "-0.03em" }}
          animate={isInView ? { opacity: 1, letterSpacing: "0em" } : { opacity: 0, letterSpacing: "-0.03em" }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          &ldquo;Antes perdía el control de mis gastos. Con SmartPocket sé exactamente a dónde va cada peso.&rdquo;
        </motion.p>
        <motion.p
          className="text-xs text-white/30 mt-3 relative"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          — María, mamá de familia
        </motion.p>
      </div>

      <motion.div
        className="flex justify-center gap-3 mt-4"
        variants={staggerContainer(0.12)}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {badges.map((b, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, x: i % 2 === 0 ? -12 : 12 },
              visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 250, damping: 22 } },
            }}
            className="flex items-center gap-1.5 text-[10px] text-white/30"
          >
            {b.icon}
            <span>{b.text}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

function CTASection() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 400); return () => clearTimeout(t) }, [])

  return (
    <motion.div
      className="mt-auto pt-4 space-y-3"
      initial={{ opacity: 0 }}
      animate={mounted ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MagneticField>
        <Link
          href="/auth/sign-up"
          className="group relative flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 font-semibold text-base text-white shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute inset-0 animate-shimmer-sweep pointer-events-none" style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
          }} />
          <motion.span
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={mounted ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 250, damping: 16, delay: 0.15 }}
          >
            <Sparkles className="w-4.5 h-4.5" />
          </motion.span>
          <motion.span
            className="relative z-10"
            initial={{ opacity: 0, y: 12 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.2 }}
          >
            Comienza Gratis
          </motion.span>
          <motion.span
            className="relative z-10 flex"
            initial={{ opacity: 0, x: -8 }}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.25 }}
          >
            <ArrowRight className="w-4.5 h-4.5" />
          </motion.span>
        </Link>
      </MagneticField>

      <Link
        href="/auth/login"
        className="group relative flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-white/[0.08] text-white/50 font-medium text-sm hover:bg-white/[0.04] hover:text-white/70 hover:border-white/[0.15] transition-all duration-500"
      >
        Ya tengo cuenta
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-white/30 transition-all duration-300 group-hover:w-1/2" />
      </Link>

      <motion.p
        className="text-center text-[10px] text-white/20 pt-2"
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        Sin tarjeta de crédito · Sin compromiso
      </motion.p>
    </motion.div>
  )
}
