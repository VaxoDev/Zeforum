import { motion } from "framer-motion"

interface LogoTextProps {
  variant: "default" | "minimalist" | "stylized"
}

export function LogoText({ variant }: LogoTextProps) {
  switch (variant) {
    case "minimalist":
      return (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-bold text-xl"
        >
          ZF
        </motion.div>
      )
    case "stylized":
      return (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-bold text-xl italic"
        >
          Ze<span className="text-primary">Forum</span>
        </motion.div>
      )
    default:
      return (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-bold text-xl"
        >
          ZeroFum
        </motion.div>
      )
  }
}

