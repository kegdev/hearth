import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { getContainerItems, createItem, deleteItem, updateItem } from '../services/itemService';
import { getUserContainers, updateContainer } from '../services/containerService';
import { getUserTags } from '../services/tagService';
import { getUserCategories } from '../services/categoryService';
import { useNotifications } from '../components/NotificationSystem';
import QRCodeModal from '../components/QRCodeModal';
import ImageUpload from '../components/ImageUpload';
import TagSelector from '../components/TagSelector';
import CategorySelector from '../components/CategorySelector';
import type { Item, Container as ContainerType, CreateItemData } from '../types';

const ContainerDetailPage = () => {
  const { containerId } = useParams<{ containerId: string }>();
  const [container, setContainer] = useState<ContainerType | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditContainerModal, setShowEditContainerModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateItemData>({
    name: '',
    description: '',
    containerId: containerId || '',
    tags: [],
    categoryId: undefined,
    purchasePrice: undefined,
    currentValue: undefined,
    purchaseDate: undefined,
    condition: undefined,
    warranty: '',
    serialNumber: '',
    model: '',
    brand: '',
  });
  const [editContainerData, setEditContainerData] = useState({
    name: '',
    description: '',
    location: ''
  });
  const [editItemData, setEditItemData] = useState<CreateItemData>({
    name: '',
    description: '',
    containerId: containerId || '',
    tags: [],
    categoryId: undefined,
    purchasePrice: undefined,
    currentValue: undefined,
    purchaseDate: undefined,
    condition: undefined,
    warranty: '',
    serialNumber: '',
    model: '',
    brand: '',
  });

  const { user } = useAuthStore();
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    if (user && containerId) {
      loadContainerAndItems();
    }
  }, [user, containerId]);

  const loadContainerAndItems = async () => {
    if (!user || !containerId) return;
    
    try {
      setFetchLoading(true);
      
      // Load container details, items, tags, and categories in parallel
      const [containers, containerItems, userTags, userCategories] = await Promise.all([
        getUserContainers(user.uid),
        getContainerItems(containerId, user.uid),
        getUserTags(user.uid),
        getUserCategories(user.uid)
      ]);
      
      const currentContainer = containers.find(c => c.id === containerId);
      setContainer(currentContainer || null);
      setItems(containerItems);
      setTags(userTags);
      setCategories(userCategories);
      setError(''); // Clear any previous errors on successful load
    } catch (err: any) {
      console.error('Error loading container data:', err);
      // Don't show error in main UI - services handle demo mode gracefully
      setError('');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !containerId) return;
    
    setLoading(true);
    setError('');

    try {
      const newItem = await createItem(user.uid, { ...formData, containerId });
      setItems(prev => [newItem, ...prev]);
      
      // Show success notification
      showSuccess(
        'Item Added! 📦', 
        `"${formData.name}" has been added to ${container?.name}!`
      );
      
      // Reset form and close modal
      setFormData({ 
        name: '', 
        description: '', 
        containerId, 
        tags: [], 
        categoryId: undefined,
        purchasePrice: undefined,
        currentValue: undefined,
        purchaseDate: undefined,
        condition: undefined,
        warranty: '',
        serialNumber: '',
        model: '',
        brand: '',
      });
      setShowModal(false);
    } catch (err: any) {
      setError(err.message);
      showError('Oops!', 'Unable to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = (item: Item) => {
    setSelectedItem(item);
    setShowQRModal(true);
  };

  const handleEditContainer = () => {
    if (!container) return;
    setEditContainerData({
      name: container.name,
      description: container.description || '',
      location: container.location || ''
    });
    setShowEditContainerModal(true);
  };

  const handleEditContainerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!container || !user) return;
    
    setLoading(true);
    setError('');

    try {
      await updateContainer(container.id, editContainerData);
      
      // Update the container in local state
      setContainer(prev => prev ? { ...prev, ...editContainerData, updatedAt: new Date() } : null);
      
      showSuccess(
        'Container Updated! ✏️', 
        `"${editContainerData.name}" has been updated successfully!`
      );
      
      setShowEditContainerModal(false);
    } catch (err: any) {
      setError(err.message);
      showError('Oops!', 'Unable to update container. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: Item) => {
    setItemToEdit(item);
    setEditItemData({
      name: item.name,
      description: item.description || '',
      containerId: item.containerId,
      tags: item.tags || [],
      categoryId: item.categoryId,
      purchasePrice: item.purchasePrice,
      currentValue: item.currentValue,
      purchaseDate: item.purchaseDate,
      condition: item.condition,
      warranty: item.warranty || '',
      serialNumber: item.serialNumber || '',
      model: item.model || '',
      brand: item.brand || '',
    });
    setShowEditItemModal(true);
  };

  const handleEditItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit || !user) return;
    
    setLoading(true);
    setError('');

    try {
      await updateItem(itemToEdit.id, editItemData);
      
      // Update the item in local state
      setItems(prev => prev.map(item => 
        item.id === itemToEdit.id 
          ? { ...item, ...editItemData, updatedAt: new Date() }
          : item
      ));
      
      showSuccess(
        'Item Updated! ✏️', 
        `"${editItemData.name}" has been updated successfully!`
      );
      
      setShowEditItemModal(false);
      setItemToEdit(null);
    } catch (err: any) {
      setError(err.message);
      showError('Oops!', 'Unable to update item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTagById = (tagId: string) => tags.find(t => t.id === tagId);
  const getCategoryById = (categoryId: string) => categories.find(c => c.id === categoryId);

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteItem(itemToDelete.id);
      setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      
      showSuccess(
        'Item Deleted! 🗑️',
        `"${itemToDelete.name}" has been removed from ${container?.name}.`
      );
      
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err: any) {
      showError('Oops!', 'Unable to delete item. Please try again.');
    }
  };

  if (fetchLoading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (!container) {
    return (
      <Container>
        <Row>
          <Col className="text-center mt-5">
            <h3>Container not found</h3>
            <Link to="/containers" className="btn btn-primary">
              Back to Containers
            </Link>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/containers">Containers</Link>
              </li>
              <li className="breadcrumb-item active">{container.name}</li>
            </ol>
          </nav>
          
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>📦 {container.name}</h1>
              {container.description && (
                <p className="text-muted">{container.description}</p>
              )}
              {container.location && (
                <Badge bg="secondary">📍 {container.location}</Badge>
              )}
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={handleEditContainer}>
                ✏️ Edit Container
              </Button>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                + Add Item
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {items.length === 0 ? (
        <Row>
          <Col className="text-center mt-5">
            <div className="mb-4">
              <h2 className="text-success">✨ Perfect! Your Container is Ready</h2>
              <p className="lead text-muted mb-4">
                Time to add some items to <strong>{container.name}</strong>!
              </p>
              <p className="text-muted">
                Add anything you want to track - from important documents to seasonal decorations. 
                You can include photos and descriptions to make finding things super easy.
              </p>
            </div>
            <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
              📝 Add Your First Item
            </Button>
          </Col>
        </Row>
      ) : (
        <Row>
          {items.map((item) => (
            <Col md={6} lg={4} key={item.id} className="mb-4">
              <Card>
                {item.imageUrl && (
                  <Card.Img 
                    variant="top" 
                    src={item.imageUrl} 
                    style={{ height: '200px', objectFit: 'cover' }} 
                  />
                )}
                <Card.Body>
                  <Card.Title>{item.name}</Card.Title>
                  {item.description && (
                    <Card.Text>{item.description}</Card.Text>
                  )}
                  
                  {/* Category */}
                  {item.categoryId && (
                    <div className="mb-2">
                      <Badge bg="secondary" className="me-1">
                        📂 {getCategoryById(item.categoryId)?.path || 'Unknown Category'}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mb-2">
                      {item.tags.map(tagId => {
                        const tag = getTagById(tagId);
                        if (!tag) return null;
                        return (
                          <Badge
                            key={tagId}
                            bg=""
                            style={{ 
                              backgroundColor: tag.color, 
                              color: 'white',
                              marginRight: '0.25rem'
                            }}
                            className="me-1"
                          >
                            {tag.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleEditItem(item)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => handleShowQR(item)}
                    >
                      QR Code
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteClick(item)}
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

      {/* Add Item Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Item Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Winter Jacket, Photo Album"
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
                placeholder="Optional description of this item"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <TagSelector
              selectedTags={formData.tags || []}
              onTagsChange={(tags) => setFormData({ ...formData, tags })}
              itemName={formData.name}
              disabled={loading}
            />

            <Form.Group className="mb-3">
              <CategorySelector
                selectedCategoryId={formData.categoryId}
                onCategoryChange={(categoryId) => setFormData({ ...formData, categoryId })}
                disabled={loading}
              />
            </Form.Group>

            {/* Advanced Properties */}
            <hr />
            <h6 className="text-muted mb-3">📊 Value & Details (Optional)</h6>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Purchase Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.purchasePrice?.toString() || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      purchasePrice: e.target.value && !isNaN(parseFloat(e.target.value)) ? parseFloat(e.target.value) : undefined 
                    })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Value</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.currentValue?.toString() || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      currentValue: e.target.value && !isNaN(parseFloat(e.target.value)) ? parseFloat(e.target.value) : undefined 
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Purchase Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.purchaseDate ? formData.purchaseDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Condition</Form.Label>
                  <Form.Select
                    value={formData.condition || ''}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                  >
                    <option value="">Select condition...</option>
                    <option value="new">New</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Apple, Samsung"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Model</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., iPhone 15, Galaxy S24"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Serial Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Serial or ID number"
                    value={formData.serialNumber || ''}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Warranty Info</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 2 years, expires 2025"
                    value={formData.warranty || ''}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

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
              {loading ? 'Creating...' : 'Create Item'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>"{itemToDelete?.name}"</strong>?</p>
          <p className="text-muted">
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Item
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Container Modal */}
      <Modal show={showEditContainerModal} onHide={() => setShowEditContainerModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Container</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditContainerSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Container Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Living Room Shelf, Attic Box #3"
                value={editContainerData.name}
                onChange={(e) => setEditContainerData({ ...editContainerData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Optional description of this container"
                value={editContainerData.description}
                onChange={(e) => setEditContainerData({ ...editContainerData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Living Room, Bedroom Closet"
                value={editContainerData.location}
                onChange={(e) => setEditContainerData({ ...editContainerData, location: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditContainerModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Container'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Item Modal */}
      <Modal show={showEditItemModal} onHide={() => setShowEditItemModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditItemSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Item Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Winter Jacket, Photo Album"
                value={editItemData.name}
                onChange={(e) => setEditItemData({ ...editItemData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Optional description of this item"
                value={editItemData.description}
                onChange={(e) => setEditItemData({ ...editItemData, description: e.target.value })}
              />
            </Form.Group>

            <ImageUpload
              onImageSelect={(file) => setEditItemData({ ...editItemData, image: file })}
              currentImage={itemToEdit?.imageUrl}
              disabled={loading}
            />

            <TagSelector
              selectedTags={editItemData.tags || []}
              onTagsChange={(tags) => setEditItemData({ ...editItemData, tags })}
              itemName={editItemData.name}
              disabled={loading}
            />

            <Form.Group className="mb-3">
              <CategorySelector
                selectedCategoryId={editItemData.categoryId}
                onCategoryChange={(categoryId) => setEditItemData({ ...editItemData, categoryId })}
                disabled={loading}
              />
            </Form.Group>

            {/* Advanced Properties */}
            <hr />
            <h6 className="text-muted mb-3">📊 Value & Details (Optional)</h6>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Purchase Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={editItemData.purchasePrice?.toString() || ''}
                    onChange={(e) => setEditItemData({ 
                      ...editItemData, 
                      purchasePrice: e.target.value && !isNaN(parseFloat(e.target.value)) ? parseFloat(e.target.value) : undefined 
                    })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Value</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={editItemData.currentValue?.toString() || ''}
                    onChange={(e) => setEditItemData({ 
                      ...editItemData, 
                      currentValue: e.target.value && !isNaN(parseFloat(e.target.value)) ? parseFloat(e.target.value) : undefined 
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Purchase Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={editItemData.purchaseDate ? editItemData.purchaseDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditItemData({ ...editItemData, purchaseDate: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Condition</Form.Label>
                  <Form.Select
                    value={editItemData.condition || ''}
                    onChange={(e) => setEditItemData({ ...editItemData, condition: e.target.value as any })}
                  >
                    <option value="">Select condition...</option>
                    <option value="new">New</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Apple, Samsung"
                    value={editItemData.brand || ''}
                    onChange={(e) => setEditItemData({ ...editItemData, brand: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Model</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., iPhone 15, Galaxy S24"
                    value={editItemData.model || ''}
                    onChange={(e) => setEditItemData({ ...editItemData, model: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Serial Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Serial or ID number"
                    value={editItemData.serialNumber || ''}
                    onChange={(e) => setEditItemData({ ...editItemData, serialNumber: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Warranty Info</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 2 years, expires 2025"
                    value={editItemData.warranty || ''}
                    onChange={(e) => setEditItemData({ ...editItemData, warranty: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditItemModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Item'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* QR Code Modal */}
      {selectedItem && (
        <QRCodeModal
          show={showQRModal}
          onHide={() => setShowQRModal(false)}
          title={selectedItem.name}
          url={`/item/${selectedItem.id}`}
        />
      )}
    </Container>
  );
};

export default ContainerDetailPage;