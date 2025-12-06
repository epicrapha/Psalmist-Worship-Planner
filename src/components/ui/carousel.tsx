import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

interface CarouselProps {
    children: React.ReactNode
    className?: string
    itemClassName?: string
}

export function Carousel({ children, className, itemClassName }: CarouselProps) {
    const ref = React.useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = React.useState(false)
    const [canScrollRight, setCanScrollRight] = React.useState(false)

    const checkScroll = () => {
        if (ref.current) {
            const { scrollLeft, scrollWidth, clientWidth } = ref.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
        }
    }

    React.useEffect(() => {
        checkScroll()
        window.addEventListener("resize", checkScroll)
        return () => window.removeEventListener("resize", checkScroll)
    }, [])

    const scroll = (direction: "left" | "right") => {
        if (ref.current) {
            const { current } = ref
            const scrollAmount = current.clientWidth * 0.8
            const targetScroll = direction === "left"
                ? current.scrollLeft - scrollAmount
                : current.scrollLeft + scrollAmount

            current.scrollTo({
                left: targetScroll,
                behavior: "smooth"
            })
        }
    }

    return (
        <div className={cn("relative group", className)}>
            {/* Left Gradient & Button */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-12 z-10 flex items-center justify-start transition-opacity duration-300 pointer-events-none",
                canScrollLeft ? "opacity-100" : "opacity-0"
            )}>
                <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
                <button
                    onClick={() => scroll("left")}
                    className="relative z-20 p-2 bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-lg hover:bg-background transition-colors pointer-events-auto ml-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            </div>

            {/* Right Gradient & Button */}
            <div className={cn(
                "absolute right-0 top-0 bottom-0 w-12 z-10 flex items-center justify-end transition-opacity duration-300 pointer-events-none",
                canScrollRight ? "opacity-100" : "opacity-0"
            )}>
                <div className="absolute inset-0 bg-gradient-to-l from-background to-transparent" />
                <button
                    onClick={() => scroll("right")}
                    className="relative z-20 p-2 bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-lg hover:bg-background transition-colors pointer-events-auto mr-2"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Scroll Container */}
            <div
                ref={ref}
                onScroll={checkScroll}
                className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {React.Children.map(children, (child) => (
                    <div className={cn("flex-none snap-start", itemClassName)}>
                        {child}
                    </div>
                ))}
            </div>
        </div>
    )
}
