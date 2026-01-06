import React, { useState, useEffect, useRef } from 'react';
import { Form, Badge, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getSearchSuggestions } from '../services/searchService';
import type { SearchResult } from '../services/searchService';

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
  onResultSelect?: (result: SearchResult) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  placeholder = "Search containers and items...",
  className = "",
  onResultSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() && user) {
        performSearch(searchTerm);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, user]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (term: string) => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const searchResults = await getSearchSuggestions(user.uid, term, 8);
      setResults(searchResults);
      setShowDropdown(searchResults.length > 0);
    } catch (err: any) {
      setError('Search failed. Please try again.');
      setResults([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowDropdown(false);
    setSearchTerm('');
    
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      // Default navigation behavior
      if (result.type === 'container') {
        navigate(`/container/${result.id}`);
      } else {
        navigate(`/item/${result.id}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      searchRef.current?.blur();
    }
  };

  const getResultIcon = (result: SearchResult) => {
    if (result.type === 'container') {
      return result.isShared ? '🤝' : '📦';
    } else {
      return '📋';
    }
  };

  const getResultBadge = (result: SearchResult) => {
    if (result.isShared && result.sharedByName) {
      return (
        <Badge bg="info" className="ms-2 small">
          Shared by {result.sharedByName}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className={`position-relative ${className}`}>
      <Form.Control
        ref={searchRef}
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (results.length > 0) {
            setShowDropdown(true);
          }
        }}
        className="bg-body border"
        style={{ paddingRight: isLoading ? '2.5rem' : undefined }}
      />
      
      {isLoading && (
        <div className="position-absolute end-0 top-50 translate-middle-y me-3">
          <Spinner animation="border" size="sm" />
        </div>
      )}

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="position-absolute w-100 mt-1 bg-body border rounded shadow-lg"
          style={{ 
            zIndex: 1055, // Higher than navbar collapse (1050)
            maxHeight: '400px', 
            overflowY: 'auto',
            overflowX: 'hidden', // Prevent horizontal scrolling
            // Ensure dropdown is properly positioned on mobile
            left: 0,
            right: 0
          }}
        >
          {error ? (
            <div className="p-3 text-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="px-3 py-2 cursor-pointer border-bottom search-result-item"
                  onClick={() => handleResultClick(result)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bs-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
                    <span className="me-2 flex-shrink-0">{getResultIcon(result)}</span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="fw-medium text-body">
                        {result.name}
                        {getResultBadge(result)}
                      </div>
                      {result.description && (
                        <div className="small text-muted text-truncate">
                          {result.description}
                        </div>
                      )}
                      {result.type === 'item' && result.containerName && (
                        <div className="small text-muted">
                          <i className="bi bi-box me-1"></i>
                          in {result.containerName}
                        </div>
                      )}
                      {result.type === 'container' && result.location && (
                        <div className="small text-muted">
                          <i className="bi bi-geo-alt me-1"></i>
                          {result.location}
                        </div>
                      )}
                    </div>
                    <div className="text-muted ms-2 flex-shrink-0" style={{ fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>
                      {result.type === 'container' ? '📦' : '📋'}
                    </div>
                  </div>
                </div>
              ))}
              
              {results.length >= 8 && (
                <div className="px-3 py-2 text-center text-muted small border-top">
                  <Link 
                    to={`/search?q=${encodeURIComponent(searchTerm)}`}
                    className="text-decoration-none"
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchTerm('');
                    }}
                  >
                    <i className="bi bi-search me-1"></i>
                    View all results for "{searchTerm}"
                  </Link>
                </div>
              )}
            </div>
          ) : searchTerm.trim() && !isLoading ? (
            <div className="p-3 text-muted text-center">
              <i className="bi bi-search me-2"></i>
              No results found for "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;