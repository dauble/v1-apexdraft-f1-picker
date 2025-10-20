import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Driver } from '@shared/types';
import { DriverCard, DriverCardSkeleton } from '@/components/DriverCard';
import { DraftBoard } from '@/components/DraftBoard';
import { DriverStatsModal } from '@/components/DriverStatsModal';
import { Button } from '@/components/ui/button';
import { useDraftStore } from '@/hooks/useDraftStore';
import { Toaster } from '@/components/ui/sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const queryClient = new QueryClient();
async function fetchDrivers(): Promise<Driver[]> {
  return api<Driver[]>('/api/drivers');
}
function ApexDraftDashboard() {
  const [isBoardOpen, setIsBoardOpen] = React.useState(false);
  const [selectedDriver, setSelectedDriver] = React.useState<Driver | null>(null);
  const [sortBy, setSortBy] = React.useState('points');
  const draftedDriversCount = useDraftStore((s) => s.draftedDrivers.length);
  const { data: drivers, isLoading, isError, error } = useQuery<Driver[], Error>({
    queryKey: ['drivers'],
    queryFn: fetchDrivers,
  });
  const handleViewStats = (driver: Driver) => {
    setSelectedDriver(driver);
  };
  const sortedDrivers = React.useMemo(() => {
    if (!drivers) return [];
    const driversCopy = [...drivers];
    switch (sortBy) {
      case 'points':
        return driversCopy.sort((a, b) => (b.points ?? -1) - (a.points ?? -1));
      case 'name':
        return driversCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'team':
        return driversCopy.sort((a, b) => a.teamName.localeCompare(b.teamName));
      default:
        return driversCopy;
    }
  }, [drivers, sortBy]);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-black text-primary tracking-widest"
            >
              APEXDRAFT
            </motion.h1>
            <Button
              onClick={() => setIsBoardOpen(true)}
              variant="outline"
              className="font-bold rounded-md border-2 transition-all duration-300 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-glow-red relative"
            >
              <Users className="mr-2 h-4 w-4" />
              DRAFT BOARD
              {draftedDriversCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground animate-pulse">
                  {draftedDriversCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-28 md:pt-32 lg:pt-36">
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <DriverCardSkeleton key={i} />
              ))}
            </div>
          )}
          {isError && (
            <div className="flex flex-col items-center justify-center text-center text-destructive py-20">
              <AlertTriangle className="w-16 h-16 mb-4" />
              <h2 className="text-2xl font-bold mb-2">ERROR: FAILED TO LOAD DATA</h2>
              <p className="text-muted-foreground max-w-md">{error?.message || 'Could not fetch driver data from the server. Please check your connection or try again later.'}</p>
            </div>
          )}
          <AnimatePresence>
            {sortedDrivers && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {sortedDrivers.map((driver) => (
                  <DriverCard key={driver.id} driver={driver} onViewStats={handleViewStats} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <footer className="text-center py-6 text-muted-foreground/50 text-sm mt-12">
        Built with ❤��� at Cloudflare
      </footer>
      <DraftBoard open={isBoardOpen} onOpenChange={setIsBoardOpen} />
      <DriverStatsModal driver={selectedDriver} open={!!selectedDriver} onOpenChange={(isOpen) => !isOpen && setSelectedDriver(null)} />
      <Toaster
        toastOptions={{
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </div>
  );
}
export function HomePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApexDraftDashboard />
    </QueryClientProvider>
  );
}