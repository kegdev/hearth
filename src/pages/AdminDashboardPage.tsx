import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { 
  getPendingRegistrationRequests, 
  approveRegistrationRequest, 
  denyRegistrationRequest
} from '../services/userRegistrationService';
import { useNotifications } from '../components/NotificationSystem';
import DataImportExport from '../components/DataImportExport';
import ImageMigration from '../components/ImageMigration';
import type { UserRegistrationRequest } from '../types';

const AdminDashboardPage = () => {
  const [requests, setRequests] = useState<UserRegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<UserRegistrationRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'deny'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const { user } = useAuthStore();
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    if (user) {
      loadPendingRequests();
    }
  }, [user]);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const pendingRequests = await getPendingRegistrationRequests();
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      showError('Error', 'Failed to load pending registration requests.');
    } finally {
      setLoading(false);
    }
  };



  const handleActionClick = (request: UserRegistrationRequest, action: 'approve' | 'deny') => {
    setSelectedRequest(request);
    setModalAction(action);
    setReviewNotes('');
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !user) return;

    setProcessing(true);

    try {
      if (modalAction === 'approve') {
        await approveRegistrationRequest(selectedRequest.id, user.uid, reviewNotes);
        // Note: In a real implementation, you'd also create the Firebase Auth user here
        // and update their profile status
        showSuccess(
          'Request Approved! ✅',
          `${selectedRequest.email} has been approved for access.`
        );
      } else {
        await denyRegistrationRequest(selectedRequest.id);
        showSuccess(
          'Request Denied',
          `${selectedRequest.email} has been denied access. They can resubmit a new request if needed.`
        );
      }

      // Remove the processed request from the list
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      setShowModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error(`Error ${modalAction}ing request:`, error);
      showError(
        'Action Failed',
        `Failed to ${modalAction} the registration request. Please try again.`
      );
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <h4>Access Denied</h4>
          <p>You must be logged in to access the admin dashboard.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>🛡️ Admin Dashboard</h1>
              <p className="text-muted">Manage user registration requests</p>
            </div>
            <Button variant="outline-secondary" onClick={loadPendingRequests} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Loading...
                </>
              ) : (
                '🔄 Refresh'
              )}
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                Pending Registration Requests 
                <Badge bg="primary" className="ms-2">{requests.length}</Badge>
              </h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-5">
                  <h3 className="text-muted">🎉 All Caught Up!</h3>
                  <p className="text-muted">No pending registration requests at the moment.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Reason</th>
                        <th>Requested</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => (
                        <tr key={request.id}>
                          <td>
                            <strong>{request.email}</strong>
                          </td>
                          <td>
                            {request.displayName || (
                              <span className="text-muted">Not provided</span>
                            )}
                          </td>
                          <td>
                            <div style={{ maxWidth: '300px' }}>
                              {request.reason.length > 100 
                                ? `${request.reason.substring(0, 100)}...`
                                : request.reason
                              }
                            </div>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(request.requestedAt)}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleActionClick(request, 'approve')}
                              >
                                ✅ Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleActionClick(request, 'deny')}
                              >
                                ❌ Deny
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Import/Export Section */}
      <Row className="mt-4">
        <Col>
          <DataImportExport />
        </Col>
      </Row>

      {/* Image Migration Section */}
      <Row className="mt-4">
        <Col>
          <ImageMigration />
        </Col>
      </Row>

      {/* Action Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalAction === 'approve' ? '✅ Approve Request' : '❌ Deny Request'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <div className="mb-3">
                <strong>Email:</strong> {selectedRequest.email}<br />
                <strong>Name:</strong> {selectedRequest.displayName || 'Not provided'}<br />
                <strong>Requested:</strong> {formatDate(selectedRequest.requestedAt)}
              </div>
              
              <div className="mb-3">
                <strong>Why do you want to use Hearth?</strong>
                <div className="border rounded p-3 mt-2 bg-light" style={{ minHeight: '60px' }}>
                  {selectedRequest.reason ? (
                    <div className="text-dark fw-normal">
                      {selectedRequest.reason}
                    </div>
                  ) : (
                    <span className="text-muted fst-italic">No reason provided</span>
                  )}
                </div>
              </div>

              <Form.Group>
                <Form.Label>
                  {modalAction === 'approve' ? 'Approval Notes (Optional)' : 'Denial Reason (Optional)'}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder={
                    modalAction === 'approve' 
                      ? 'Add any notes about this approval...'
                      : 'Explain why this request was denied...'
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </Form.Group>

              <Alert variant={modalAction === 'approve' ? 'success' : 'warning'} className="mt-3">
                <strong>
                  {modalAction === 'approve' 
                    ? '✅ This will grant the user full access to Hearth.'
                    : '❌ This will deny the user access to Hearth.'
                  }
                </strong>
                <br />
                {modalAction === 'approve' 
                  ? 'The user will be notified via email about this approval.'
                  : 'The user will see a denial message when they try to access the app.'
                }
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant={modalAction === 'approve' ? 'success' : 'danger'}
            onClick={handleConfirmAction}
            disabled={processing}
          >
            {processing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Processing...
              </>
            ) : (
              modalAction === 'approve' ? '✅ Approve User' : '❌ Deny User'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboardPage;