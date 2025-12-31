import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getUserTags } from '../services/tagService';
import { getUserItems } from '../services/itemService';
import type { Tag } from '../types';

interface TagWithCount {
  tag: Tag;
  count: number;
  size: 'sm' | 'md' | 'lg' | 'xl';
}

const TagCloud = () => {
  const [tagData, setTagData] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const tagCloudRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (tagCloudRef.current) {
      observer.observe(tagCloudRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (user && isVisible) {
      // Only load when component is visible
      loadTagCloud();
    }
  }, [user, isVisible]);

  const loadTagCloud = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load tags and items in parallel
      const [tags, items] = await Promise.all([
        getUserTags(user.uid),
        getUserItems(user.uid)
      ]);

      // Count tag usage efficiently
      const tagCounts = new Map<string, number>();
      
      items.forEach(item => {
        if (item.tags && item.tags.length > 0) {
          item.tags.forEach(tagId => {
            tagCounts.set(tagId, (tagCounts.get(tagId) || 0) + 1);
          });
        }
      });

      // Create tag data with counts and sizes
      const maxCount = Math.max(...Array.from(tagCounts.values()), 1);
      const tagWithCounts: TagWithCount[] = tags
        .map(tag => {
          const count = tagCounts.get(tag.id) || 0;
          return {
            tag,
            count,
            size: getTagSize(count, maxCount)
          };
        })
        .filter(tagData => tagData.count > 0) // Only show tags that are actually used
        .sort((a, b) => b.count - a.count); // Sort by usage count

      setTagData(tagWithCounts);
    } catch (error) {
      console.error('Error loading tag cloud:', error);
      // Fail silently - tag cloud is a nice-to-have feature
    } finally {
      setLoading(false);
    }
  };

  const getTagSize = (count: number, maxCount: number): 'sm' | 'md' | 'lg' | 'xl' => {
    const ratio = count / maxCount;
    if (ratio >= 0.8) return 'xl';
    if (ratio >= 0.6) return 'lg';
    if (ratio >= 0.3) return 'md';
    return 'sm';
  };

  // Helper function to determine if text should be white or black based on background color
  const getTextColor = (backgroundColor: string): string => {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white text for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  const getFontSize = (size: 'sm' | 'md' | 'lg' | 'xl'): string => {
    switch (size) {
      case 'xl': return '1.4rem';
      case 'lg': return '1.2rem';
      case 'md': return '1rem';
      case 'sm': return '0.85rem';
      default: return '1rem';
    }
  };

  const handleTagClick = (tag: Tag) => {
    // Navigate to items page with tag filter (not text search)
    navigate(`/items?tagId=${encodeURIComponent(tag.id)}`);
  };

  return (
    <div className="tag-cloud" ref={tagCloudRef}>
      <h6 className="text-muted mb-3">🏷️ Your Tags</h6>
      {!isVisible ? (
        <div className="text-center text-muted">
          <small>Scroll down to load tags...</small>
        </div>
      ) : loading ? (
        <div className="text-center text-muted">
          <small>Loading tags...</small>
        </div>
      ) : tagData.length === 0 ? (
        <div className="text-center text-muted">
          <small>No tags in use yet. Add some tags to your items to see them here!</small>
        </div>
      ) : (
        <>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {tagData.map(({ tag, count, size }) => (
              <span
                key={tag.id}
                style={{
                  backgroundColor: tag.color,
                  color: getTextColor(tag.color),
                  fontSize: getFontSize(size),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontWeight: size === 'xl' || size === 'lg' ? 'bold' : 'normal',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'inline-block',
                  margin: '0.125rem'
                }}
                className="tag-cloud-item"
                onClick={() => handleTagClick(tag)}
                title={`${tag.name} (${count} item${count !== 1 ? 's' : ''}) - Click to view items`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                {tag.name} {count > 1 && <small>({count})</small>}
              </span>
            ))}
          </div>
          <div className="text-center mt-2">
            <small className="text-muted">
              Click any tag to search for items • {tagData.length} tag{tagData.length !== 1 ? 's' : ''} in use
            </small>
          </div>
        </>
      )}
    </div>
  );
};

export default TagCloud;