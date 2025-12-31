import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getUserItems, deleteItem, updateItem, createItem } from '../services/itemService';
import { getUserContainers } from '../services/containerService';
import { getUserTags } from '../services/tagService';
import { getUserCategories } from '../services/categoryService';
import { useNotifications } from '../components/NotificationSystem';
import QRCodeModal from '../components/QRCodeModal';
import ImageUpload from '../components/ImageUpload';
import TagSelector from '../components/TagSelector';
import CategorySelector from '../components/CategorySelector';
import type { Item, Container as ContainerType, CreateItemData } from '../types';

const ItemsPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [containers, setContainers] = useState<ContainerType[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // PERFORMANCE OPTIMIZATION: Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string>(''); // For tag-specific filtering
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; // Show 24 items per page for optimal performance
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
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
  const [addFormData, setAddFormData] = useState<CreateItemData>({
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
  const location = useLocation();
  const navigate = useNavigate();

  // Helper functions for filtering (must be declared before filtering logic)
  const getTagById = (tagId: string) => tags.find(t => t.id === tagId);
  const getCategoryById = (categoryId: string) => categories.find(c => c.id === categoryId);
  const getContainerName = (containerId: string) => {
    const container = containers.find(c => c.id === containerId);
    return container?.name || 'Unknown Container';
  };

  // PERFORMANCE OPTIMIZATION: Filter and paginate items
  const filteredItems = items.filter(item => {
    // First apply tag filter if selected
    if (selectedTagId && (!item.tags || !item.tags.includes(selectedTagId))) {
      return false;
    }
    
    // Then apply text search if provided
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.brand?.toLowerCase().includes(searchLower) ||
      item.model?.toLowerCase().includes(searchLower) ||
      item.serialNumber?.toLowerCase().includes(searchLower) ||
      // Search in container name
      getContainerName(item.containerId).toLowerCase().includes(searchLower) ||
      // Search in tags
      item.tags?.some(tagId => {
        const tag = getTagById(tagId);
        return tag?.name.toLowerCase().includes(searchLower);
      }) ||
      // Search in category
      (() => {
        const category = getCategoryById(item.categoryId || '');
        return category?.name.toLowerCase().includes(searchLower);
      })()
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search or tag filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTagId]);

  // Handle URL search parameters (for tag cloud navigation and general search)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    const tagIdParam = urlParams.get('tagId');
    
    if (searchParam) {
      setSearchTerm(searchParam);
      setSelectedTagId(''); // Clear tag filter when doing text search
    } else if (tagIdParam) {
      setSelectedTagId(tagIdParam);
      setSearchTerm(''); // Clear text search when filtering by tag
    }
    
    // Clean up URL by removing the parameters
    navigate('/items', { replace: true });
  }, [location.search, navigate]);

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
      
      // Refresh the items list to get the updated item with processed image
      if (user) {
        const updatedItems = await getUserItems(user.uid);
        setItems(updatedItems);
      }
      
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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !addFormData.containerId) return;
    
    setAddLoading(true);
    setError('');

    try {
      const newItem = await createItem(user.uid, addFormData);
      
      // Add the item to local state
      setItems(prev => [newItem, ...prev]);
      
      showSuccess(
        'Item Added! 📦', 
        `"${addFormData.name}" has been added to your inventory!`
      );
      
      // Reset form and close modal
      setAddFormData({
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
      setShowAddModal(false);
    } catch (err: any) {
      setError(err.message);
      showError('Oops!', 'Unable to add item. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>📋 My Items</h1>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
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
        <>
          {/* PERFORMANCE OPTIMIZATION: Search and Filter Bar */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
                <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                  <Form.Control
                    type="text"
                    placeholder={selectedTagId ? `🔍 Search within filtered items...` : `🔍 Search ${items.length} items across all containers...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-2"
                    disabled={!!selectedTagId} // Disable search when tag filter is active
                  />
                </div>
                <div className="text-muted">
                  {selectedTagId ? (
                    <>
                      Filtered by tag: <strong>{getTagById(selectedTagId)?.name || 'Unknown Tag'}</strong> 
                      ({filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''})
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 ms-2 text-decoration-none"
                        onClick={() => setSelectedTagId('')}
                      >
                        Clear Filter
                      </Button>
                    </>
                  ) : searchTerm ? (
                    <>
                      Showing {filteredItems.length} of {items.length} items
                      {filteredItems.length !== items.length && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 ms-2 text-decoration-none"
                          onClick={() => setSearchTerm('')}
                        >
                          Clear
                        </Button>
                      )}
                    </>
                  ) : (
                    `${items.length} items total`
                  )}
                </div>
              </div>
            </Col>
          </Row>

          {/* Items Grid - Now Paginated */}
          <Row>
            {paginatedItems.map((item) => (
            <Col md={6} lg={4} key={item.id} className="mb-4">
              <Card>
                {item.imageUrl && (
                  <Link to={`/item/${item.id}`} className="text-decoration-none">
                    <Card.Img 
                      variant="top" 
                      src={item.imageUrl}
                      loading="lazy"
                      style={{ 
                        height: '200px', 
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }} 
                    />
                  </Link>
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

          {/* PERFORMANCE OPTIMIZATION: Pagination Controls */}
          {totalPages > 1 && (
            <Row className="mt-4">
              <Col>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                  <div className="text-muted">
                    Page {currentPage} of {totalPages} • Showing {paginatedItems.length} of {filteredItems.length} items
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </>
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

            <ImageUpload
              onImageSelect={(file) => setEditFormData({ ...editFormData, image: file })}
              currentImage={itemToEdit?.imageUrl}
              disabled={editLoading}
            />

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

      {/* Add Item Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Item Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Winter Jacket, Photo Album"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Optional description of this item"
                value={addFormData.description}
                onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
              />
            </Form.Group>

            <ImageUpload
              onImageSelect={(file) => setAddFormData({ ...addFormData, image: file })}
              disabled={addLoading}
            />

            <Form.Group className="mb-3">
              <Form.Label>Container *</Form.Label>
              <Form.Select
                value={addFormData.containerId}
                onChange={(e) => setAddFormData({ ...addFormData, containerId: e.target.value })}
                required
              >
                <option value="">Select a container...</option>
                {containers.map((container) => (
                  <option key={container.id} value={container.id}>
                    {container.name} {container.location && `(${container.location})`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <TagSelector
              selectedTags={addFormData.tags || []}
              onTagsChange={(tags) => setAddFormData({ ...addFormData, tags })}
              itemName={addFormData.name}
              disabled={addLoading}
            />

            <Form.Group className="mb-3">
              <CategorySelector
                selectedCategoryId={addFormData.categoryId}
                onCategoryChange={(categoryId) => setAddFormData({ ...addFormData, categoryId })}
                disabled={addLoading}
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
                    value={addFormData.purchasePrice?.toString() || ''}
                    onChange={(e) => setAddFormData({ 
                      ...addFormData, 
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
                    value={addFormData.currentValue?.toString() || ''}
                    onChange={(e) => setAddFormData({ 
                      ...addFormData, 
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
                    value={addFormData.purchaseDate ? addFormData.purchaseDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setAddFormData({ ...addFormData, purchaseDate: e.target.value ? new Date(e.target.value) : undefined })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Condition</Form.Label>
                  <Form.Select
                    value={addFormData.condition || ''}
                    onChange={(e) => setAddFormData({ ...addFormData, condition: e.target.value as any })}
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
                    value={addFormData.brand || ''}
                    onChange={(e) => setAddFormData({ ...addFormData, brand: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Model</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., iPhone 15, Galaxy S24"
                    value={addFormData.model || ''}
                    onChange={(e) => setAddFormData({ ...addFormData, model: e.target.value })}
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
                    value={addFormData.serialNumber || ''}
                    onChange={(e) => setAddFormData({ ...addFormData, serialNumber: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Warranty Info</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 2 years, expires 2025"
                    value={addFormData.warranty || ''}
                    onChange={(e) => setAddFormData({ ...addFormData, warranty: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={addLoading}>
              {addLoading ? 'Creating...' : 'Create Item'}
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

export default ItemsPage;