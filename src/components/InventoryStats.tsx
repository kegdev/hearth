import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { getUserItems } from '../services/itemService';
import { getUserContainers } from '../services/containerService';
import { getUserTags } from '../services/tagService';
import type { Item } from '../types';

// Cache stats for 5 minutes to avoid repeated API calls
const STATS_CACHE_KEY = 'hearth-inventory-stats';
const STATS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedStats {
  stats: {
    totalItems: number;
    totalContainers: number;
    totalTags: number;
    totalValue: number;
  };
  timestamp: number;
  userId: string;
}

const InventoryStats = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalContainers: 0,
    totalTags: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      loadStatsWithCache();
    }
  }, [user]);

  const getCachedStats = (): CachedStats | null => {
    try {
      const cached = localStorage.getItem(STATS_CACHE_KEY);
      if (!cached) return null;
      
      const parsedCache: CachedStats = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is valid and for the correct user
      if (
        parsedCache.userId === user?.uid &&
        now - parsedCache.timestamp < STATS_CACHE_TTL
      ) {
        return parsedCache;
      }
      
      // Cache is stale or for different user
      localStorage.removeItem(STATS_CACHE_KEY);
      return null;
    } catch (error) {
      console.warn('Error reading stats cache:', error);
      localStorage.removeItem(STATS_CACHE_KEY);
      return null;
    }
  };

  const setCachedStats = (statsData: CachedStats['stats']) => {
    if (!user) return;
    
    try {
      const cacheData: CachedStats = {
        stats: statsData,
        timestamp: Date.now(),
        userId: user.uid
      };
      localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error caching stats:', error);
    }
  };

  const loadStatsWithCache = async () => {
    if (!user) return;
    
    // Try to get cached stats first
    const cachedStats = getCachedStats();
    
    if (cachedStats) {
      console.log('📊 Using cached inventory stats for performance');
      setStats(cachedStats.stats);
      setLoading(false);
      
      // Background refresh if cache is older than 2 minutes
      const cacheAge = Date.now() - cachedStats.timestamp;
      if (cacheAge > 2 * 60 * 1000) {
        console.log('📊 Background refreshing stats cache');
        backgroundLoadStats();
      }
      return;
    }
    
    // No cache available, load normally
    await loadStats();
  };

  const backgroundLoadStats = async () => {
    if (!user) return;
    
    try {
      // Load in background without showing loading state
      const [items, containers, tags] = await Promise.all([
        getUserItems(user.uid),
        getUserContainers(user.uid),
        getUserTags(user.uid)
      ]);
      
      const totalValue = items.reduce((sum: number, item: Item) => {
        const itemValue = item.currentValue || item.purchasePrice || 0;
        return sum + itemValue;
      }, 0);
      
      const newStats = {
        totalItems: items.length,
        totalContainers: containers.length,
        totalTags: tags.length,
        totalValue,
      };
      
      setStats(newStats);
      setCachedStats(newStats);
      console.log('📊 Stats refreshed in background');
    } catch (err: any) {
      console.warn('Background stats refresh failed:', err);
      // Don't update UI on background failure
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [items, containers, tags] = await Promise.all([
        getUserItems(user.uid),
        getUserContainers(user.uid),
        getUserTags(user.uid)
      ]);
      
      // Calculate total value from items (current value takes priority over purchase price)
      const totalValue = items.reduce((sum: number, item: Item) => {
        const itemValue = item.currentValue || item.purchasePrice || 0;
        return sum + itemValue;
      }, 0);
      
      const newStats = {
        totalItems: items.length,
        totalContainers: containers.length,
        totalTags: tags.length,
        totalValue,
      };
      
      setStats(newStats);
      setCachedStats(newStats);
    } catch (err: any) {
      console.error('Error loading stats:', err);
      // Don't show error - just keep stats at 0
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return null; // Don't show stats for non-logged-in users or while loading
  }

  return (
    <footer className="border-top py-4 mt-auto bg-light">
      <Container>
        <Row className="text-center">
          <Col xs={6} md={3} className="mb-2 mb-md-0">
            <div className="text-muted small">Items</div>
            <div className="h5 mb-0">{stats.totalItems.toLocaleString()}</div>
          </Col>
          <Col xs={6} md={3} className="mb-2 mb-md-0">
            <div className="text-muted small">Containers</div>
            <div className="h5 mb-0">{stats.totalContainers.toLocaleString()}</div>
          </Col>
          <Col xs={6} md={3} className="mb-2 mb-md-0">
            <div className="text-muted small">Tags</div>
            <div className="h5 mb-0">{stats.totalTags.toLocaleString()}</div>
          </Col>
          <Col xs={6} md={3} className="mb-2 mb-md-0">
            <div className="text-muted small">Total Value</div>
            <div className="h5 mb-0">
              {stats.totalValue > 0 
                ? `$${stats.totalValue.toLocaleString()}` 
                : '—'
              }
            </div>
          </Col>
        </Row>

      </Container>
    </footer>
  );
};

export default InventoryStats;