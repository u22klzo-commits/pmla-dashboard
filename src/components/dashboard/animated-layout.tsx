"use client"

import { MotionDiv, slideUp, staggerContainer } from "@/components/ui/motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AnimatedLayoutProps {
    children: ReactNode
    className?: string
}

export function AnimatedLayout({ children, className }: AnimatedLayoutProps) {
    return (
        <MotionDiv
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className={cn("flex flex-col gap-4", className)}
        >
            {children}
        </MotionDiv>
    )
}

export function AnimatedGridItem({ children, className }: { children: ReactNode, className?: string }) {
    return (
        <MotionDiv
            variants={slideUp}
            className={className}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            {children}
        </MotionDiv>
    )
}
