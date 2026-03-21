"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Download, Smartphone, Info, Calendar, ExternalLink, Coffee, Copy, Terminal, Check } from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

interface GitHubRelease {
  tag_name: string
  name: string
  body: string
  published_at: string
  author: {
    login: string
    avatar_url: string
    html_url: string
  }
  html_url: string
  assets: Array<{
    name: string
    size: number
    download_count: number
    browser_download_url: string
    content_type: string
  }>
  repoUrl?: string
  repoName?: string
}

type DashboardStats = {
  totalApiCalls: number;
  totalQuota: number;
  activeKeys: number;
  successRate: string;
  lastUsed: string | null;
};

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Byte'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString())
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const getArchitecture = (filename: string, contentType: string, isScreenscapeTv: boolean = false) => {
  // Android TV from screenscapetv repo
  if (isScreenscapeTv && filename.includes('armeabi-v7a') && contentType === 'application/vnd.android.package-archive') {
    return { 
      name: 'Android TV', 
      recommended: true,
      buttonText: 'Download for Android TV',
      description: 'Optimized for Android TV devices',
      isLatest: true,
      platform: 'Android TV'
    }
  }
  
  // Linux builds from screenscapetv repo
  if (isScreenscapeTv && filename.endsWith('.deb')) {
    return { 
      name: 'Linux (Debian)', 
      recommended: true,
      buttonText: 'Download .deb',
      description: 'For Debian/Ubuntu Linux',
      isLatest: true,
      platform: 'Linux'
    }
  }
  
  if (isScreenscapeTv && filename.endsWith('.zip') && filename.includes('linux')) {
    return { 
      name: 'Linux (Portable)', 
      recommended: false,
      buttonText: 'Download .zip',
      description: 'Portable Linux build',
      isLatest: true,
      platform: 'Linux'
    }
  }
  
  // Android mobile from App-release repo
  if (filename.includes('arm64-v8a')) return { 
    name: 'ARM64', 
    recommended: true,
    buttonText: 'Update/Download',
    description: 'For most modern Android devices',
    isLatest: true,
    platform: 'Android'
  }
  if (filename.includes('armeabi-v7a')) return { 
    name: 'ARM32', 
    recommended: false,
    buttonText: 'Download APK',
    description: 'For older Android devices',
    isLatest: false,
    platform: 'Android'
  }
  if (filename.includes('universal')) return { 
    name: 'Universal', 
    recommended: false,
    buttonText: 'Below Android 9',
    description: 'For older Android versions',
    isLatest: false,
    platform: 'Android'
  }
  return { 
    name: 'Unknown', 
    recommended: false,
    buttonText: 'Download',
    description: 'Unknown compatibility',
    isLatest: false,
    platform: 'Other'
  }
}

const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: "-50px", amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.98 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.5,
        ease: [0.4, 0, 0.2, 1],
        type: "tween"
      }}
    >
      {children}
    </motion.div>
  )
}

const ParallaxSection = ({ children, speed = 0.5 }: { children: React.ReactNode; speed?: number }) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`])

  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  )
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [release, setRelease] = useState<GitHubRelease | null>(null);
  const [tvRelease, setTvRelease] = useState<GitHubRelease | null>(null);
  const [loadingReleases, setLoadingReleases] = useState(true);

  const [linuxDialogOpen, setLinuxDialogOpen] = useState(false);
  const [selectedLinuxAsset, setSelectedLinuxAsset] = useState<{ name: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const router = useRouter();

  const handleCopyCommand = async () => {
    await navigator.clipboard.writeText('sudo apt install libmpv2')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLinuxDownload = (assetName: string, downloadUrl: string) => {
    setSelectedLinuxAsset({ name: assetName, url: downloadUrl })
    setLinuxDialogOpen(true)
  }

  const handleActualDownload = () => {
    if (selectedLinuxAsset) {
      window.location.href = selectedLinuxAsset.url
      setLinuxDialogOpen(false)
    }
  }

  const downloadAssets = useMemo(() => {
    if (!release && !tvRelease) return []
    
    const androidApkAssets = release?.assets.filter(asset => 
      asset.content_type === 'application/vnd.android.package-archive'
    ) || []
    
    const tvAndLinuxAssets = tvRelease?.assets.filter(asset => 
      asset.content_type === 'application/vnd.android.package-archive' || 
      asset.name.endsWith('.deb') || 
      asset.name.endsWith('.zip')
    ) || []
    
    const allDownloadAssets = [...androidApkAssets, ...tvAndLinuxAssets].sort((a, b) => {
      const isAFromTv = tvAndLinuxAssets.includes(a)
      const isBFromTv = tvAndLinuxAssets.includes(b)
      const archA = getArchitecture(a.name, a.content_type, isAFromTv)
      const archB = getArchitecture(b.name, b.content_type, isBFromTv)
      
      const order = ['ARM64', 'Android TV', 'Linux (Debian)', 'Linux (Portable)', 'ARM32', 'Universal']
      return order.indexOf(archA.name) - order.indexOf(archB.name)
    })

    return allDownloadAssets.map((asset) => {
      const isFromTvRepo = tvAndLinuxAssets.includes(asset)
      const arch = getArchitecture(asset.name, asset.content_type, isFromTvRepo)
      const repoUrl = isFromTvRepo ? tvRelease?.repoUrl : release?.repoUrl
      const repoName = isFromTvRepo ? tvRelease?.repoName : release?.repoName
      
      return { asset, arch, repoUrl, repoName }
    })
  }, [release, tvRelease])

  useEffect(() => {
    if (!isPending && !session) {
      setShowAuthDialog(true);
    } else if (!isPending && session) {
      fetchStats();
      fetchReleases();
    }
  }, [isPending, session]);

  useEffect(() => {
    if (showAuthDialog) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showAuthDialog, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error("Failed to load dashboard stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard stats");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchReleases = async () => {
    try {
      // Fetch Android app releases
      const appResponse = await fetch('https://api.github.com/repos/Anshu78780/App-release/releases/latest')
      if (!appResponse.ok) throw new Error('Failed to fetch Android app release data')
      const appData = await appResponse.json()
      appData.repoUrl = 'https://github.com/Anshu78780/App-release'
      appData.repoName = 'Android App'
      setRelease(appData)
      
      // Fetch TV and Linux releases
      const tvResponse = await fetch('https://api.github.com/repos/Anshu78780/screenscapetv/releases/latest')
      if (!tvResponse.ok) throw new Error('Failed to fetch TV/Linux release data')
      const tvData = await tvResponse.json()
      tvData.repoUrl = 'https://github.com/Anshu78780/screenscapetv'
      tvData.repoName = 'TV & Linux'
      setTvRelease(tvData)
    } catch (err) {
      console.error('Failed to fetch releases:', err)
    } finally {
      setLoadingReleases(false)
    }
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  if (isPending || isLoadingStats || loadingReleases) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              Please login to access the dashboard and manage your API keys.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto"
            >
              Go to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name || "User"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s what&apos;s happening with your scraping projects today.
        </p>
      </div>

      {/* Download Section */}
      <div className="space-y-6 mt-8">
        <ParallaxSection speed={0.2}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">ScreenScape Downloads</h2>
                <p className="text-muted-foreground">
                  Download ScreenScape for Android, Android TV, and Linux
                </p>
              </div>
              <Button asChild variant="default" size="lg" className="gap-2">
                <a 
                  href="https://screenscape.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Watch Online
                </a>
              </Button>
            </div>
          </motion.div>
        </ParallaxSection>

        {/* Release Info Card */}
        {release && (
          <AnimatedCard delay={0.2}>
            <Card className="overflow-hidden">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Smartphone className="h-5 w-5" />
                        </motion.div>
                        {release.name || release.tag_name}
                        <Badge variant="default">Latest</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(release.published_at).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <motion.div 
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img 
                        src={release.author.avatar_url} 
                        alt="Anshu"
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm text-muted-foreground">
                        by Anshu
                      </span>
                      <motion.a
                        href="https://buymeacoffee.com/hunternishq"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 p-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 hover:text-orange-700 transition-colors duration-200"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        title="Buy me a coffee"
                      >
                        <Coffee className="h-4 w-4" />
                      </motion.a>
                    </motion.div>
                  </div>
                  
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Release Notes:</h4>
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                        {release.body.split('\r\n').map((line, index) => (
                          <div key={index} className="mb-1">
                            {line.trim() && (
                              <span className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>{line.trim()}</span>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            </Card>
          </AnimatedCard>
        )}

        {/* Download Cards */}
        {(release || tvRelease) && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {downloadAssets.map(({ asset, arch, repoUrl, repoName }, index) => (
              <AnimatedCard key={asset.name} delay={0.4 + index * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  className="h-full"
                >
                  <Card className={`h-full flex flex-col ${arch.recommended ? "ring-2 ring-primary" : ""}`}>
                    <CardHeader className="shrink-0">
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.4 }}
                          >
                            <Smartphone className="h-5 w-5" />
                          </motion.div>
                          {arch.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {arch.isLatest && (
                            <Badge variant="secondary" className="text-xs">Latest</Badge>
                          )}
                          {arch.recommended && (
                            <Badge variant="default" className="text-xs">Recommended</Badge>
                          )}
                        </div>
                      </CardTitle>
                      <CardDescription className="min-h-12 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div>Size: {formatFileSize(asset.size)}</div>
                          <div className="text-xs truncate">{asset.name}</div>
                          {repoUrl && (
                            <motion.a
                              href={repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ExternalLink className="h-3 w-3" />
                              {repoName} Repo
                            </motion.a>
                          )}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grow flex flex-col justify-end">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-auto"
                      >
                        {arch.platform === 'Linux' ? (
                          <Button 
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                            onClick={() => handleLinuxDownload(asset.name, asset.browser_download_url)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {arch.buttonText}
                          </Button>
                        ) : (
                          <Button 
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                            asChild
                          >
                            <a 
                              href={asset.browser_download_url}
                              download
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              {arch.buttonText}
                            </a>
                          </Button>
                        )}
                      </motion.div>
                      {arch.recommended && (
                        <motion.p 
                          className="text-xs text-muted-foreground mt-2 text-center min-h-10 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                        >
                          {arch.description}
                        </motion.p>
                      )}
                      {!arch.recommended && (
                        <div className="min-h-10" />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedCard>
            ))}
          </div>
        )}

        {/* Info Card */}
        <AnimatedCard delay={0.8}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Installation Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium">Which version should I download?</h4>
                  <ul className="mt-1 space-y-1 text-muted-foreground ml-4">
                    <li>• <strong>Android TV</strong> - Optimized for Android TV devices</li>
                    <li>• <strong>ARM64</strong> - For most modern Android phones/tablets</li>
                    <li>• <strong>ARM32</strong> - For older Android devices</li>
                    <li>• <strong>Linux (Debian)</strong> - For Debian/Ubuntu Linux systems</li>
                    <li>• <strong>Linux (Portable)</strong> - Portable Linux build (.zip)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium">Installation steps (Android):</h4>
                  <ol className="mt-1 space-y-1 text-muted-foreground ml-4">
                    <li>1. Enable &quot;Unknown sources&quot; in your Android settings</li>
                    <li>2. Download the appropriate APK file</li>
                    <li>3. Open the downloaded file and follow installation prompts</li>
                    <li>4. Launch ScreenScape and enjoy!</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium">Installation steps (Linux):</h4>
                  <ol className="mt-1 space-y-1 text-muted-foreground ml-4">
                    <li>• <strong>.deb</strong> - Double-click or use <code className="text-xs bg-muted px-1 py-0.5 rounded">sudo dpkg -i screenscapetv_*.deb</code></li>
                    <li>• <strong>.zip</strong> - Extract and run the executable</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Buy Me a Coffee Card */}
        <AnimatedCard delay={1.2}>
          <Card className="overflow-hidden border-2 border-orange-200 bg-linear-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 dark:border-orange-800">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-orange-600" />
                  <span className="bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Support the Developer
                  </span>
                  <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700 hover:bg-orange-200">
                    ☕
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Enjoying ScreenScape? Consider buying me a coffee to support continued development!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg">
                  <a 
                    href="https://buymeacoffee.com/hunternishq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Coffee className="h-5 w-5" />
                    Buy me a coffee
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Every coffee helps fuel late-night coding sessions! 🚀
                </p>
              </CardContent>
            </motion.div>
          </Card>
        </AnimatedCard>
      </div>

      {/* API Dashboard Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Total API Calls
            </span>
            <span className="text-3xl font-bold">
              {stats?.totalApiCalls.toLocaleString() || "0"}
            </span>
            <span className="text-xs text-muted-foreground">
              Out of {stats?.totalQuota || 0} quota
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Active API Keys
            </span>
            <span className="text-3xl font-bold">
              {stats?.activeKeys || 0}
            </span>
            <span className="text-xs text-muted-foreground">
              1 key maximum
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Quota Usage
            </span>
            <span className="text-3xl font-bold">
              {stats?.successRate || "0.0"}%
            </span>
            <span className="text-xs text-muted-foreground">
              Last used {getTimeAgo(stats?.lastUsed || null)}
            </span>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">API Key Status</p>
              <p className="text-sm text-muted-foreground">
                {stats?.activeKeys ? `${stats.activeKeys} active key` : "No API keys"}
              </p>
            </div>
            <span className={`text-sm ${stats?.activeKeys ? "text-green-600" : "text-yellow-600"}`}>
              {stats?.activeKeys ? "Active" : "Create Key"}
            </span>
          </div>
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">Request Count</p>
              <p className="text-sm text-muted-foreground">
                {stats?.totalApiCalls || 0} requests made
              </p>
            </div>
            <span className="text-sm text-blue-600">
              {stats?.totalQuota ? Math.round((stats.totalApiCalls / stats.totalQuota) * 100) : 0}% used
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Last Activity</p>
              <p className="text-sm text-muted-foreground">
                {getTimeAgo(stats?.lastUsed || null)}
              </p>
            </div>
            <span className="text-sm text-green-600">
              {stats?.lastUsed ? "Recent" : "No activity"}
            </span>
          </div>
        </div>
      </Card>

      {/* Linux Dependency Dialog */}
      <Dialog open={linuxDialogOpen} onOpenChange={setLinuxDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              Install Dependencies First
            </DialogTitle>
            <DialogDescription>
              Before installing ScreenScape on Linux, please install the required dependency.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Run this command in your terminal:
              </p>
              <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                <Terminal className="h-4 w-4 text-muted-foreground shrink-0" />
                <code className="flex-1 font-mono text-sm">sudo apt install libmpv2</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyCommand}
                  className="shrink-0 h-8 w-8 p-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={handleActualDownload}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download {selectedLinuxAsset?.name}
            </Button>
            <Button
              variant="outline"
              onClick={() => setLinuxDialogOpen(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
