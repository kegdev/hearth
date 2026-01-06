import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { updateItem, getItemById } from '../services/itemService';
import { getUserContainers } from '../services/containerService';
import { getUserTags } from '../services/tagService';
import { getUserCategories } from '../services/categoryService';
import { useNotifications } from '../components/NotificationSystem';
import QRCodeModal from '../components/QRCodeModal';
import TagSelector from '../components/TagSelector';
import CategorySelector from '../components/CategorySelector';
import type { Item, Container as ContainerType, CreateItemData } from '../types';

const ItemDetailPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [container, setContainer] = useState<ContainerType | null>(null);
  const [containers, setContainers] = useState<ContainerType[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState('');
  const [editFormData, setEditFormData] = useState<CreateItemData>({
    name: '',
    description: '',
    containerId: '',
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
    if (user && itemId) {
      loadItemAndContainer();
    }
  }, [user, itemId]);

  const loadItemAndContainer = async () => {
    if (!user || !itemId) return;
    
    try {
      setLoading(true);
      
      // Load item directly by ID (works for shared container items)
      const [currentItem, userContainers, userTags, userCategories] = await Promise.all([
        getItemById(itemId),
        getUserContainers(user.uid),
        getUserTags(user.uid),
        getUserCategories(user.uid)
      ]);
      
      setItem(currentItem);
      setContainers(userContainers);
      setTags(userTags);
      setCategories(userCategories);
      
      if (currentItem) {
        const itemContainer = userContainers.find(c => c.id === currentItem.containerId);
        setContainer(itemContainer || null);
      }
      
      setError(''); // Clear any previous errors on successful load
    } catch (err: any) {
      console.error('Error loading item data:', err);
      // Don't show error in main UI - services handle demo mode gracefully
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (!item) return;
    setEditFormData({
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
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !user) return;
    
    setEditLoading(true);
    setError('');

    try {
      await updateItem(item.id, editFormData);
      
      // Update the item in local state
      const updatedItem = { ...item, ...editFormData, updatedAt: new Date() };
      setItem(updatedItem);
      
      // Update container if it changed
      if (editFormData.containerId !== item.containerId) {
        const newContainer = containers.find(c => c.id === editFormData.containerId);
        setContainer(newContainer || null);
      }
      
      showSuccess(
        'Item Updated! ✏️', 
        `"${editFormData.name}" has been updated successfully!`
      );
      
      setShowEditModal(false);
    } catch (err: any) {
      setError(err.message);
      showError('Oops!', 'Unable to update item. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const getTagById = (tagId: string) => tags.find(t => t.id === tagId);
  const getCategoryById = (categoryId: string) => categories.find(c => c.id === categoryId);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Row>
          <Col className="text-center mt-5">
            <div className="alert alert-danger">{error}</div>
            <Link to="/items" className="btn btn-primary">
              Back to Items
            </Link>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!item) {
    return (
      <Container>
        <Row>
          <Col className="text-center mt-5">
            <h3>Item not found</h3>
            <p className="text-muted">
              This item may not exist or you may not have permission to access it.
            </p>
            <Link to="/items" className="btn btn-primary">
              Back to Items
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
                <Link to="/items">Items</Link>
              </li>
              <li className="breadcrumb-item active">{item.name}</li>
            </ol>
          </nav>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          {item.imageUrl ? (
            <Card>
              <Card.Img 
                variant="top" 
                src={item.imageUrl} 
                style={{ maxHeight: '400px', objectFit: 'cover' }} 
              />
            </Card>
          ) : (
            <Card className="text-center p-5">
              <div className="text-muted">
                <i className="bi bi-image" style={{ fontSize: '4rem' }}></i>
                <p className="mt-2">No image available</p>
              </div>
            </Card>
          )}
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title className="h2">{item.name}</Card.Title>
              
              {item.description && (
                <Card.Text className="mb-3">{item.description}</Card.Text>
              )}
              
              {container && (
                <div className="mb-3">
                  <Badge bg="secondary" className="me-2">
                    📦 Container: {container.name}
                  </Badge>
                  {container.location && (
                    <Badge bg="info">
                      📍 {container.location}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Category */}
              {item.categoryId && (
                <div className="mb-3">
                  <Badge bg="info" className="me-1">
                    📂 {getCategoryById(item.categoryId)?.path || 'Unknown Category'}
                  </Badge>
                </div>
              )}
              
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="mb-3">
                  <div className="mb-1">
                    <small className="text-muted">Tags:</small>
                  </div>
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
              
              {/* Advanced Properties */}
              {(item.purchasePrice || item.currentValue || item.condition || item.brand || item.model || item.serialNumber || item.warranty || item.purchaseDate) && (
                <>
                  <hr />
                  <h6 className="text-muted mb-3">📊 Item Details</h6>
                  
                  {(item.purchasePrice || item.currentValue) && (
                    <div className="mb-3">
                      <Row>
                        {item.purchasePrice && (
                          <Col md={6}>
                            <small className="text-muted">Purchase Price:</small>
                            <div className="fw-bold">${item.purchasePrice.toLocaleString()}</div>
                          </Col>
                        )}
                        {item.currentValue && (
                          <Col md={6}>
                            <small className="text-muted">Current Value:</small>
                            <div className="fw-bold text-success">${item.currentValue.toLocaleString()}</div>
                          </Col>
                        )}
                      </Row>
                    </div>
                  )}
                  
                  {(item.brand || item.model) && (
                    <div className="mb-3">
                      <Row>
                        {item.brand && (
                          <Col md={6}>
                            <small className="text-muted">Brand:</small>
                            <div>{item.brand}</div>
                          </Col>
                        )}
                        {item.model && (
                          <Col md={6}>
                            <small className="text-muted">Model:</small>
                            <div>{item.model}</div>
                          </Col>
                        )}
                      </Row>
                    </div>
                  )}
                  
                  {(item.condition || item.purchaseDate) && (
                    <div className="mb-3">
                      <Row>
                        {item.condition && (
                          <Col md={6}>
                            <small className="text-muted">Condition:</small>
                            <div className="text-capitalize">{item.condition}</div>
                          </Col>
                        )}
                        {item.purchaseDate && (
                          <Col md={6}>
                            <small className="text-muted">Purchase Date:</small>
                            <div>{item.purchaseDate.toLocaleDateString()}</div>
                          </Col>
                        )}
                      </Row>
                    </div>
                  )}
                  
                  {(item.serialNumber || item.warranty) && (
                    <div className="mb-3">
                      <Row>
                        {item.serialNumber && (
                          <Col md={6}>
                            <small className="text-muted">Serial Number:</small>
                            <div className="font-monospace">{item.serialNumber}</div>
                          </Col>
                        )}
                        {item.warranty && (
                          <Col md={6}>
                            <small className="text-muted">Warranty:</small>
                            <div>{item.warranty}</div>
                          </Col>
                        )}
                      </Row>
                    </div>
                  )}
                </>
              )}
              
              <div className="mb-3">
                <small className="text-muted">
                  Added: {item.createdAt.toLocaleDateString()}
                  {item.updatedAt && item.updatedAt.getTime() !== item.createdAt.getTime() && (
                    <> • Updated: {item.updatedAt.toLocaleDateString()}</>
                  )}
                </small>
              </div>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="warning"
                  onClick={handleEditClick}
                >
                  ✏️ Edit Item
                </Button>
                
                <Button 
                  variant="primary"
                  onClick={() => setShowQRModal(true)}
                >
                  📱 Show QR Code
                </Button>
                
                {container && (
                  <Link 
                    to={`/container/${container.id}`}
                    className="btn btn-outline-primary"
                  >
                    📦 View Container
                  </Link>
                )}
                
                <Link 
                  to="/items"
                  className="btn btn-outline-secondary"
                >
                  ← Back to Items
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Item Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Item Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Winter Jacket, Photo Album"
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
                placeholder="Optional description of this item"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Container *</Form.Label>
              <Form.Select
                value={editFormData.containerId}
                onChange={(e) => setEditFormData({ ...editFormData, containerId: e.target.value })}
                required
              >
                <option value="">Select a container...</option>
                {containers.map(container => (
                  <option key={container.id} value={container.id}>
                    {container.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <TagSelector
              selectedTags={editFormData.tags || []}
              onTagsChange={(tags) => setEditFormData({ ...editFormData, tags })}
              itemName={editFormData.name}
              disabled={editLoading}
            />

            <Form.Group className="mb-3">
              <CategorySelector
                selectedCategoryId={editFormData.categoryId}
                onCategoryChange={(categoryId) => setEditFormData({ ...editFormData, categoryId })}
                disabled={editLoading}
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
                    value={editFormData.purchasePrice || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, purchasePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
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
                    value={editFormData.currentValue || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, currentValue: e.target.value ? parseFloat(e.target.value) : undefined })}
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
                    value={editFormData.purchaseDate ? editFormData.purchaseDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditFormData({ ...editFormData, purchaseDate: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Condition</Form.Label>
                  <Form.Select
                    value={editFormData.condition || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, condition: e.target.value as any })}
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
                    value={editFormData.brand || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Model</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., iPhone 15, Galaxy S24"
                    value={editFormData.model || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
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
                    value={editFormData.serialNumber || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, serialNumber: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Warranty Info</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 2 years, expires 2025"
                    value={editFormData.warranty || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, warranty: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={editLoading}>
              {editLoading ? 'Updating...' : 'Update Item'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* QR Code Modal */}
      <QRCodeModal
        show={showQRModal}
        onHide={() => setShowQRModal(false)}
        title={item.name}
        url={`/item/${item.id}`}
        type="item"
        entityId={item.id}
      />
    </Container>
  );
};

export default ItemDetailPage;