"use client"

import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion"

export const MotionDiv = motion.div
export const MotionSection = motion.section
export const MotionSpan = motion.span
export const MotionH2 = motion.h2
export const MotionP = motion.p

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.4, ease: "easeInOut" }
}

export const slideUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
}

export const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

export const scaleHover = {
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 }
}

export { AnimatePresence }
