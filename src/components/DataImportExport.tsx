import { useState, useRef } from 'react';
import { Card, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { useNotifications } from './NotificationSystem';
import { dataExportService } from '../services/dataExportService';
import { excelExportService } from '../services/excelExportService';
import type { ExportData, ImportResult } from '../services/dataExportService';
import type { ExcelExportOptions } from '../services/excelExportService';

const DataImportExport = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [importData, setImportData] = useState<ExportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportUserId, setExportUserId] = useState<string>('');
  const [importUserId, setImportUserId] = useState<string>('');
  const [excelOptions, setExcelOptions] = useState<ExcelExportOptions>({
    includeImages: false,
    includeFinancials: true,
    includeStatistics: true
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const { showSuccess, showError } = useNotifications();

  const handleExport = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await dataExportService.exportUserData(exportUserId || undefined);
      setExportData(data);
      setShowExportModal(true);
    } catch (error) {
      console.error('Export error:', error);
      showError('Export Failed', 'Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExport = () => {
    if (!exportData) return;
    
    const filename = exportUserId 
      ? `hearth-user-export-${exportUserId}-${new Date().toISOString().split('T')[0]}.json`
      : `hearth-full-export-${new Date().toISOString().split('T')[0]}.json`;
    
    dataExportService.downloadExportData(exportData, filename);
    showSuccess('Export Complete', 'Data exported successfully as JSON!');
    setShowExportModal(false);
    setExportData(null);
  };

  const handleDownloadExcel = async () => {
    if (!exportData) return;

    try {
      setLoading(true);
      await excelExportService.exportToExcel(exportData, excelOptions);
      showSuccess('Export Complete', 'Data exported successfully as Excel spreadsheet!');
      setShowExportModal(false);
      setExportData(null);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showError('Invalid File', 'Please select a JSON file.');
      return;
    }

    // Read and validate file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const validation = dataExportService.validateImportData(data);
        
        if (!validation.valid) {
          showError('Invalid Import File', `File validation failed: ${validation.errors.join(', ')}`);
          return;
        }
        
        setImportData(data);
      } catch (error) {
        showError('Invalid File', 'Failed to parse JSON file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData || !importUserId.trim()) {
      showError('Import Error', 'Please select a file and specify a target user ID.');
      return;
    }

    try {
      setLoading(true);
      const result = await dataExportService.importData(importData, importUserId.trim());
      setImportResult(result);
      
      if (result.success) {
        showSuccess('Import Complete', result.message);
      } else {
        showError('Import Failed', result.message);
      }
    } catch (error) {
      console.error('Import error:', error);
      showError('Import Failed', 'Failed to import data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setImportData(null);
    setImportResult(null);
    setImportUserId('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetExport = () => {
    setExportData(null);
    setExportUserId('');
    setExcelOptions({
      includeImages: false,
      includeFinancials: true,
      includeStatistics: true
    });
  };

  return (
    <>
      <Card>
        <Card.Header>
          <h5 className="mb-0">📦 Data Import/Export</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex gap-3 flex-wrap">
            <Button 
              variant="primary" 
              onClick={() => setShowExportModal(true)}
              disabled={loading}
            >
              📤 Export Data
            </Button>
            <Button 
              variant="success" 
              onClick={() => setShowImportModal(true)}
              disabled={loading}
            >
              📥 Import Data
            </Button>
          </div>
          <div className="mt-3">
            <small className="text-muted">
              Export all containers, items, tags, and categories as JSON. 
              Import data from previous exports or external sources.
            </small>
          </div>
        </Card.Body>
      </Card>

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => { setShowExportModal(false); resetExport(); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Export Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!exportData ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>User ID (optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Leave empty to export all users' data"
                  value={exportUserId}
                  onChange={(e) => setExportUserId(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Specify a user ID to export only that user's data, or leave empty for full export.
                </Form.Text>
              </Form.Group>
              
              {loading && (
                <div className="text-center py-3">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Exporting...</span>
                  </div>
                  <p className="mt-2 text-muted">Gathering data for export...</p>
                </div>
              )}
            </>
          ) : (
            <div>
              <Alert variant="success">
                <h6>Export Ready!</h6>
                <div className="row">
                  <div className="col-6">
                    <strong>Containers:</strong> <Badge bg="primary">{exportData.exportInfo.totalContainers}</Badge>
                  </div>
                  <div className="col-6">
                    <strong>Items:</strong> <Badge bg="primary">{exportData.exportInfo.totalItems}</Badge>
                  </div>
                  <div className="col-6">
                    <strong>Tags:</strong> <Badge bg="secondary">{exportData.exportInfo.totalTags}</Badge>
                  </div>
                  <div className="col-6">
                    <strong>Categories:</strong> <Badge bg="secondary">{exportData.exportInfo.totalCategories}</Badge>
                  </div>
                </div>
                <hr />
                <small>
                  <strong>Exported:</strong> {new Date(exportData.exportInfo.exportedAt).toLocaleString()}<br />
                  <strong>Version:</strong> {exportData.exportInfo.version}
                </small>
              </Alert>

              {/* Excel Export Options */}
              <div className="mb-3">
                <h6>📊 Excel Export Options</h6>
                <div className="border rounded p-3 bg-light">
                  <div className="row">
                    <div className="col-md-4">
                      <Form.Check
                        type="checkbox"
                        id="admin-includeFinancials"
                        label="Include Financial Data"
                        checked={excelOptions.includeFinancials}
                        onChange={() => handleExcelOptionChange('includeFinancials')}
                      />
                      <small className="text-muted">Purchase prices, dates, warranty info</small>
                    </div>
                    <div className="col-md-4">
                      <Form.Check
                        type="checkbox"
                        id="admin-includeStatistics"
                        label="Include Statistics"
                        checked={excelOptions.includeStatistics}
                        onChange={() => handleExcelOptionChange('includeStatistics')}
                      />
                      <small className="text-muted">Summary calculations and analytics</small>
                    </div>
                    <div className="col-md-4">
                      <Form.Check
                        type="checkbox"
                        id="admin-includeImages"
                        label="Include Image Status"
                        checked={excelOptions.includeImages}
                        onChange={() => handleExcelOptionChange('includeImages')}
                      />
                      <small className="text-muted">Whether items have photos</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowExportModal(false); resetExport(); }}>
            Cancel
          </Button>
          {!exportData ? (
            <Button variant="primary" onClick={handleExport} disabled={loading}>
              {loading ? 'Exporting...' : 'Generate Export'}
            </Button>
          ) : (
            <div className="d-flex gap-2">
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
                  '📊 Download Excel'
                )}
              </Button>
              <Button variant="outline-primary" onClick={handleDownloadExport}>
                📄 Download JSON
              </Button>
            </div>
          )}
        </Modal.Footer>
      </Modal>

      {/* Import Modal */}
      <Modal show={showImportModal} onHide={() => { setShowImportModal(false); resetImport(); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Import Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!importResult ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Target User ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter user ID to import data for"
                  value={importUserId}
                  onChange={(e) => setImportUserId(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  All imported data will be assigned to this user ID.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Import File</Form.Label>
                <Form.Control
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                />
                <Form.Text className="text-muted">
                  Select a JSON export file from Hearth.
                </Form.Text>
              </Form.Group>

              {importData && (
                <Alert variant="info">
                  <h6>Import Preview</h6>
                  <div className="row">
                    <div className="col-6">
                      <strong>Containers:</strong> <Badge bg="primary">{importData.exportInfo.totalContainers}</Badge>
                    </div>
                    <div className="col-6">
                      <strong>Items:</strong> <Badge bg="primary">{importData.exportInfo.totalItems}</Badge>
                    </div>
                    <div className="col-6">
                      <strong>Tags:</strong> <Badge bg="secondary">{importData.exportInfo.totalTags}</Badge>
                    </div>
                    <div className="col-6">
                      <strong>Categories:</strong> <Badge bg="secondary">{importData.exportInfo.totalCategories}</Badge>
                    </div>
                  </div>
                  <hr />
                  <small>
                    <strong>Original Export:</strong> {new Date(importData.exportInfo.exportedAt).toLocaleString()}<br />
                    <strong>Version:</strong> {importData.exportInfo.version}
                  </small>
                </Alert>
              )}

              {loading && (
                <div className="text-center py-3">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Importing...</span>
                  </div>
                  <p className="mt-2 text-muted">Importing data...</p>
                </div>
              )}
            </>
          ) : (
            <div>
              <Alert variant={importResult.success ? "success" : "danger"}>
                <h6>{importResult.success ? "Import Successful!" : "Import Failed"}</h6>
                <p>{importResult.message}</p>
                
                {importResult.success && (
                  <div className="row">
                    <div className="col-6">
                      <strong>Containers:</strong> <Badge bg="success">{importResult.imported.containers}</Badge>
                    </div>
                    <div className="col-6">
                      <strong>Items:</strong> <Badge bg="success">{importResult.imported.items}</Badge>
                    </div>
                    <div className="col-6">
                      <strong>Tags:</strong> <Badge bg="success">{importResult.imported.tags}</Badge>
                    </div>
                    <div className="col-6">
                      <strong>Categories:</strong> <Badge bg="success">{importResult.imported.categories}</Badge>
                    </div>
                  </div>
                )}

                {importResult.errors.length > 0 && (
                  <div className="mt-3">
                    <h6>Errors:</h6>
                    <ul className="mb-0">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowImportModal(false); resetImport(); }}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult && (
            <Button 
              variant="success" 
              onClick={handleImport} 
              disabled={loading || !importData || !importUserId.trim()}
            >
              {loading ? 'Importing...' : 'Import Data'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DataImportExport;