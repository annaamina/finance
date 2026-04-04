import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTransactionStore } from '../store/useTransactionStore'
import './Transactions.css'

function formatDisplayDate(isoDate) {
  if (!isoDate) return '—'
  const [y, m, d] = isoDate.split('-')
  if (!y || !m || !d) return isoDate
  return `${d}/${m}/${y}`
}

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

function DeleteConfirmModal({ isOpen, onConfirm, onCancel, transactionName }) {
  if (!isOpen) return null
  return (
    <div className="delete-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="delete-modal">
        <div className="delete-modal__icon">
          <IconTrash />
        </div>
        <h2 className="delete-modal__title">Delete Transaction?</h2>
        <p className="delete-modal__desc">
          Are you sure you want to delete <strong>"{transactionName}"</strong>? This action cannot be undone.
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

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Transactions() {
  const transactions = useTransactionStore((state) => state.transactions)
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction)
  const role = useTransactionStore((state) => state.role)
  const [hoveredId, setHoveredId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, name }

  return (
    <div className="dashboard transactions-page">
      <header className="transactions-page__header">
        <div>
          <h1 className="dash-header__title">Transactions</h1>
          <p className="dash-header__subtitle">All entries added from your dashboard.</p>
        </div>
        <Link to="/" className="transactions-page__back">
          ← Back to Dashboard
        </Link>
      </header>

      {transactions.length === 0 ? (
        <div className="transactions-page__empty">
          <p>No transactions yet.</p>
          <p className="transactions-page__empty-hint">
            Add one from the dashboard (Admin → Add) or return home.
          </p>
          <Link to="/" className="transactions-page__empty-link">
            Go to Dashboard
          </Link>
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
                  <td>{row.category}</td>
                  <td>{row.account}</td>
                  <td className="transactions-table__amount">
                    ₹{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  {role === 'admin' && (
                    <td className="transactions-table__actions">
                      {hoveredId === row.id && (
                        <>
                          <button
                            className="tx-action-btn tx-action-btn--edit"
                            title="Edit"
                            onClick={() => {/* wire edit later */}}
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="tx-action-btn tx-action-btn--delete"
                            title="Delete"
                            onClick={() => deleteTransaction(row.id)}
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
    </div>
  )
}