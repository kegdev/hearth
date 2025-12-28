import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Badge, ListGroup, Spinner } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { 
  shareContainer, 
  getContainerShares, 
  revokeContainerShare, 
  updateSharePermission,
  searchApprovedUsers 
} from '../services/containerSharingService';
import { useNotifications } from './NotificationSystem';
import type { 
  ContainerShare, 
  SharePermission, 
  UserProfile,
  CreateContainerShareData 
} from '../types';

interface ShareContainerModalProps {
  show: boolean;
  onHide: () => void;
  containerId: string;
  containerName: string;
}

const ShareContainerModal = ({ show, onHide, containerId, containerName }: ShareContainerModalProps) => {
  const [shares, setShares] = useState<ContainerShare[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<SharePermission>('view');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuthStore();
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    if (show && user && containerId) {
      loadContainerShares();
    }
  }, [show, user, containerId]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
      setSelectedUser(null);
    }
  }, [searchTerm]);

  const loadContainerShares = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const containerShares = await getContainerShares(containerId, user.uid);
      setShares(containerShares);
      setError('');
    } catch (err: any) {
      console.error('Error loading container shares:', err);
      setError(err.message || 'Failed to load sharing information');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!user || searchTerm.length < 2) return;
    
    try {
      setSearchLoading(true);
      const users = await searchApprovedUsers(searchTerm, user.uid);
      setSearchResults(users);
    } catch (err: any) {
      console.error('Error searching users:', err);
      showError('Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleShareContainer = async () => {
    if (!user || !selectedUser) return;
    
    try {
      setLoading(true);
      const shareData: CreateContainerShareData = {
        containerId,
        targetUserEmail: selectedUser.email,
        permission: selectedPermission,
      };
      
      await shareContainer(shareData, user.uid);
      showSuccess(`Container shared with ${selectedUser.displayName || selectedUser.email}`);
      
      // Refresh shares list
      await loadContainerShares();
      
      // Reset form
      setSearchTerm('');
      setSelectedUser(null);
      setSelectedPermission('view');
    } catch (err: any) {
      console.error('Error sharing container:', err);
      showError(err.message || 'Failed to share container');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeShare = async (share: ContainerShare) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await revokeContainerShare(containerId, share.sharedWithId, user.uid);
      showSuccess(`Access revoked for ${share.sharedWithName || share.sharedWithEmail}`);
      
      // Refresh shares list
      await loadContainerShares();
    } catch (err: any) {
      console.error('Error revoking share:', err);
      showError(err.message || 'Failed to revoke access');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = async (share: ContainerShare, newPermission: SharePermission) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await updateSharePermission(containerId, share.sharedWithId, newPermission, user.uid);
      showSuccess(`Permission updated for ${share.sharedWithName || share.sharedWithEmail}`);
      
      // Refresh shares list
      await loadContainerShares();
    } catch (err: any) {
      console.error('Error updating permission:', err);
      showError(err.message || 'Failed to update permission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" className="bg-body">
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title className="text-body">
          Share "{containerName}"
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="bg-body">
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Add New Share Section */}
        <div className="mb-4">
          <h6 className="text-body mb-3">Share with New User</h6>
          
          <Form.Group className="mb-3">
            <Form.Label className="text-body">Search by email or name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-body text-body border"
            />
            {searchLoading && (
              <div className="mt-2">
                <Spinner animation="border" size="sm" className="me-2" />
                <span className="text-muted">Searching users...</span>
              </div>
            )}
          </Form.Group>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-3">
              <small className="text-muted">Select a user:</small>
              <ListGroup className="mt-1">
                {searchResults.map((user) => (
                  <ListGroup.Item
                    key={user.uid}
                    action
                    active={selectedUser?.uid === user.uid}
                    onClick={() => setSelectedUser(user)}
                    className="bg-light border"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="text-body fw-medium">
                          {user.displayName || 'No name'}
                        </div>
                        <small className="text-muted">{user.email}</small>
                      </div>
                      {user.isAdmin && (
                        <Badge bg="warning" text="dark">Admin</Badge>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          {/* Permission Selection */}
          {selectedUser && (
            <Form.Group className="mb-3">
              <Form.Label className="text-body">Permission Level</Form.Label>
              <Form.Select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value as SharePermission)}
                className="bg-body text-body border"
              >
                <option value="view">View Only - Can see container and items</option>
                <option value="edit">Can Edit - Can add, edit, and delete items</option>
                <option value="admin">Full Access - Can edit container and manage sharing</option>
              </Form.Select>
            </Form.Group>
          )}

          {/* Share Button */}
          <Button
            variant="primary"
            onClick={handleShareContainer}
            disabled={!selectedUser || loading}
            className="w-100"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Sharing...
              </>
            ) : (
              'Share Container'
            )}
          </Button>
        </div>

        <hr className="border-secondary" />

        {/* Current Shares Section */}
        <div>
          <h6 className="text-body mb-3">Currently Shared With</h6>
          
          {loading && shares.length === 0 ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" className="me-2" />
              <span className="text-muted">Loading shares...</span>
            </div>
          ) : shares.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-muted">
                <i className="bi bi-people fs-1 d-block mb-2"></i>
                This container is not shared with anyone yet.
              </div>
            </div>
          ) : (
            <ListGroup>
              {shares.map((share) => (
                <ListGroup.Item key={share.id} className="bg-light border">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-body fw-medium">
                        {share.sharedWithName || 'No name'}
                      </div>
                      <small className="text-muted">{share.sharedWithEmail}</small>
                      <div className="mt-1">
                        <small className="text-muted">
                          Shared {share.sharedAt.toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center gap-2">
                      <Form.Select
                        size="sm"
                        value={share.permission}
                        onChange={(e) => handleUpdatePermission(share, e.target.value as SharePermission)}
                        disabled={loading}
                        className="bg-body text-body border"
                        style={{ width: '140px' }}
                      >
                        <option value="view">View Only</option>
                        <option value="edit">Can Edit</option>
                        <option value="admin">Full Access</option>
                      </Form.Select>
                      
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRevokeShare(share)}
                        disabled={loading}
                        title="Revoke access"
                      >
                        <i className="bi bi-x-lg"></i>
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer className="bg-light border-top">
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShareContainerModal;