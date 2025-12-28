/**
 * Global Search Service
 * Provides comprehensive search across containers and items
 */

import { getUserContainers } from './containerService';
import { getContainerItems } from './itemService';
import type { ContainerWithSharing } from '../types';

export interface SearchResult {
  type: 'container' | 'item';
  id: string;
  name: string;
  description?: string;
  containerId?: string; // For items, reference to parent container
  containerName?: string; // For items, name of parent container
  isShared?: boolean;
  sharedByName?: string;
  imageUrl?: string;
  location?: string; // For containers
}

export interface GroupedSearchResults {
  containers: SearchResult[];
  itemsByContainer: Record<string, {
    container: SearchResult;
    items: SearchResult[];
  }>;
}

/**
 * Perform global search across all accessible containers and items
 */
export const performGlobalSearch = async (
  userId: string,
  searchTerm: string
): Promise<GroupedSearchResults> => {
  if (!searchTerm.trim()) {
    return {
      containers: [],
      itemsByContainer: {}
    };
  }

  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  try {
    // Get all containers user has access to (owned + shared)
    const userContainers = await getUserContainers(userId);
    
    // Search containers
    const matchingContainers = userContainers.filter(container => 
      container.name.toLowerCase().includes(normalizedSearchTerm) ||
      (container.description && container.description.toLowerCase().includes(normalizedSearchTerm)) ||
      (container.location && container.location.toLowerCase().includes(normalizedSearchTerm))
    );

    // Convert containers to search results
    const containerResults: SearchResult[] = matchingContainers.map(container => ({
      type: 'container' as const,
      id: container.id,
      name: container.name,
      description: container.description,
      location: container.location,
      imageUrl: container.imageUrl,
      isShared: (container as ContainerWithSharing).isShared,
      sharedByName: (container as ContainerWithSharing).sharedByName
    }));

    // Search items in all accessible containers
    const itemsByContainer: Record<string, {
      container: SearchResult;
      items: SearchResult[];
    }> = {};

    await Promise.all(
      userContainers.map(async (container) => {
        try {
          const containerItems = await getContainerItems(container.id);
          
          const matchingItems = containerItems.filter(item =>
            item.name.toLowerCase().includes(normalizedSearchTerm) ||
            (item.description && item.description.toLowerCase().includes(normalizedSearchTerm)) ||
            (item.brand && item.brand.toLowerCase().includes(normalizedSearchTerm)) ||
            (item.model && item.model.toLowerCase().includes(normalizedSearchTerm)) ||
            (item.serialNumber && item.serialNumber.toLowerCase().includes(normalizedSearchTerm))
          );

          if (matchingItems.length > 0) {
            const containerResult: SearchResult = {
              type: 'container' as const,
              id: container.id,
              name: container.name,
              description: container.description,
              location: container.location,
              imageUrl: container.imageUrl,
              isShared: (container as ContainerWithSharing).isShared,
              sharedByName: (container as ContainerWithSharing).sharedByName
            };

            const itemResults: SearchResult[] = matchingItems.map(item => ({
              type: 'item' as const,
              id: item.id,
              name: item.name,
              description: item.description,
              containerId: item.containerId,
              containerName: container.name,
              imageUrl: item.imageUrl,
              isShared: (container as ContainerWithSharing).isShared,
              sharedByName: (container as ContainerWithSharing).sharedByName
            }));

            itemsByContainer[container.id] = {
              container: containerResult,
              items: itemResults
            };
          }
        } catch (error) {
          console.warn(`Error searching items in container ${container.id}:`, error);
          // Continue with other containers
        }
      })
    );

    return {
      containers: containerResults,
      itemsByContainer
    };

  } catch (error) {
    console.error('Error performing global search:', error);
    throw new Error('Unable to perform search. Please try again.');
  }
};

/**
 * Get quick search suggestions (limited results for dropdown)
 */
export const getSearchSuggestions = async (
  userId: string,
  searchTerm: string,
  maxResults: number = 10
): Promise<SearchResult[]> => {
  const results = await performGlobalSearch(userId, searchTerm);
  
  const suggestions: SearchResult[] = [];
  
  // Add container results first
  suggestions.push(...results.containers.slice(0, Math.floor(maxResults / 2)));
  
  // Add item results
  const remainingSlots = maxResults - suggestions.length;
  let itemCount = 0;
  
  for (const containerGroup of Object.values(results.itemsByContainer)) {
    if (itemCount >= remainingSlots) break;
    
    const itemsToAdd = containerGroup.items.slice(0, remainingSlots - itemCount);
    suggestions.push(...itemsToAdd);
    itemCount += itemsToAdd.length;
  }
  
  return suggestions;
};

/**
 * Search within a specific container
 */
export const searchInContainer = async (
  containerId: string,
  searchTerm: string
): Promise<SearchResult[]> => {
  if (!searchTerm.trim()) {
    return [];
  }

  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  try {
    const containerItems = await getContainerItems(containerId);
    
    const matchingItems = containerItems.filter(item =>
      item.name.toLowerCase().includes(normalizedSearchTerm) ||
      (item.description && item.description.toLowerCase().includes(normalizedSearchTerm)) ||
      (item.brand && item.brand.toLowerCase().includes(normalizedSearchTerm)) ||
      (item.model && item.model.toLowerCase().includes(normalizedSearchTerm)) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(normalizedSearchTerm))
    );

    return matchingItems.map(item => ({
      type: 'item' as const,
      id: item.id,
      name: item.name,
      description: item.description,
      containerId: item.containerId,
      imageUrl: item.imageUrl
    }));

  } catch (error) {
    console.error('Error searching in container:', error);
    throw new Error('Unable to search container. Please try again.');
  }
};