import { useState } from 'react';
import { Card, Button, Modal, Alert, ProgressBar, Badge, Form } from 'react-bootstrap';
import { useNotifications } from './NotificationSystem';
import { base64OptimizationService } from '../services/base64OptimizationService';
import type { OptimizationProgress, OptimizationResult } from '../services/base64OptimizationService';

const ImageMigration = () => {
  const [showModal, setShowModal] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [progress, setProgress] = useState<OptimizationProgress | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [targetUserId, setTargetUserId] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const { showSuccess, showError } = useNotifications();

  const loadOptimizationStats = async () => {
    if (!targetUserId.trim()) {
      showError('Error', 'Please enter a user ID to check optimization stats.');
      return;
    }

    try {
      setLoadingStats(true);
      const optimizationStats = await base64OptimizationService.getOptimizationStats(targetUserId.trim());
      setStats(optimizationStats);
    } catch (error) {
      console.error('Error loading optimization stats:', error);
      showError('Error', 'Failed to load optimization statistics.');
    } finally {
      setLoadingStats(false);
    }
  };

  const startOptimization = async () => {
    if (!targetUserId.trim()) {
      showError('Error', 'Please enter a user ID to optimize.');
      return;
    }

    try {
      setOptimizing(true);
      setProgress(null);
      setResult(null);

      const optimizationResult = await base64OptimizationService.optimizeUserImages(
        targetUserId.trim(),
        (progressUpdate: OptimizationProgress) => {
          setProgress(progressUpdate);
        }
      );

      setResult(optimizationResult);
      
      if (optimizationResult.success) {
        showSuccess(
          'Optimization Complete', 
          `Successfully optimized ${optimizationResult.containersProcessed} containers and ${optimizationResult.itemsProcessed} items.`
        );
      } else {
        showError(
          'Optimization Completed with Errors', 
          `Processed ${optimizationResult.containersProcessed + optimizationResult.itemsProcessed} images with ${optimizationResult.errors.length} errors.`
        );
      }

      // Refresh stats after optimization
      await loadOptimizationStats();

    } catch (error) {
      console.error('Optimization error:', error);
      showError('Optimization Failed', 'Failed to optimize images. Please try again.');
    } finally {
      setOptimizing(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const resetModal = () => {
    setProgress(null);
    setResult(null);
    setStats(null);
    setTargetUserId('');
  };

  return (
    <>
      <Card>
        <Card.Header>
          <h5 className="mb-0">🖼️ Image Optimization</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-3">
            Optimize base64 images to reduce file sizes and improve performance. 
            This will compress images and create thumbnails while keeping them in Firestore.
          </p>
          <Button 
            variant="warning" 
            onClick={() => setShowModal(true)}
            disabled={optimizing}
          >
            🚀 Start Image Optimization
          </Button>
        </Card.Body>
      </Card>

      {/* Optimization Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetModal(); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Image Optimization</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!result ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>User ID</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Enter user ID to optimize images for"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    disabled={optimizing}
                  />
                  <Button 
                    variant="outline-primary" 
                    onClick={loadOptimizationStats}
                    disabled={loadingStats || optimizing || !targetUserId.trim()}
                  >
                    {loadingStats ? 'Loading...' : 'Check Stats'}
                  </Button>
                </div>
                <Form.Text className="text-muted">
                  Enter the user ID whose images you want to optimize for better performance.
                </Form.Text>
              </Form.Group>

              {stats && (
                <Alert variant="info">
                  <h6>Optimization Statistics</h6>
                  <div className="row">
                    <div className="col-6">
                      <strong>Containers with Base64:</strong> <Badge bg="primary">{stats.containersWithBase64Images}</Badge>
                    </div>
                    <div className="col-6">
                      <strong>Items with Base64:</strong> <Badge bg="primary">{stats.itemsWithBase64Images}</Badge>
                    </div>
                    <div className="col-6">
                      <strong>Large Containers (&gt;100KB):</strong> <Badge bg="warning">{stats.containersWithLargeImages}</Badge>
                    </div>
                    <div className="col-6">
                      <strong>Large Items (&gt;100KB):</strong> <Badge bg="warning">{stats.itemsWithLargeImages}</Badge>
                    </div>
                    <div className="col-12 mt-2">
                      <strong>Current Total Size:</strong> <Badge bg="danger">{formatBytes(stats.totalCurrentSize)}</Badge>
                    </div>
                    <div className="col-12">
                      <strong>Estimated After Optimization:</strong> <Badge bg="success">{formatBytes(stats.estimatedOptimizedSize)}</Badge>
                    </div>
                    <div className="col-12">
                      <strong>Estimated Savings:</strong> <Badge bg="info">{formatBytes(stats.estimatedSavings)} ({Math.round((1 - stats.estimatedOptimizedSize / stats.totalCurrentSize) * 100)}%)</Badge>
                    </div>
                  </div>
                  <hr />
                  <div>
                    <small className="text-muted">
                      All base64 images will be optimized. Large images (over 100KB) will see the most improvement.
                    </small>
                  </div>
                </Alert>
              )}

              {progress && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Optimization Progress</span>
                    <span>{progress.completed + progress.failed} / {progress.total}</span>
                  </div>
                  <ProgressBar>
                    <ProgressBar 
                      variant="success" 
                      now={(progress.completed / progress.total) * 100} 
                      key={1} 
                    />
                    <ProgressBar 
                      variant="danger" 
                      now={(progress.failed / progress.total) * 100} 
                      key={2} 
                    />
                  </ProgressBar>
                  <small className="text-muted mt-1 d-block">
                    {progress.current}
                  </small>
                  
                  {progress.errors.length > 0 && (
                    <Alert variant="warning" className="mt-2">
                      <strong>Errors ({progress.errors.length}):</strong>
                      <ul className="mb-0 mt-1">
                        {progress.errors.slice(-3).map((error, index) => (
                          <li key={index}><small>{error}</small></li>
                        ))}
                        {progress.errors.length > 3 && (
                          <li><small>... and {progress.errors.length - 3} more</small></li>
                        )}
                      </ul>
                    </Alert>
                  )}
                </div>
              )}

              {optimizing && (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Optimizing...</span>
                  </div>
                  <p className="mt-2 text-muted">
                    Optimizing images for better performance... This may take several minutes.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div>
              <Alert variant={result.success ? "success" : "warning"}>
                <h6>{result.success ? "Optimization Successful!" : "Optimization Completed with Issues"}</h6>
                <div className="row">
                  <div className="col-6">
                    <strong>Containers:</strong> <Badge bg="success">{result.containersProcessed}</Badge>
                  </div>
                  <div className="col-6">
                    <strong>Items:</strong> <Badge bg="success">{result.itemsProcessed}</Badge>
                  </div>
                  <div className="col-6 mt-2">
                    <strong>Size Before:</strong> <Badge bg="danger">{formatBytes(result.totalSizeBefore)}</Badge>
                  </div>
                  <div className="col-6 mt-2">
                    <strong>Size After:</strong> <Badge bg="success">{formatBytes(result.totalSizeAfter)}</Badge>
                  </div>
                  <div className="col-6 mt-2">
                    <strong>Size Saved:</strong> <Badge bg="info">{formatBytes(result.sizeSaved)}</Badge>
                  </div>
                  <div className="col-6 mt-2">
                    <strong>Compression:</strong> <Badge bg="primary">{result.compressionRatio.toFixed(1)}x</Badge>
                  </div>
                  <div className="col-12 mt-2">
                    <strong>Time Elapsed:</strong> <Badge bg="info">{formatTime(result.timeElapsed)}</Badge>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="mt-3">
                    <h6>Errors ({result.errors.length}):</h6>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <ul className="mb-0">
                        {result.errors.map((error, index) => (
                          <li key={index}><small>{error}</small></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Alert>

              {stats && (
                <Alert variant="info">
                  <h6>Updated Statistics</h6>
                  <div className="row">
                    <div className="col-6">
                      <strong>Containers with Base64:</strong> <Badge bg="primary">{stats.containersWithBase64Images}</Badge>
                    </div>
                    <div className="col-6">
                      <strong>Items with Base64:</strong> <Badge bg="primary">{stats.itemsWithBase64Images}</Badge>
                    </div>
                    <div className="col-6">
                      <strong>Large Containers (&gt;100KB):</strong> <Badge bg="warning">{stats.containersWithLargeImages}</Badge>
                    </div>
                    <div className="col-6">
                      <strong>Large Items (&gt;100KB):</strong> <Badge bg="warning">{stats.itemsWithLargeImages}</Badge>
                    </div>
                    <div className="col-12 mt-2">
                      <strong>Current Total Size:</strong> <Badge bg="success">{formatBytes(stats.totalCurrentSize)}</Badge>
                    </div>
                  </div>
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowModal(false); resetModal(); }}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button 
              variant="warning" 
              onClick={startOptimization} 
              disabled={optimizing || !targetUserId.trim() || !stats}
            >
              {optimizing ? 'Optimizing...' : 'Start Optimization'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ImageMigration;