import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { useNotifications } from '../components/NotificationSystem';
import { dataExportService } from '../services/dataExportService';
import { excelExportService } from '../services/excelExportService';
import type { ExportData } from '../services/dataExportService';
import type { ExcelExportOptions } from '../services/excelExportService';

const UserControlPanelPage = () => {
  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [excelOptions, setExcelOptions] = useState<ExcelExportOptions>({
    includeImages: false,
    includeFinancials: true,
    includeStatistics: true
  });

  const { user } = useAuthStore();
  const { showSuccess, showError } = useNotifications();

  const handleExportData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await dataExportService.exportUserData(user.uid);
      setExportData(data);
    } catch (error) {
      console.error('Export error:', error);
      showError('Export Failed', 'Failed to export your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!exportData) return;
    
    const filename = `my-hearth-inventory-${new Date().toISOString().split('T')[0]}.json`;
    dataExportService.downloadExportData(exportData, filename);
    showSuccess('Export Complete', 'Your inventory data has been downloaded as JSON!');
  };

  const handleDownloadExcel = async () => {
    if (!exportData) return;

    try {
      setLoading(true);
      await excelExportService.exportToExcel(exportData, excelOptions);
      showSuccess('Export Complete', 'Your inventory has been downloaded as an Excel spreadsheet!');
    } catch (error) {
      console.error('Excel export error:', error);
      showError('Export Failed', 'Failed to create Excel file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelOptionChange = (option: keyof ExcelExportOptions) => {
    setExcelOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <h4>Access Denied</h4>
          <p>You must be logged in to access your control panel.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="mb-4">
            <h1>⚙️ Control Panel</h1>
            <p className="text-muted">Manage your account and export your inventory data</p>
          </div>
        </Col>
      </Row>

      {/* Account Information */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">👤 Account Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Account Created:</strong> {user.metadata?.creationTime 
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : 'Unknown'
                  }</p>
                  <p><strong>Last Sign In:</strong> {user.metadata?.lastSignInTime
                    ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                    : 'Unknown'
                  }</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Export */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">📦 Export Your Inventory</h5>
            </Card.Header>
            <Card.Body>
              {!exportData ? (
                <>
                  <p className="text-muted mb-3">
                    Download your complete inventory data including containers, items, tags, and categories.
                  </p>
                  
                  <div className="d-flex gap-2 mb-3">
                    <Button 
                      variant="primary" 
                      onClick={handleExportData}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Preparing Export...
                        </>
                      ) : (
                        '📊 Prepare Export'
                      )}
                    </Button>
                  </div>

                  <Alert variant="info">
                    <small>
                      <strong>What's included:</strong> All your containers, items, tags, categories, 
                      and metadata. Personal data only - no other users' information.
                    </small>
                  </Alert>
                </>
              ) : (
                <>
                  <Alert variant="success">
                    <h6>✅ Export Ready!</h6>
                    <Row>
                      <Col sm={6} md={3}>
                        <strong>Containers:</strong> <Badge bg="primary">{exportData.exportInfo.totalContainers}</Badge>
                      </Col>
                      <Col sm={6} md={3}>
                        <strong>Items:</strong> <Badge bg="primary">{exportData.exportInfo.totalItems}</Badge>
                      </Col>
                      <Col sm={6} md={3}>
                        <strong>Tags:</strong> <Badge bg="secondary">{exportData.exportInfo.totalTags}</Badge>
                      </Col>
                      <Col sm={6} md={3}>
                        <strong>Categories:</strong> <Badge bg="secondary">{exportData.exportInfo.totalCategories}</Badge>
                      </Col>
                    </Row>
                    <hr />
                    <small>
                      <strong>Prepared:</strong> {new Date(exportData.exportInfo.exportedAt).toLocaleString()}
                    </small>
                  </Alert>

                  {/* Excel Export Options */}
                  <Card className="mb-3">
                    <Card.Header>
                      <h6 className="mb-0">📊 Excel Export Options</h6>
                    </Card.Header>
                    <Card.Body>
                      <Form>
                        <Row>
                          <Col md={4}>
                            <Form.Check
                              type="checkbox"
                              id="includeFinancials"
                              label="Include Financial Data"
                              checked={excelOptions.includeFinancials}
                              onChange={() => handleExcelOptionChange('includeFinancials')}
                            />
                            <small className="text-muted">Purchase prices, dates, warranty info</small>
                          </Col>
                          <Col md={4}>
                            <Form.Check
                              type="checkbox"
                              id="includeStatistics"
                              label="Include Statistics"
                              checked={excelOptions.includeStatistics}
                              onChange={() => handleExcelOptionChange('includeStatistics')}
                            />
                            <small className="text-muted">Summary calculations and analytics</small>
                          </Col>
                          <Col md={4}>
                            <Form.Check
                              type="checkbox"
                              id="includeImages"
                              label="Include Image Status"
                              checked={excelOptions.includeImages}
                              onChange={() => handleExcelOptionChange('includeImages')}
                            />
                            <small className="text-muted">Whether items have photos</small>
                          </Col>
                        </Row>
                      </Form>
                    </Card.Body>
                  </Card>

                  {/* Download Options */}
                  <div className="d-flex gap-2 flex-wrap">
                    <Button 
                      variant="success" 
                      onClick={handleDownloadExcel}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating Excel...
                        </>
                      ) : (
                        '📊 Download Excel Spreadsheet'
                      )}
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      onClick={handleDownloadJSON}
                    >
                      📄 Download JSON (Technical)
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setExportData(null)}
                    >
                      🔄 Prepare New Export
                    </Button>
                  </div>

                  <Alert variant="info" className="mt-3">
                    <small>
                      <strong>Excel Format:</strong> Multi-sheet workbook with Summary, Containers, Items, Tags, and Categories sheets. 
                      Perfect for analysis, sharing, or importing into other systems.
                    </small>
                  </Alert>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Privacy & Data */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">🔒 Privacy & Data</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Data Storage</h6>
                  <p className="text-muted small">
                    Your inventory data is securely stored in Firebase and only accessible to you. 
                    Exports contain only your personal data.
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Data Sharing</h6>
                  <p className="text-muted small">
                    Your data is never shared with third parties. Container sharing features 
                    only share what you explicitly choose to share.
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Support */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">💬 Need Help?</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                Having trouble with exports or need assistance? Visit our{' '}
                <a href="/contact" className="text-decoration-none">Contact Page</a> for 
                support options and frequently asked questions.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserControlPanelPage;