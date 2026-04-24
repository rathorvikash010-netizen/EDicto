import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { FiClock, FiFolder, FiInbox, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import UnifiedWordCard from '../components/word/UnifiedWordCard';

const WORDS_PER_PAGE = 12;

export default function Categories() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.dailyWords.getAll();
        setWords(res.data || []);
      } catch (err) {
        console.error('Failed to load words:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getDaysRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const totalPages = Math.ceil(words.length / WORDS_PER_PAGE);
  const startIdx = (currentPage - 1) * WORDS_PER_PAGE;
  const endIdx = Math.min(startIdx + WORDS_PER_PAGE, words.length);
  const paginatedWords = words.slice(startIdx, endIdx);

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = Math.min(maxVisible, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 1);
        end = totalPages - 1;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <FiFolder style={{ marginRight: '8px', verticalAlign: '-2px' }} />
            Browse All Words
          </h2>
          <p className="section-subtitle">
            {words.length} shared words · Auto-deleted after 10 days
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="animate-fade-in" style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: 'var(--space-xl)', padding: '12px 20px',
        background: 'var(--accent-info-bg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(74, 144, 217, 0.15)',
        fontSize: '0.85rem', color: 'var(--text-secondary)',
      }}>
        <FiClock style={{ color: 'var(--accent-info)', fontSize: '1.1rem', flexShrink: 0 }} />
        <span>
          These words are shared with all users and expire automatically after 10 days.
          <strong> Save words you want to keep</strong> by bookmarking them.
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading all words...
        </div>
      ) : words.length > 0 ? (
        <>
          {/* Showing range */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 'var(--space-md)',
            fontSize: '0.85rem', color: 'var(--text-muted)',
          }}>
            <span>Showing {startIdx + 1}–{endIdx} of {words.length} words</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          <div className="word-grid">
            {paginatedWords.map((word, index) => (
              <UnifiedWordCard
                key={word._id || index}
                word={word}
                variant="category"
                daysLeft={getDaysRemaining(word.expiresAt)}
                className={`stagger-${Math.min((index % 6) + 1, 6)}`}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="explore-pagination">
              <button className="btn btn-ghost" onClick={handlePrev} disabled={currentPage <= 1}>
                <FiChevronLeft /> Previous
              </button>

              <div className="browse-page-numbers">
                {getPageNumbers().map((page, idx) =>
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="browse-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={page}
                      className={`browse-page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button className="btn btn-primary" onClick={handleNext} disabled={currentPage >= totalPages}>
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><FiInbox size={48} /></div>
          <h3 className="empty-state-title">No shared words available</h3>
          <p className="empty-state-desc">
            New words are fetched daily from the dictionary. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
