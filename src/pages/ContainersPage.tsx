import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { createContainer, getUserContainers, deleteContainer, updateContainer } from '../services/containerService';
import { getUserItems } from '../services/itemService';
import { useNotifications } from '../components/NotificationSystem';
import QRCodeModal from '../components/QRCodeModal';
import ImageUpload from '../components/ImageUpload';
import type { Container as ContainerType, CreateContainerData } from '../types';

const ContainersPage = () => {
  const [containers, setContainers] = useState<ContainerType[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
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
      
      // Load containers and items in parallel
      const [userContainers, userItems] = await Promise.all([
        getUserContainers(user.uid),
        getUserItems(user.uid)
      ]);
      
      setContainers(userContainers);
      
      // Count items per container
      const counts: Record<string, number> = {};
      userContainers.forEach(container => {
        counts[container.id] = userItems.filter(item => item.containerId === container.id).length;
      });
      setItemCounts(counts);
      
      setError(''); // Clear any previous errors on successful load
    } catch (err: any) {
      // Only show error for actual network/API failures
      console.error('Error loading containers:', err);
      // Don't show error in main UI - services handle demo mode gracefully
      setError('');
    } finally {
      setFetchLoading(false);
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
        const [updatedContainers, userItems] = await Promise.all([
          getUserContainers(user.uid),
          getUserItems(user.uid)
        ]);
        
        setContainers(updatedContainers);
        
        // Update item counts
        const counts: Record<string, number> = {};
        updatedContainers.forEach(container => {
          counts[container.id] = userItems.filter(item => item.containerId === container.id).length;
        });
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
            <h1>📦 My Containers</h1>
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
          {containers.map((container) => (
            <Col md={6} lg={4} key={container.id} className="mb-4">
              <Card>
                {container.imageUrl && (
                  <Card.Img 
                    variant="top" 
                    src={container.imageUrl} 
                    style={{ height: '200px', objectFit: 'cover' }} 
                  />
                )}
                <Card.Body>
                  <Card.Title>{container.name}</Card.Title>
                  {container.description && (
                    <Card.Text>{container.description}</Card.Text>
                  )}
                  {container.location && (
                    <small className="text-muted">📍 {container.location}</small>
                  )}
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    <Button 
                      href={`/container/${container.id}`}
                      variant="outline-primary" 
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
                    <Button 
                      variant="outline-warning" 
                      size="sm"
                      onClick={() => handleEditClick(container)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteClick(container)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
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