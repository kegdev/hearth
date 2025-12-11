import { useState, useEffect } from 'react';
import { Form, Button, Modal, Dropdown } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { getUserCategories, createCategory, CATEGORY_TEMPLATES, createCategoriesFromTemplate } from '../services/categoryService';
import { useNotifications } from './NotificationSystem';
import type { Category } from '../types';

interface CategorySelectorProps {
  selectedCategoryId?: string;
  onCategoryChange: (categoryId?: string) => void;
  disabled?: boolean;
}

const CategorySelector = ({ selectedCategoryId, onCategoryChange, disabled }: CategorySelectorProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuthStore();
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    if (!user) return;
    
    try {
      const userCategories = await getUserCategories(user.uid);
      setCategories(userCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCategoryName.trim()) return;
    
    setLoading(true);
    
    try {
      const newCategory = await createCategory(user.uid, {
        name: newCategoryName.trim(),
        parentId: parentCategoryId || undefined
      });
      
      setCategories(prev => [...prev, newCategory]);
      onCategoryChange(newCategory.id);
      
      showSuccess('Category Created! 📂', `"${newCategory.name}" is ready to use!`);
      
      setNewCategoryName('');
      setParentCategoryId('');
      setShowCreateModal(false);
    } catch (err: any) {
      showError('Oops!', 'Unable to create category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (templateName: string) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const createdCategories = await createCategoriesFromTemplate(user.uid, templateName);
      setCategories(prev => [...prev, ...createdCategories]);
      
      showSuccess(
        'Categories Created! 📂', 
        `${createdCategories.length} categories from "${templateName}" template added!`
      );
      
      setShowTemplateModal(false);
    } catch (err: any) {
      showError('Oops!', 'Unable to create categories from template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = (categoryId: string) => categories.find(c => c.id === categoryId);
  const selectedCategory = selectedCategoryId ? getCategoryById(selectedCategoryId) : null;

  return (
    <div>
      <Form.Label>Category</Form.Label>
      
      <div className="d-flex gap-2 align-items-center">
        <Form.Select
          value={selectedCategoryId || ''}
          onChange={(e) => onCategoryChange(e.target.value || undefined)}
          disabled={disabled}
        >
          <option value="">No Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.path}
            </option>
          ))}
        </Form.Select>

        {!disabled && (
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm">
              +
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setShowCreateModal(true)}>
                Create New Category
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setShowTemplateModal(true)}>
                Use Template
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>

      {selectedCategory && (
        <small className="text-muted">
          Selected: {selectedCategory.path}
        </small>
      )}

      {/* Create Category Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Category</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateCategory}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Category Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Electronics, Kitchen, Tools"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Parent Category (Optional)</Form.Label>
              <Form.Select
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value)}
              >
                <option value="">No Parent (Root Category)</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.path}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Create hierarchical categories like "Electronics → Audio → Headphones"
              </Form.Text>
            </Form.Group>

            {/* Preview */}
            {newCategoryName && (
              <div className="mb-3">
                <Form.Label>Preview Path</Form.Label>
                <div className="p-2 bg-light rounded">
                  {parentCategoryId 
                    ? `${getCategoryById(parentCategoryId)?.path} → ${newCategoryName}`
                    : newCategoryName
                  }
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading || !newCategoryName.trim()}>
              {loading ? 'Creating...' : 'Create Category'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Template Modal */}
      <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Categories from Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Choose a template to quickly create a set of organized categories:
          </p>
          
          <div className="d-grid gap-2">
            {CATEGORY_TEMPLATES.map(template => (
              <Button
                key={template.name}
                variant="outline-primary"
                onClick={() => handleCreateFromTemplate(template.name)}
                disabled={loading}
              >
                <strong>{template.name}</strong>
                <br />
                <small className="text-muted">
                  {template.children.length} categories with subcategories
                </small>
              </Button>
            ))}
          </div>
          
          <div className="mt-3">
            <small className="text-muted">
              Templates create hierarchical categories that you can customize later.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CategorySelector;