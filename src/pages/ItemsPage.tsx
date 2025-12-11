import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { getUserItems, deleteItem, updateItem } from '../services/itemService';
import { getUserContainers } from '../services/containerService';
import { getUserTags } from '../services/tagService';
import { getUserCategories } from '../services/categoryService';
import { useNotifications } from '../components/NotificationSystem';
import QRCodeModal from '../components/QRCodeModal';
import TagSelector from '../components/TagSelector';
import CategorySelector from '../components/CategorySelector';
import type { Item, Container as ContainerType, CreateItemData } from '../types';

const ItemsPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [containers, setContainers] = useState<ContainerType[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
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
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [userItems, userContainers, userTags, userCategories] = await Promise.all([
        getUserItems(user.uid),
        getUserContainers(user.uid),
        getUserTags(user.uid),
        getUserCategories(user.uid)
      ]);
      setItems(userItems);
      setContainers(userContainers);
      setTags(userTags);
      setCategories(userCategories);
      setError(''); // Clear any previous errors on successful load
    } catch (err: any) {
      // Only show error for actual network/API failures
      console.error('Error loading data:', err);
      // Don't show error in main UI - services handle demo mode gracefully
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const getContainerName = (containerId: string) => {
    const container = containers.find(c => c.id === containerId);
    return container?.name || 'Unknown Container';
  };

  const handleShowQR = (item: Item) => {
    setSelectedItem(item);
    setShowQRModal(true);
  };

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleEditClick = (item: Item) => {
    setItemToEdit(item);
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
    if (!itemToEdit || !user) return;
    
    setEditLoading(true);
    setError('');

    try {
      await updateItem(itemToEdit.id, editFormData);
      
      // Update the item in local state
      setItems(prev => prev.map(item => 
        item.id === itemToEdit.id 
          ? { ...item, ...editFormData, updatedAt: new Date() }
          : item
      ));
      
      showSuccess(
        'Item Updated! ✏️', 
        `"${editFormData.name}" has been updated successfully!`
      );
      
      setShowEditModal(false);
      setItemToEdit(null);
    } catch (err: any) {
      setError(err.message);
      showError('Oops!', 'Unable to update item. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteItem(itemToDelete.id);
      setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      
      showSuccess(
        'Item Deleted! 🗑️',
        `"${itemToDelete.name}" has been removed from your inventory.`
      );
      
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err: any) {
      showError('Oops!', 'Unable to delete item. Please try again.');
    }
  };

  const getTagById = (tagId: string) => tags.find(t => t.id === tagId);
  const getCategoryById = (categoryId: string) => categories.find(c => c.id === categoryId);

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>📋 My Items</h1>
            <Button variant="primary">
              + Add Item
            </Button>
          </div>
        </Col>
      </Row>



      {loading ? (
        <Row>
          <Col className="text-center mt-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </Col>
        </Row>
      ) : items.length === 0 ? (
        <Row>
          <Col className="text-center mt-5">
            <div className="mb-4">
              {containers.length === 0 ? (
                <>
                  <h2 className="text-primary">📦 Ready to Start Organizing?</h2>
                  <p className="lead text-muted mb-4">
                    First, let's create some containers to organize your items!
                  </p>
                  <p className="text-muted">
                    Containers are like digital storage spaces - think "Kitchen Drawer", 
                    "Bedroom Closet", or "Tool Box". Once you have containers, 
                    you can start adding your items to them.
                  </p>
                  <Button 
                    href="/containers?openModal=true" 
                    variant="primary" 
                    size="lg" 
                    className="mt-3"
                  >
                    🚀 Create Your First Container
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-success">🎯 Great! Your Containers Are Ready</h2>
                  <p className="lead text-muted mb-4">
                    Now let's add some items to your containers and start building your inventory!
                  </p>
                  <p className="text-muted">
                    You have {containers.length} container{containers.length !== 1 ? 's' : ''} set up. 
                    Click on any container to start adding items, or browse your containers below.
                  </p>
                  <Button href="/containers" variant="primary" size="lg" className="mt-3">
                    📋 Add Items to Containers
                  </Button>
                </>
              )}
            </div>
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
                  
                  <div className="mb-2">
                    <Badge bg="secondary" className="me-1">
                      📦 {getContainerName(item.containerId)}
                    </Badge>
                  </div>
                  
                  {/* Category */}
                  {item.categoryId && (
                    <div className="mb-2">
                      <Badge bg="info" className="me-1">
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
                      href={`/container/${item.containerId}`}
                      variant="outline-primary" 
                      size="sm"
                    >
                      View Container
                    </Button>
                    <Button 
                      variant="outline-warning" 
                      size="sm"
                      onClick={() => handleEditClick(item)}
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

export default ItemsPage;