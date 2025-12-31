/**
 * Offline Cache Service for PWA functionality
 * 
 * Provides safe caching of user account status with security considerations:
 * - Short TTL to prevent stale data issues
 * - Network-first strategy when online
 * - Cache-first fallback when offline
 * - Automatic cache invalidation
 */

import type { UserProfile, ContainerWithSharing, Item } from '../types';

interface CachedUserProfile {
  profile: UserProfile | null;
  registrationRequest: any | null;
  timestamp: number;
  userId: string;
  version: number; // For cache schema versioning
}

interface CachedAccountStatus {
  hasProfile: boolean;
  status: 'approved' | 'pending' | 'denied' | 'admin';
  displayName?: string;
  email?: string;
  timestamp: number;
  userId: string;
  version: number;
}

interface CachedContainers {
  containers: ContainerWithSharing[];
  timestamp: number;
  userId: string;
  version: number;
}

interface CachedItems {
  items: Item[];
  timestamp: number;
  containerId: string;
  version: number;
}

const CACHE_VERSION = 1;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes for containers/items
const ACCOUNT_STATUS_TTL = 2 * 60 * 60 * 1000; // 2 hours for account status (performance optimization)
const PROFILE_TTL = 2 * 60 * 60 * 1000; // 2 hours for profile data
const SESSION_VALIDATED_KEY = 'hearth-session-validated';
const PROFILE_CACHE_KEY = 'hearth-profile-cache';
const STATUS_CACHE_KEY = 'hearth-status-cache';
const CONTAINERS_CACHE_KEY = 'hearth-containers-cache';
const ITEMS_CACHE_KEY_PREFIX = 'hearth-items-cache-';

class OfflineCacheService {
  /**
   * Check if we're currently online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Check if cached data is still valid (with different TTLs for different data types)
   */
  private isCacheValid(timestamp: number, ttl: number = CACHE_TTL): boolean {
    return Date.now() - timestamp < ttl;
  }

  /**
   * Check if user has been validated this session (performance optimization)
   */
  isSessionValidated(userId: string): boolean {
    try {
      const sessionData = sessionStorage.getItem(SESSION_VALIDATED_KEY);
      if (!sessionData) return false;
      
      const data = JSON.parse(sessionData);
      return data.userId === userId && data.timestamp > Date.now() - (4 * 60 * 60 * 1000); // 4 hour session
    } catch {
      return false;
    }
  }

  /**
   * Mark user as validated for this session
   */
  markSessionValidated(userId: string): void {
    try {
      const sessionData = {
        userId,
        timestamp: Date.now()
      };
      sessionStorage.setItem(SESSION_VALIDATED_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.warn('Failed to mark session as validated:', error);
    }
  }

  /**
   * Get cached user profile if valid
   */
  getCachedProfile(userId: string): CachedUserProfile | null {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (!cached) return null;

      const data: CachedUserProfile = JSON.parse(cached);
      
      // Check version, user ID, and TTL (use longer TTL for profile data)
      if (
        data.version !== CACHE_VERSION ||
        data.userId !== userId ||
        !this.isCacheValid(data.timestamp, PROFILE_TTL)
      ) {
        this.clearProfileCache();
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Error reading profile cache:', error);
      this.clearProfileCache();
      return null;
    }
  }

  /**
   * Cache user profile data
   */
  cacheProfile(
    userId: string, 
    profile: UserProfile | null, 
    registrationRequest: any | null
  ): void {
    try {
      const cacheData: CachedUserProfile = {
        profile,
        registrationRequest,
        timestamp: Date.now(),
        userId,
        version: CACHE_VERSION,
      };

      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cacheData));
      
      // Also cache simplified account status for quick access
      this.cacheAccountStatus(userId, profile, registrationRequest);
    } catch (error) {
      console.warn('Error caching profile:', error);
    }
  }

  /**
   * Cache simplified account status for quick offline access
   */
  private cacheAccountStatus(
    userId: string,
    profile: UserProfile | null,
    registrationRequest: any | null
  ): void {
    try {
      let status: CachedAccountStatus['status'] = 'pending';
      
      if (profile) {
        status = profile.isAdmin ? 'admin' : 'approved';
      } else if (registrationRequest) {
        status = registrationRequest.status || 'pending';
      }

      const statusData: CachedAccountStatus = {
        hasProfile: !!profile,
        status,
        displayName: profile?.displayName || registrationRequest?.displayName,
        email: profile?.email || registrationRequest?.email,
        timestamp: Date.now(),
        userId,
        version: CACHE_VERSION,
      };

      localStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(statusData));
    } catch (error) {
      console.warn('Error caching account status:', error);
    }
  }

  /**
   * Get cached account status for offline use
   */
  getCachedAccountStatus(userId: string): CachedAccountStatus | null {
    try {
      const cached = localStorage.getItem(STATUS_CACHE_KEY);
      if (!cached) return null;

      const data: CachedAccountStatus = JSON.parse(cached);
      
      // Check version, user ID, and TTL (use longer TTL for account status)
      if (
        data.version !== CACHE_VERSION ||
        data.userId !== userId ||
        !this.isCacheValid(data.timestamp, ACCOUNT_STATUS_TTL)
      ) {
        this.clearStatusCache();
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Error reading status cache:', error);
      this.clearStatusCache();
      return null;
    }
  }

  /**
   * Clear profile cache
   */
  clearProfileCache(): void {
    try {
      localStorage.removeItem(PROFILE_CACHE_KEY);
    } catch (error) {
      console.warn('Error clearing profile cache:', error);
    }
  }

  /**
   * Clear status cache
   */
  clearStatusCache(): void {
    try {
      localStorage.removeItem(STATUS_CACHE_KEY);
    } catch (error) {
      console.warn('Error clearing status cache:', error);
    }
  }

  /**
   * Clear all caches (on logout, manual refresh, etc.)
   */
  clearAllCaches(): void {
    this.clearProfileCache();
    this.clearStatusCache();
    this.clearContainersCache();
    this.clearAllItemsCaches();
  }

  /**
   * Cache containers data
   */
  cacheContainers(userId: string, containers: ContainerWithSharing[]): void {
    try {
      const cacheData: CachedContainers = {
        containers,
        timestamp: Date.now(),
        userId,
        version: CACHE_VERSION,
      };

      localStorage.setItem(CONTAINERS_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error caching containers:', error);
    }
  }

  /**
   * Get cached containers if valid
   */
  getCachedContainers(userId: string): ContainerWithSharing[] | null {
    try {
      const cached = localStorage.getItem(CONTAINERS_CACHE_KEY);
      if (!cached) return null;

      const data: CachedContainers = JSON.parse(cached);
      
      // Check version, user ID, and TTL
      if (
        data.version !== CACHE_VERSION ||
        data.userId !== userId ||
        !this.isCacheValid(data.timestamp)
      ) {
        this.clearContainersCache();
        return null;
      }

      return data.containers;
    } catch (error) {
      console.warn('Error reading containers cache:', error);
      this.clearContainersCache();
      return null;
    }
  }

  /**
   * Clear containers cache
   */
  clearContainersCache(): void {
    try {
      localStorage.removeItem(CONTAINERS_CACHE_KEY);
    } catch (error) {
      console.warn('Error clearing containers cache:', error);
    }
  }

  /**
   * Cache items data for a specific container (with smart size management)
   */
  cacheItems(containerId: string, items: Item[]): void {
    try {
      // First, try caching with full data
      const cacheData: CachedItems = {
        items,
        timestamp: Date.now(),
        containerId,
        version: CACHE_VERSION,
      };

      const cacheKey = `${ITEMS_CACHE_KEY_PREFIX}${containerId}`;
      const fullDataSize = JSON.stringify(cacheData).length;
      
      // If data is reasonable size (< 2MB), cache it fully
      if (fullDataSize < 2 * 1024 * 1024) {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log(`💾 Cached ${items.length} items for container ${containerId} (${Math.round(fullDataSize/1024)}KB)`);
        return;
      }

      // If too large, cache without images but keep other data
      console.log(`⚠️ Container ${containerId} data too large (${Math.round(fullDataSize/1024)}KB), caching without images`);
      
      const itemsWithoutImages = items.map(item => ({
        ...item,
        imageUrl: item.imageUrl ? '[image-cached-separately]' : undefined
      }));

      const reducedCacheData: CachedItems = {
        items: itemsWithoutImages,
        timestamp: Date.now(),
        containerId,
        version: CACHE_VERSION,
      };

      localStorage.setItem(cacheKey, JSON.stringify(reducedCacheData));
      console.log(`💾 Cached ${items.length} items (no images) for container ${containerId}`);
      
    } catch (error) {
      console.warn(`Error caching items for container ${containerId}:`, error);
      
      // If quota exceeded, try caching only essential data
      try {
        const essentialItems = items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          containerId: item.containerId,
          tags: item.tags || [],
          userId: item.userId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));

        const essentialCacheData: CachedItems = {
          items: essentialItems,
          timestamp: Date.now(),
          containerId,
          version: CACHE_VERSION,
        };

        const cacheKey = `${ITEMS_CACHE_KEY_PREFIX}${containerId}`;
        localStorage.setItem(cacheKey, JSON.stringify(essentialCacheData));
        console.log(`💾 Cached ${items.length} items (essential only) for container ${containerId}`);
      } catch (essentialError) {
        console.error(`Failed to cache even essential items for container ${containerId}:`, essentialError);
      }
    }
  }

  /**
   * Get cached items for a specific container if valid (silent version for counts)
   */
  getCachedItemsCount(containerId: string): number {
    try {
      const cacheKey = `${ITEMS_CACHE_KEY_PREFIX}${containerId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return 0;

      const data: CachedItems = JSON.parse(cached);
      
      // Check version, container ID, and TTL
      const isValid = data.version === CACHE_VERSION && 
                     data.containerId === containerId && 
                     this.isCacheValid(data.timestamp);
      
      if (!isValid) {
        return 0;
      }

      return data.items?.length || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get cached items for a specific container if valid
   */
  getCachedItems(containerId: string): Item[] | null {
    try {
      const cacheKey = `${ITEMS_CACHE_KEY_PREFIX}${containerId}`;
      const cached = localStorage.getItem(cacheKey);
      
      console.log(`🔍 Checking cache for container ${containerId}, key: ${cacheKey}, found: ${!!cached}`);
      
      if (!cached) return null;

      const data: CachedItems = JSON.parse(cached);
      
      // Check version, container ID, and TTL
      const isValid = data.version === CACHE_VERSION && 
                     data.containerId === containerId && 
                     this.isCacheValid(data.timestamp);
      
      console.log(`🔍 Cache validation for ${containerId}:`, {
        version: data.version === CACHE_VERSION,
        containerId: data.containerId === containerId,
        ttl: this.isCacheValid(data.timestamp),
        age: Math.floor((Date.now() - data.timestamp) / 1000 / 60) + ' minutes',
        itemCount: data.items?.length || 0
      });
      
      if (!isValid) {
        console.log(`🗑️ Clearing invalid cache for container ${containerId}`);
        this.clearItemsCache(containerId);
        return null;
      }

      console.log(`✅ Using valid cache for container ${containerId} with ${data.items.length} items`);
      return data.items;
    } catch (error) {
      console.warn('Error reading items cache:', error);
      this.clearItemsCache(containerId);
      return null;
    }
  }

  /**
   * Clear items cache for a specific container
   */
  clearItemsCache(containerId: string): void {
    try {
      localStorage.removeItem(`${ITEMS_CACHE_KEY_PREFIX}${containerId}`);
    } catch (error) {
      console.warn('Error clearing items cache:', error);
    }
  }

  /**
   * Clear all items caches
   */
  clearAllItemsCaches(): void {
    try {
      // Get all localStorage keys and remove items caches
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(ITEMS_CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Error clearing all items caches:', error);
    }
  }

  /**
   * Check if cached data is recent (for performance optimization)
   */
  isCacheRecent(containerId: string, maxAgeMinutes: number = 5): boolean {
    try {
      const cacheKey = `${ITEMS_CACHE_KEY_PREFIX}${containerId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return false;

      const data: CachedItems = JSON.parse(cached);
      const ageMinutes = (Date.now() - data.timestamp) / (1000 * 60);
      
      return ageMinutes < maxAgeMinutes;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if cached containers are recent (for performance optimization)
   */
  isCacheRecentContainers(userId: string, maxAgeMinutes: number = 2): boolean {
    try {
      const cached = localStorage.getItem(CONTAINERS_CACHE_KEY);
      
      if (!cached) return false;

      const data: CachedContainers = JSON.parse(cached);
      
      if (data.userId !== userId) return false;
      
      const ageMinutes = (Date.now() - data.timestamp) / (1000 * 60);
      
      return ageMinutes < maxAgeMinutes;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if we should use cached data (offline or performance optimization)
   */
  shouldUseCachedData(userId: string): boolean {
    // Always use cache if offline
    if (!this.isOnline()) {
      return true;
    }

    // Use cache if valid for performance (but don't show offline indicator)
    const cachedStatus = this.getCachedAccountStatus(userId);
    return cachedStatus !== null;
  }

  /**
   * Check if we're in offline mode (for UI indicators)
   */
  isInOfflineMode(): boolean {
    return !this.isOnline();
  }

  /**
   * Get cache age in minutes for UI display
   */
  getCacheAge(userId: string): number | null {
    const cached = this.getCachedAccountStatus(userId);
    if (!cached) return null;

    return Math.floor((Date.now() - cached.timestamp) / (1000 * 60));
  }

  /**
   * Force cache refresh (for manual refresh button)
   */
  forceCacheRefresh(): void {
    this.clearAllCaches();
  }

  /**
   * Debug method to check what's in cache
   */
  debugCache(): void {
    console.log('🔍 Cache Debug Info:');
    console.log('Online status:', this.isOnline());
    
    // Check all localStorage keys
    const cacheKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('hearth-') || key.includes('cache'))) {
        cacheKeys.push(key);
      }
    }
    
    console.log('Cache keys found:', cacheKeys);
    
    // Check specific item caches
    cacheKeys.forEach(key => {
      if (key.startsWith(ITEMS_CACHE_KEY_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const containerId = key.replace(ITEMS_CACHE_KEY_PREFIX, '');
          const age = Math.floor((Date.now() - data.timestamp) / 1000 / 60);
          console.log(`📦 Container ${containerId}: ${data.items?.length || 0} items, ${age}min old`);
        } catch (e) {
          console.log(`❌ Invalid cache data for ${key}`);
        }
      }
    });
  }
}

export const offlineCacheService = new OfflineCacheService();

// Add debug method to window in development
if (import.meta.env.DEV) {
  (window as any).debugCache = () => offlineCacheService.debugCache();
  (window as any).clearCache = () => {
    offlineCacheService.clearAllCaches();
    console.log('🗑️ All caches cleared!');
  };
  console.log('🔧 Debug helpers available: debugCache(), clearCache()');
}