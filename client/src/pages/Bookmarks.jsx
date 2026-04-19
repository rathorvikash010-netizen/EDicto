import { useApp } from '../context/AppContext';
import { FiBookmark, FiInbox } from 'react-icons/fi';
import UnifiedWordCard from '../components/word/UnifiedWordCard';

export default function Bookmarks() {
  const { bookmarkedWords } = useApp();

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <FiBookmark style={{ marginRight: '8px', verticalAlign: '-2px' }} />
            Saved Words
          </h2>
          <p className="section-subtitle">{bookmarkedWords.length} word{bookmarkedWords.length !== 1 ? 's' : ''} bookmarked</p>
        </div>
      </div>

      {bookmarkedWords.length > 0 ? (
        <div className="word-grid">
          {bookmarkedWords.map((word, index) => (
            <UnifiedWordCard
              key={word._id || word.word}
              word={word}
              variant="bookmark"
              className={`stagger-${Math.min(index + 1, 6)}`}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><FiInbox size={48} /></div>
          <h3 className="empty-state-title">No saved words yet</h3>
          <p className="empty-state-desc">
            Tap the bookmark icon on any word card to save it here for easy access.
          </p>
        </div>
      )}
    </div>
  );
}
