import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { createContainer, getUserContainers, deleteContainer, updateContainer } from '../services/containerService';
import { getUserContainerPermission } from '../services/containerSharingService';
import { getContainerItems } from '../services/itemService';
import { offlineCacheService } from '../services/offlineCacheService';
import { useNotifications } from '../components/NotificationSystem';
import QRCodeModal from '../components/QRCodeModal';
import ImageUpload from '../components/ImageUpload';
import type { Container as ContainerType, CreateContainerData, SharePermission, ContainerWithSharing } from '../types';

const ContainersPage = () => {
  const [containers, setContainers] = useState<ContainerWithSharing[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [containerPermissions, setContainerPermissions] = useState<Record<string, SharePermission | null>>({});
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<ContainerType | null>(null);
  const [containerToDelete, setContainerToDelete] = useState<ContainerType | null>(null);
  const [containerToEdit, setContainerToEdit] = useState<ContainerType | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateContainerData>({
    name: '',
    description: '',
    location: ''
  });
  const [editFormData, setEditFormData] = useState<CreateContainerData>({
    name: '',
    description: '',
    location: ''
  });

  const { user } = useAuthStore();
  const { showSuccess, showError } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadContainers();
    }
  }, [user]);

  // Check for openModal URL parameter and auto-open modal
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('openModal') === 'true') {
      setShowModal(true);
      // Clean up URL by removing the parameter
      navigate('/containers', { replace: true });
    }
  }, [location.search, navigate]);

  const loadContainers = async () => {
    if (!user) return;
    
    try {
      setFetchLoading(true);
      
      // PERFORMANCE: Load containers first and show UI immediately
      const userContainers = await getUserContainers(user.uid);
      setContainers(userContainers);
      
      // AGGRESSIVE OPTIMIZATION: Show containers immediately with cached counts
      const cachedCounts: Record<string, number> = {};
      userContainers.forEach(container => {
        const cachedCount = offlineCacheService.getCachedItemsCount(container.id);
        cachedCounts[container.id] = cachedCount;
      });
      setItemCounts(cachedCounts);
      
      // PERFORMANCE: Set loading to false immediately to show UI
      setFetchLoading(false);
      
      // BACKGROUND LOADING: Load item counts in background (non-blocking)
      backgroundLoadItemCounts(userContainers);
      
      // BACKGROUND LOADING: Load permissions in background (non-blocking)  
      backgroundLoadPermissions(userContainers);
      
      setError(''); // Clear any previous errors on successful load
    } catch (err: any) {
      console.error('Error loading containers:', err);
      setError('');
      setFetchLoading(false);
    }
  };

  // Background loading of item counts (non-blocking)
  const backgroundLoadItemCounts = async (containers: ContainerWithSharing[]) => {
    console.log('🔄 Background loading item counts...');
    
    const counts: Record<string, number> = {};
    
    // Load counts in parallel but don't block UI
    await Promise.all(
      containers.map(async (container) => {
        try {
          const containerItems = await getContainerItems(container.id);
          counts[container.id] = containerItems.length;
          
          // Update UI incrementally as counts load
          setItemCounts(prev => ({ ...prev, [container.id]: containerItems.length }));
          
          console.log(`📦 Container ${container.name} has ${containerItems.length} items`);
        } catch (error) {
          console.warn(`Error getting items for container ${container.id}:`, error);
          // Keep cached count if available
          const cachedCount = offlineCacheService.getCachedItemsCount(container.id);
          if (cachedCount > 0) {
            counts[container.id] = cachedCount;
            console.log(`📦 Using cached count for ${container.name}: ${cachedCount} items`);
          }
        }
      })
    );
  };

  // Background loading of permissions (non-blocking)
  const backgroundLoadPermissions = async (containers: ContainerWithSharing[]) => {
    if (!user) return;
    
    console.log('🔄 Background loading permissions...');
    
    const permissions: Record<string, SharePermission | null> = {};
    
    try {
      await Promise.all(
        containers.map(async (container) => {
          try {
            permissions[container.id] = await getUserContainerPermission(container.id, user.uid);
          } catch (error) {
            console.warn(`Error getting permission for container ${container.id}:`, error);
            // Default to admin permission for owned containers
            permissions[container.id] = container.userId === user.uid ? 'admin' : null;
          }
        })
      );
      
      setContainerPermissions(permissions);
    } catch (error) {
      console.warn('Error loading container permissions:', error);
      // Set default permissions for all containers
      containers.forEach(container => {
        permissions[container.id] = container.userId === user.uid ? 'admin' : null;
      });
      setContainerPermissions(permissions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      const newContainer = await createContainer(user.uid, formData);
      setContainers(prev => [newContainer, ...prev]);
      
      // Initialize item count for new container
      setItemCounts(prev => ({ ...prev, [newContainer.id]: 0 }));
      
      // Show success notification
      showSuccess(
        'Container Created! 🎉', 
        `"${formData.name}" is ready for your items!`
      );
      
      // Reset form and close modal
      setFormData({ name: '', description: '', location: '' });
      setShowModal(false);
    } catch (err: any) {
      setError(err.message);
      showError('Oops!', 'Unable to create container. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = (container: ContainerType) => {
    setSelectedContainer(container);
    setShowQRModal(true);
  };

  const handleEditClick = (container: ContainerType) => {
    setContainerToEdit(container);
    setEditFormData({
      name: container.name,
      description: container.description || '',
      location: container.location || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (container: ContainerType) => {
    setContainerToDelete(container);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!containerToEdit || !user) return;
    
    setLoading(true);
    setError('');

    try {
      await updateContainer(containerToEdit.id, editFormData);
      
      // Refresh the containers list to get the updated container with processed image
      if (user) {
        const updatedContainers = await getUserContainers(user.uid);
        setContainers(updatedContainers);
        
        // Update item counts for each container (including shared containers)
        const counts: Record<string, number> = {};
        await Promise.all(
          updatedContainers.map(async (container) => {
            try {
              const containerItems = await getContainerItems(container.id);
              counts[container.id] = containerItems.length;
            } catch (error) {
              console.warn(`Error getting items for container ${container.id}:`, error);
              counts[container.id] = 0;
            }
          })
        );
        setItemCounts(counts);
      }
      
      showSuccess(
        'Container Updated! ✏️', 
        `"${editFormData.name}" has been updated successfully!`
      );
      
      setShowEditModal(false);
      setContainerToEdit(null);
      setEditFormData({ name: '', description: '', location: '' });
    } catch (err: any) {
      setError(err.message);
      showError('Oops!', 'Unable to update container. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!containerToDelete || !user) return;
    
    try {
      await deleteContainer(containerToDelete.id, user.uid);
      setContainers(prev => prev.filter(c => c.id !== containerToDelete.id));
      
      // Remove item count for deleted container
      setItemCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[containerToDelete.id];
        return newCounts;
      });
      
      showSuccess(
        'Container Deleted! 🗑️',
        `"${containerToDelete.name}" and all its items have been removed.`
      );
      
      setShowDeleteModal(false);
      setContainerToDelete(null);
    } catch (err: any) {
      showError('Oops!', 'Unable to delete container. Please try again.');
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>📦 My Containers</h1>
              <small className="text-muted">Your containers and containers shared with you</small>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + Add Container
            </Button>
          </div>
        </Col>
      </Row>

      {fetchLoading ? (
        <Row>
          <Col className="text-center mt-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </Col>
        </Row>
      ) : containers.length === 0 ? (
        <Row>
          <Col className="text-center mt-5">
            <div className="mb-4">
              <h2 className="text-primary">🎉 Welcome to Your Inventory!</h2>
              <p className="lead text-muted mb-4">
                You're all set up! Let's create your first container to start organizing your items.
              </p>
              <p className="text-muted">
                Containers are like digital boxes or shelves where you'll store your items. 
                Think "Kitchen Drawer", "Bedroom Closet", or "Garage Shelf".
              </p>
            </div>
            <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
              🚀 Create Your First Container
            </Button>
          </Col>
        </Row>
      ) : (
        <Row>
          {containers.map((container) => {
            const permission = containerPermissions[container.id];
            const isOwner = container.userId === user?.uid;
            const isShared = !isOwner;
            
            return (
              <Col md={6} lg={4} key={container.id} className="mb-4">
                <Card className={`h-100 ${isShared ? 'border-info' : ''}`}>
                  {/* Shared container header indicator */}
                  {isShared && (
                    <div className="bg-info text-white px-3 py-2 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-share me-2"></i>
                        <small className="fw-medium">Shared Container</small>
                      </div>
                      <Badge 
                        bg="light" 
                        text="dark"
                        className="ms-2"
                        title={`You have ${permission === 'view' ? 'view-only' : permission === 'edit' ? 'edit' : 'full'} access`}
                      >
                        {permission === 'view' ? 'View Only' : permission === 'edit' ? 'Can Edit' : 'Full Access'}
                      </Badge>
                    </div>
                  )}
                  
                  {container.imageUrl && (
                    <Link to={`/container/${container.id}`} className="text-decoration-none">
                      <Card.Img 
                        variant="top" 
                        src={container.imageUrl} 
                        style={{ 
                          height: '200px', 
                          objectFit: 'cover',
                          cursor: 'pointer',
                          opacity: isShared ? 0.9 : 1
                        }} 
                      />
                    </Link>
                  )}
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className={`mb-0 ${isShared ? 'text-info' : ''}`}>
                        {container.name}
                        {isShared && <i className="bi bi-share ms-2 text-info"></i>}
                      </Card.Title>
                    </div>
                    
                    {container.description && (
                      <Card.Text className="text-muted">{container.description}</Card.Text>
                    )}
                    {container.location && (
                      <small className="text-muted mb-2">📍 {container.location}</small>
                    )}
                    
                    {/* Show owner info for shared containers */}
                    {isShared && (
                      <div className="mb-3">
                        <small className="text-info">
                          <i className="bi bi-person me-1"></i>
                          Shared by {container.sharedByName || 'Unknown User'}
                        </small>
                      </div>
                    )}
                    
                    <div className="mt-auto">
                      <div className="d-flex flex-wrap gap-2">
                        <Button 
                          href={`/container/${container.id}`}
                          variant={isShared ? "outline-info" : "outline-primary"}
                          size="sm"
                        >
                          View Items ({itemCounts[container.id] || 0})
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleShowQR(container)}
                        >
                          QR Code
                        </Button>
                        
                        {/* Only show edit/delete for owners or users with edit/admin permission */}
                        {permission && permission !== 'view' && (
                          <Button 
                            variant="outline-warning" 
                            size="sm"
                            onClick={() => handleEditClick(container)}
                            title={isShared ? "Edit shared container" : "Edit container"}
                          >
                            Edit
                          </Button>
                        )}
                        
                        {/* Only owners can delete containers */}
                        {isOwner && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteClick(container)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Add Container Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Container</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Container Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Living Room Shelf, Attic Box #3"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Optional description of this container"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Living Room, Bedroom Closet"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Form.Group>

            <ImageUpload
              onImageSelect={(file) => setFormData({ ...formData, image: file })}
              disabled={loading}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Container'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Container Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Container</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Container Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Living Room Shelf, Attic Box #3"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Optional description of this container"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Living Room, Bedroom Closet"
                value={editFormData.location}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
              />
            </Form.Group>

            <ImageUpload
              onImageSelect={(file) => setEditFormData({ ...editFormData, image: file })}
              currentImage={containerToEdit?.imageUrl}
              disabled={loading}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Container'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Container</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>"{containerToDelete?.name}"</strong>?</p>
          <p className="text-muted">
            This action cannot be undone. All {itemCounts[containerToDelete?.id || ''] || 0} item(s) in this container will also be permanently deleted.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Container
          </Button>
        </Modal.Footer>
      </Modal>

      {/* QR Code Modal */}
      {selectedContainer && (
        <QRCodeModal
          show={showQRModal}
          onHide={() => setShowQRModal(false)}
          title={selectedContainer.name}
          url={`/container/${selectedContainer.id}`}
        />
      )}
    </Container>
  );
};

export default ContainersPage;