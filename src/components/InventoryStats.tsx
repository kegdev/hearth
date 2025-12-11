import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { getUserItems } from '../services/itemService';
import { getUserContainers } from '../services/containerService';
import { getUserTags } from '../services/tagService';
import type { Item } from '../types';

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
      loadStats();
    }
  }, [user]);

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
      
      setStats({
        totalItems: items.length,
        totalContainers: containers.length,
        totalTags: tags.length,
        totalValue,
      });
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
    <footer className="border-top py-4 mt-auto" style={{ backgroundColor: 'var(--bs-light)' }}>
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