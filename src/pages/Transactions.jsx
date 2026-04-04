import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDisplayDate, formatINR } from '../utils/transactionHelpers'
import { useTransactionStore } from '../store/useTransactionStore'
import { AddTransactionModal } from '../components/AddTransactionModal'
import './Transactions.css'

// ── Icons ────────────────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function IconFilter() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 6h18M7 12h10M11 18h2"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({ isOpen, onConfirm, onCancel, transactionName }) {
  if (!isOpen) return null
  return (
    <div
      className="delete-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="delete-modal">
        <div className="delete-modal__icon"><IconTrash /></div>
        <h2 className="delete-modal__title">Delete Transaction?</h2>
        <p className="delete-modal__desc">
          Are you sure you want to delete <strong>"{transactionName}"</strong>?
          This action cannot be undone.
        </p>
        <div className="delete-modal__actions">
          <button className="delete-modal__btn delete-modal__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="delete-modal__btn delete-modal__btn--confirm" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Category dot colors (matches pie chart) ───────────────────────────────────

const CATEGORY_COLORS = {
  'Housing':        '#4c51bf',
  'Food & Dining':  '#ed8936',
  'Transportation': '#38b2ac',
  'Utilities':      '#667eea',
  'Entertainment':  '#9f7aea',
  'Healthcare':     '#48bb78',
  'Shopping':       '#ed64a1',
  'Income':         '#00cf8b',
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Transactions() {
  const allTransactions = useTransactionStore((state) => state.transactions)
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction)
  const role = useTransactionStore((state) => state.role)

  const [hoveredId, setHoveredId]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [searchQuery, setSearchQuery]  = useState('')
  const [typeFilter, setTypeFilter]    = useState('all')       // 'all' | 'income' | 'expense'
  const [categoryFilter, setCategoryFilter] = useState('all') // 'all' | category string
  const [filterOpen, setFilterOpen]    = useState(false)
  const [searchOpen, setSearchOpen]    = useState(false)
  const [addOpen, setAddOpen]           = useState(false)  
  const searchInputRef = useRef(null)

  // Derive unique categories dynamically from data
  const categories = useMemo(() => {
    const set = new Set(allTransactions.map((t) => t.category))
    return Array.from(set).sort()
  }, [allTransactions])

  // Sort latest first
  const sorted = useMemo(
    () => [...allTransactions].sort((a, b) => b.date.localeCompare(a.date)),
    [allTransactions]
  )

  // Apply search + filters
  const transactions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return sorted.filter((t) => {
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.account.toLowerCase().includes(q)

      const matchesType =
        typeFilter === 'all' || t.type === typeFilter

      const matchesCategory =
        categoryFilter === 'all' || t.category === categoryFilter

      return matchesSearch && matchesType && matchesCategory
    })
  }, [sorted, searchQuery, typeFilter, categoryFilter])

  const hasActiveFilters =
    typeFilter !== 'all' || categoryFilter !== 'all' || searchQuery !== ''

  function clearAll() {
    setSearchQuery('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setFilterOpen(false)
    setSearchOpen(false)
  }

  function toggleSearch() {
    setSearchOpen((v) => {
      if (!v) setTimeout(() => searchInputRef.current?.focus(), 50)
      return !v
    })
  }

  return (
    <div className="dashboard transactions-page">

      {/* ── Header ── */}
      <header className="transactions-page__header">
        <div className="transactions-page__header-left">
          <Link to="/" className="transactions-page__back-icon" aria-label="Back">
            ←
          </Link>
          <h1 className="dash-header__title">Transactions</h1>
        </div>

        <div className="transactions-page__toolbar">
          {/* Search */}
          <button
            className={`toolbar-btn ${searchOpen ? 'toolbar-btn--active' : ''}`}
            onClick={toggleSearch}
          >
            <IconSearch />
            <span>Search</span>
          </button>

          {/* Filter */}
          <div className="filter-wrap">
            <button
              className={`toolbar-btn ${filterOpen ? 'toolbar-btn--active' : ''} ${typeFilter !== 'all' || categoryFilter !== 'all' ? 'toolbar-btn--dot' : ''}`}
              onClick={() => setFilterOpen((v) => !v)}
            >
              <IconFilter />
              <span>Filter</span>
              <IconChevronDown />
            </button>

            {filterOpen && (
              <div className="filter-dropdown">
                <p className="filter-dropdown__heading">FILTERS</p>

                {/* Type filter */}
                <div className="filter-section">
                  <p className="filter-section__label">Type</p>
                  <div className="filter-type-btns">
                    {['all', 'income', 'expense'].map((t) => (
                      <button
                        key={t}
                        className={`filter-type-btn ${typeFilter === t ? 'filter-type-btn--active' : ''}`}
                        onClick={() => setTypeFilter(t)}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category filter */}
                <div className="filter-section">
                  <p className="filter-section__label">Category</p>
                  <div className="filter-category-list">
                    <button
                      className={`filter-category-item ${categoryFilter === 'all' ? 'filter-category-item--active' : ''}`}
                      onClick={() => setCategoryFilter('all')}
                    >
                      All categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        className={`filter-category-item ${categoryFilter === cat ? 'filter-category-item--active' : ''}`}
                        onClick={() => setCategoryFilter(cat)}
                      >
                        <span
                          className="filter-category-dot"
                          style={{ backgroundColor: CATEGORY_COLORS[cat] || '#718096' }}
                        />
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add button — admin only */}
          {role === 'admin' && (
            <button className="toolbar-btn toolbar-btn--add" onClick={() => setAddOpen(true)}>
              <IconPlus />
              <span>Add</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Search Bar ── */}
      {searchOpen && (
        <div className="search-bar-wrap">
          <IconSearch />
          <input
            ref={searchInputRef}
            className="search-bar-input"
            type="text"
            placeholder="Search by name, category, account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-bar-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
      )}

      {/* ── Count + Clear ── */}
      <div className="transactions-page__meta">
        <span className="transactions-page__count">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </span>
        {hasActiveFilters && (
          <button className="transactions-page__clear" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      {/* ── Table ── */}
      {transactions.length === 0 ? (
        <div className="transactions-page__empty">
          <p>No matching transactions found.</p>
          <button className="transactions-page__empty-link" onClick={clearAll}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="transactions-table-wrap">
          <table className="transactions-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Type</th>
                <th scope="col">Name</th>
                <th scope="col">Category</th>
                <th scope="col">Account</th>
                <th scope="col" className="transactions-table__amount">Amount</th>
                {role === 'admin' && <th scope="col"></th>}
              </tr>
            </thead>
            <tbody>
              {transactions.map((row) => (
                <tr
                  key={row.id}
                  className="transactions-table__row"
                  onMouseEnter={() => setHoveredId(row.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <td>{formatDisplayDate(row.date)}</td>
                  <td>
                    <span className={`transactions-table__type transactions-table__type--${row.type}`}>
                      {row.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td>{row.name}</td>
                  <td>
                    <span className="tx-category">
                      <span
                        className="tx-category__dot"
                        style={{ backgroundColor: CATEGORY_COLORS[row.category] || '#718096' }}
                      />
                      {row.category}
                    </span>
                  </td>
                  <td>{row.account}</td>
                  <td className="transactions-table__amount">
                    {formatINR(row.amount)}
                  </td>
                  {role === 'admin' && (
                    <td className="transactions-table__actions">
                      {hoveredId === row.id && (
                        <>
                          <button className="tx-action-btn tx-action-btn--edit" title="Edit">
                            <IconEdit />
                          </button>
                          <button
                            className="tx-action-btn tx-action-btn--delete"
                            title="Delete"
                            onClick={() => setDeleteTarget({ id: row.id, name: row.name })}
                          >
                            <IconTrash />
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddTransactionModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        transactionName={deleteTarget?.name}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteTransaction(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}