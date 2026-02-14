"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Monitor, Play, Search, Settings, Info, Globe, Film } from "lucide-react";
import Image from "next/image";

interface AppImage {
  src: string;
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  platform: 'mobile' | 'desktop';
}

const mobileImages: AppImage[] = [
  {
    src: "/MOBILE/HOME.png",
    title: "Home Screen",
    description: "Beautiful and intuitive home interface with easy navigation to all your favorite content.",
    features: ["Quick Access", "Recently Watched", "Trending Content", "Clean UI"],
    icon: <Smartphone className="h-5 w-5" />,
    platform: 'mobile'
  },
  {
    src: "/MOBILE/PLAYER.png",
    title: "Video Player",
    description: "Advanced video player with full screen support and intuitive controls for the best viewing experience.",
    features: ["Full Screen", "Quality Control", "Subtitles", "Gesture Controls"],
    icon: <Play className="h-5 w-5" />,
    platform: 'mobile'
  },
  {
    src: "/MOBILE/SEARCH.png",
    title: "Search & Discovery",
    description: "Powerful search functionality to find exactly what you're looking for with smart suggestions.",
    features: ["Smart Search", "Filters", "Genre Browse", "Quick Results"],
    icon: <Search className="h-5 w-5" />,
    platform: 'mobile'
  },
  {
    src: "/MOBILE/PROVIDER.png",
    title: "Content Providers",
    description: "Access multiple content providers seamlessly from one unified interface.",
    features: ["Multiple Sources", "Provider Stats", "Quality Options", "Direct Links"],
    icon: <Globe className="h-5 w-5" />,
    platform: 'mobile'
  },
  {
    src: "/MOBILE/SERVERS.png",
    title: "Server Selection",
    description: "Choose from multiple high-quality servers for optimal streaming experience.",
    features: ["Multiple Servers", "Quality Options", "Speed Test", "Auto Selection"],
    icon: <Monitor className="h-5 w-5" />,
    platform: 'mobile'
  },
  {
    src: "/MOBILE/SETTINGS.png",
    title: "Settings & Preferences",
    description: "Comprehensive settings to customize your viewing experience exactly how you like it.",
    features: ["Theme Options", "Quality Settings", "Notifications", "Privacy Controls"],
    icon: <Settings className="h-5 w-5" />,
    platform: 'mobile'
  },
  {
    src: "/MOBILE/info.png",
    title: "Content Details",
    description: "Detailed information about movies and shows with ratings, cast, and synopsis.",
    features: ["Cast & Crew", "Ratings", "Synopsis", "Related Content"],
    icon: <Info className="h-5 w-5" />,
    platform: 'mobile'
  }
];

const desktopImages: AppImage[] = [
  {
    src: "/assets/HOME.png",
    title: "Desktop Home",
    description: "Spacious desktop interface optimized for large screens with seamless navigation.",
    features: ["Large Display", "Grid View", "Quick Navigation", "Multi-panel Layout"],
    icon: <Monitor className="h-5 w-5" />,
    platform: 'desktop'
  },
  {
    src: "/assets/PLAYER.png",
    title: "Desktop Player",
    description: "Full-featured desktop video player with advanced controls and keyboard shortcuts.",
    features: ["Keyboard Shortcuts", "Advanced Controls", "Picture-in-Picture", "Full Screen"],
    icon: <Play className="h-5 w-5" />,
    platform: 'desktop'
  },
  {
    src: "/assets/PLAYERCONTROLS.png",
    title: "Player Controls",
    description: "Comprehensive player controls for desktop with timeline, volume, and quality options.",
    features: ["Timeline Control", "Volume Slider", "Quality Selector", "Subtitle Options"],
    icon: <Film className="h-5 w-5" />,
    platform: 'desktop'
  },
  {
    src: "/assets/INFO.png",
    title: "Content Information",
    description: "Detailed content information panel with comprehensive metadata and descriptions.",
    features: ["Detailed Info", "Cast Details", "User Ratings", "Similar Content"],
    icon: <Info className="h-5 w-5" />,
    platform: 'desktop'
  },
  {
    src: "/assets/GLOBAL.png",
    title: "Global Settings",
    description: "System-wide settings panel for configuring the application behavior and preferences.",
    features: ["System Settings", "Performance Options", "Network Config", "Cache Management"],
    icon: <Globe className="h-5 w-5" />,
    platform: 'desktop'
  },
  {
    src: "/assets/EPS.png",
    title: "Episode Browser",
    description: "Browse through episodes with detailed information and progress tracking.",
    features: ["Episode List", "Progress Tracking", "Season Navigation", "Quick Play"],
    icon: <Film className="h-5 w-5" />,
    platform: 'desktop'
  }
];

const ImageShowcase = ({ image, index, isRight }: { image: AppImage; index: number; isRight: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${
        isRight ? "lg:flex-row-reverse" : ""
      }`}
    >
      {/* Image Side */}
      <motion.div
        className="w-full lg:w-1/2"
      >
        <Card className="overflow-hidden shadow-xl border-2 border-primary/10 bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-4">
            <div className="relative aspect-[9/16] lg:aspect-[16/10] w-full rounded-lg overflow-hidden bg-muted">
              <Image
                src={image.src}
                alt={image.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index < 2}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Side */}
      <motion.div
        className="w-full lg:w-1/2 space-y-4"
        initial={{ opacity: 0, x: isRight ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {image.icon}
          </div>
          <Badge variant={image.platform === 'mobile' ? 'default' : 'secondary'} className="capitalize">
            {image.platform === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}
          </Badge>
        </div>

        <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">
          {image.title}
        </h3>
        
        <p className="text-muted-foreground text-lg leading-relaxed">
          {image.description}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-4">
          {image.features.map((feature, featureIndex) => (
            <motion.div
              key={featureIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.4 + featureIndex * 0.1 }}
              className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50"
            >
              <div className="w-2 h-2 rounded-full bg-primary/60" />
              <span className="text-sm font-medium">{feature}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function GalleryPage() {
  const allImages = [...mobileImages, ...desktopImages];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-16 lg:py-24"
      >
        <div className="text-center space-y-6 mb-16 lg:mb-24">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              📱 App Gallery
            </Badge>
          </motion.div>
          
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            ScreenScape Gallery
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore the beautiful and intuitive interface of ScreenScape across all platforms. 
            Experience seamless streaming with our carefully crafted user interface.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Badge variant="secondary" className="px-3 py-1">
              📱 {mobileImages.length} Mobile Screenshots
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              🖥️ {desktopImages.length} Desktop Screenshots
            </Badge>
          </motion.div>
        </div>

        {/* Image Grid */}
        <div className="space-y-16 lg:space-y-24">
          {allImages.map((image, index) => (
            <ImageShowcase
              key={`${image.platform}-${index}`}
              image={image}
              index={index}
              isRight={index % 2 === 1}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-20 lg:mt-32 space-y-6"
        >
          <h2 className="text-2xl lg:text-3xl font-bold">Ready to Experience ScreenScape?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Download ScreenScape today and enjoy seamless streaming across all your devices.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              🚀 Get Started
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}