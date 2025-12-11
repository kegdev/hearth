import { useState, useEffect } from 'react';
import { Form, Badge, Button, Modal, Row, Col } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { getUserTags, createTag, deleteTag, suggestTags, TAG_COLORS } from '../services/tagService';
import { useNotifications } from './NotificationSystem';
import type { Tag } from '../types';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  itemName?: string;
  disabled?: boolean;
}

const TagSelector = ({ selectedTags, onTagsChange, itemName, disabled }: TagSelectorProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { user } = useAuthStore();
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    if (user) {
      loadTags();
    }
  }, [user]);

  useEffect(() => {
    if (itemName && tags.length > 0) {
      const tagSuggestions = suggestTags(itemName, tags);
      setSuggestions(tagSuggestions);
    }
  }, [itemName, tags]);

  const loadTags = async () => {
    if (!user) return;
    
    try {
      const userTags = await getUserTags(user.uid);
      setTags(userTags);
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  };

  const handleTagToggle = (tagId: string) => {
    if (disabled) return;
    
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    
    onTagsChange(newSelectedTags);
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTagName.trim()) return;
    
    setLoading(true);
    
    try {
      const newTag = await createTag(user.uid, {
        name: newTagName.trim(),
        color: newTagColor
      });
      
      setTags(prev => [...prev, newTag]);
      onTagsChange([...selectedTags, newTag.id]);
      
      showSuccess('Tag Created! 🏷️', `"${newTag.name}" is ready to use!`);
      
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
      setShowCreateModal(false);
    } catch (err: any) {
      showError('Oops!', 'Unable to create tag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!user) return;
    
    try {
      await deleteTag(tagId);
      setTags(prev => prev.filter(t => t.id !== tagId));
      onTagsChange(selectedTags.filter(id => id !== tagId));
      
      showSuccess('Tag Deleted! 🗑️', 'Tag has been removed.');
    } catch (err: any) {
      showError('Oops!', 'Unable to delete tag. Please try again.');
    }
  };

  const handleSuggestionClick = (suggestionName: string) => {
    if (disabled) return;
    
    // Check if tag already exists
    const existingTag = tags.find(t => t.name.toLowerCase() === suggestionName.toLowerCase());
    if (existingTag && !selectedTags.includes(existingTag.id)) {
      onTagsChange([...selectedTags, existingTag.id]);
    } else if (!existingTag) {
      // Create new tag from suggestion
      setNewTagName(suggestionName);
      setShowCreateModal(true);
    }
  };

  const getTagById = (tagId: string) => tags.find(t => t.id === tagId);

  return (
    <div>
      <Form.Label>Tags</Form.Label>
      
      {/* Selected Tags */}
      <div className="mb-2">
        {selectedTags.map(tagId => {
          const tag = getTagById(tagId);
          if (!tag) return null;
          
          return (
            <Badge
              key={tagId}
              bg=""
              style={{ 
                backgroundColor: tag.color, 
                color: 'white',
                marginRight: '0.5rem',
                marginBottom: '0.25rem'
              }}
              className="me-1 mb-1"
            >
              {tag.name}
              {!disabled && (
                <button
                  type="button"
                  className="btn-close btn-close-white ms-1"
                  style={{ fontSize: '0.6rem' }}
                  onClick={() => handleTagToggle(tagId)}
                  aria-label="Remove tag"
                />
              )}
            </Badge>
          );
        })}
      </div>

      {!disabled && (
        <>
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mb-2">
              <small className="text-muted">Suggested tags:</small>
              <div>
                {suggestions.map(suggestion => (
                  <Badge
                    key={suggestion}
                    bg="light"
                    text="dark"
                    className="me-1 mb-1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    + {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Tags */}
          <div className="mb-2">
            <small className="text-muted">Available tags:</small>
            <div>
              {tags
                .filter(tag => !selectedTags.includes(tag.id))
                .map(tag => (
                  <Badge
                    key={tag.id}
                    bg=""
                    style={{ 
                      backgroundColor: tag.color + '40', 
                      color: tag.color,
                      cursor: 'pointer',
                      border: `1px solid ${tag.color}`
                    }}
                    className="me-1 mb-1"
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
            </div>
          </div>

          {/* Create New Tag Button */}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            + Create New Tag
          </Button>
        </>
      )}

      {/* Create Tag Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Tag</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateTag}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tag Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Electronics, Important, Seasonal"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <Row>
                {TAG_COLORS.map(color => (
                  <Col key={color} xs={2} className="mb-2">
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: color,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: newTagColor === color ? '3px solid #000' : '2px solid #ddd'
                      }}
                      onClick={() => setNewTagColor(color)}
                    />
                  </Col>
                ))}
              </Row>
            </Form.Group>

            {/* Preview */}
            {newTagName && (
              <div className="mb-3">
                <Form.Label>Preview</Form.Label>
                <div>
                  <Badge
                    bg=""
                    style={{ 
                      backgroundColor: newTagColor, 
                      color: 'white'
                    }}
                  >
                    {newTagName}
                  </Badge>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading || !newTagName.trim()}>
              {loading ? 'Creating...' : 'Create Tag'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default TagSelector;