import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Alert } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { performGlobalSearch } from '../services/searchService';
import type { GroupedSearchResults, SearchResult } from '../services/searchService';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<GroupedSearchResults>({
    containers: [],
    itemsByContainer: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { user } = useAuthStore();

  useEffect(() => {
    const query = searchParams.get('q');
    if (query && user) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, [searchParams, user]);

  const performSearch = async (term: string) => {
    if (!user || !term.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const searchResults = await performGlobalSearch(user.uid, term);
      setResults(searchResults);
    } catch (err: any) {
      setError('Search failed. Please try again.');
      setResults({ containers: [], itemsByContainer: {} });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  const getTotalResults = () => {
    const containerCount = results.containers.length;
    const itemCount = Object.values(results.itemsByContainer).reduce(
      (total, group) => total + group.items.length,
      0
    );
    return containerCount + itemCount;
  };

  const getResultBadge = (result: SearchResult) => {
    if (result.isShared && result.sharedByName) {
      return (
        <Badge bg="info" className="ms-2">
          Shared by {result.sharedByName}
        </Badge>
      );
    }
    return null;
  };

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Please log in to search your inventory.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h1>🔍 Search Your Inventory</h1>
          
          {/* Search Form */}
          <Form onSubmit={handleSearchSubmit} className="mb-4">
            <Row>
              <Col md={8}>
                <Form.Control
                  type="text"
                  placeholder="Search containers and items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="lg"
                />
              </Col>
              <Col md={4}>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  className="w-100"
                  disabled={loading || !searchTerm.trim()}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </Col>
            </Row>
          </Form>

          {/* Error Message */}
          {error && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Searching...</span>
              </div>
              <p className="mt-3 text-muted">Searching your inventory...</p>
            </div>
          )}

          {/* Results Summary */}
          {hasSearched && !loading && (
            <div className="mb-4">
              <h5>
                {getTotalResults() > 0 
                  ? `Found ${getTotalResults()} result${getTotalResults() !== 1 ? 's' : ''} for "${searchParams.get('q')}"`
                  : `No results found for "${searchParams.get('q')}"`
                }
              </h5>
            </div>
          )}

          {/* Container Results */}
          {results.containers.length > 0 && (
            <div className="mb-5">
              <h4 className="mb-3">📦 Containers ({results.containers.length})</h4>
              <Row>
                {results.containers.map((container) => (
                  <Col md={6} lg={4} key={container.id} className="mb-3">
                    <Card className={container.isShared ? 'border-info' : ''}>
                      {container.imageUrl && (
                        <Card.Img 
                          variant="top" 
                          src={container.imageUrl} 
                          style={{ height: '150px', objectFit: 'cover' }}
                        />
                      )}
                      <Card.Body>
                        <Card.Title className="d-flex align-items-center">
                          <span className="me-2">{container.isShared ? '🤝' : '📦'}</span>
                          {container.name}
                          {getResultBadge(container)}
                        </Card.Title>
                        {container.description && (
                          <Card.Text className="text-muted">
                            {container.description}
                          </Card.Text>
                        )}
                        {container.location && (
                          <div className="mb-2">
                            <small className="text-muted">
                              <i className="bi bi-geo-alt me-1"></i>
                              {container.location}
                            </small>
                          </div>
                        )}
                        <Link 
                          to={`/container/${container.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          View Container
                        </Link>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Item Results Grouped by Container */}
          {Object.keys(results.itemsByContainer).length > 0 && (
            <div className="mb-5">
              <h4 className="mb-3">
                📋 Items ({Object.values(results.itemsByContainer).reduce((total, group) => total + group.items.length, 0)})
              </h4>
              
              {Object.entries(results.itemsByContainer).map(([containerId, group]) => (
                <div key={containerId} className="mb-4">
                  <Card className={group.container.isShared ? 'border-info' : ''}>
                    <Card.Header className={`d-flex justify-content-between align-items-center ${group.container.isShared ? 'bg-info-subtle' : 'bg-light'}`}>
                      <div>
                        <h6 className="mb-0 d-flex align-items-center">
                          <span className="me-2">{group.container.isShared ? '🤝' : '📦'}</span>
                          {group.container.name}
                          {getResultBadge(group.container)}
                        </h6>
                        {group.container.location && (
                          <small className="text-muted">
                            <i className="bi bi-geo-alt me-1"></i>
                            {group.container.location}
                          </small>
                        )}
                      </div>
                      <Link 
                        to={`/container/${group.container.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        View Container
                      </Link>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        {group.items.map((item) => (
                          <Col md={6} lg={4} key={item.id} className="mb-3">
                            <Card className="h-100 border-0 bg-light">
                              {item.imageUrl && (
                                <Card.Img 
                                  variant="top" 
                                  src={item.imageUrl} 
                                  style={{ height: '120px', objectFit: 'cover' }}
                                />
                              )}
                              <Card.Body className="p-3">
                                <Card.Title className="h6 d-flex align-items-center">
                                  <span className="me-2">📋</span>
                                  {item.name}
                                </Card.Title>
                                {item.description && (
                                  <Card.Text className="small text-muted">
                                    {item.description}
                                  </Card.Text>
                                )}
                                <Link 
                                  to={`/item/${item.id}`}
                                  className="btn btn-outline-primary btn-sm"
                                >
                                  View Item
                                </Link>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {/* No Results State */}
          {hasSearched && !loading && getTotalResults() === 0 && (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-search display-1 text-muted"></i>
              </div>
              <h4>No results found</h4>
              <p className="text-muted mb-4">
                We couldn't find any containers or items matching "{searchParams.get('q')}"
              </p>
              <div className="text-muted">
                <p><strong>Search tips:</strong></p>
                <ul className="list-unstyled">
                  <li>• Try different keywords</li>
                  <li>• Check your spelling</li>
                  <li>• Use broader search terms</li>
                  <li>• Search for brand names, models, or descriptions</li>
                </ul>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!hasSearched && !loading && (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-search display-1 text-muted"></i>
              </div>
              <h4>Search Your Inventory</h4>
              <p className="text-muted">
                Find containers and items across your entire inventory, including shared containers.
              </p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SearchResultsPage;