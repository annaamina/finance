import { useId, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransactionStore } from '../store/useTransactionStore'
import {
  buildBalanceSeries,
  calculateCategoryTotals,
  getSummary,
  formatINR,
} from '../utils/transactionHelpers'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AddTransactionModal } from '../components/AddTransactionModal'
import '../App.css'

function IconWallet() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 8a3 3 0 0 1 3-3h12a2 2 0 0 1 2 2v1H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14V9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 12h.01M6 7V5a2 2 0 0 1 2-2h10v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconArrowUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 19V5M12 5l-6 6M12 5l6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconArrowDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M12 19l6-6M12 19l-6-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 5 6v6c0 5.55 3.84 10.74 7 12 3.16-1.26 7-6.45 7-12V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3a8.5 8.5 0 1 0 11.5 11.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconList() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconSparkles() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9.5 2 11 7l5 1.5L11 10 9.5 15 8 10 3 8.5 8 7 9.5 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 12.5 19.5 15l2.5.8-2.5.7-1 2.5-.8-2.5-2.5-1 2.5-.8 1-2.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BalanceTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { balance } = payload[0].payload
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip__label">Balance</span>
      <span className="chart-tooltip__value">{formatINR(balance)}</span>
    </div>
  )
}

export default function Dashboard({ theme, onThemeChange }) {
  const navigate = useNavigate()
  const role = useTransactionStore((state) => state.role)
  const setRole = useTransactionStore((state) => state.setRole)
  const transactions = useTransactionStore((state) => state.transactions)
  const [addTransactionOpen, setAddTransactionOpen] = useState(false)
 
  const balanceGradientId = `balanceFill-${useId().replace(/:/g, '')}`
  const balanceSeries = useMemo(() => buildBalanceSeries(transactions), [transactions])
  const spending = useMemo(() => calculateCategoryTotals(transactions), [transactions])
  const summary = useMemo(() => getSummary(transactions), [transactions])
  
  return (
    <>
      <div className="dashboard">
        <header className={`dash-header ${role === 'admin' ? 'dash-header--admin' : ''}`}>
          <div className="dash-header__titles">
            <h1 className="dash-header__title">Overview</h1>
            <p className="dash-header__subtitle">Your financial health at a glance.</p>
            <button
              type="button"
              className="btn-view-transactions"
              onClick={() => navigate('/transactions')}
            >
              View Transactions
            </button>
          </div>
          <div className="dash-header__toggles">
            <div className="pill-toggle" role="group" aria-label="Role">
              <button
                type="button"
                className={`pill-toggle__btn ${role === 'viewer' ? 'pill-toggle__btn--active' : ''}`}
                onClick={() => setRole('viewer')}
              >
                <IconEye />
                <span>Viewer</span>
              </button>
              <button
                type="button"
                className={`pill-toggle__btn ${role === 'admin' ? 'pill-toggle__btn--active pill-toggle__btn--admin-role' : ''}`}
                onClick={() => setRole('admin')}
              >
                <IconShield />
                <span>Admin</span>
              </button>
            </div>
            <div className="pill-toggle" role="group" aria-label="Theme">
              <button
                type="button"
                className={`pill-toggle__btn ${theme === 'light' ? 'pill-toggle__btn--active' : ''}`}
                onClick={() => onThemeChange('light')}
              >
                <IconSun />
                <span>Light</span>
              </button>
              <button
                type="button"
                className={`pill-toggle__btn ${theme === 'dark' ? 'pill-toggle__btn--active' : ''}`}
                onClick={() => onThemeChange('dark')}
              >
                <IconMoon />
                <span>Dark</span>
              </button>
            </div>
            {role === 'admin' && (
              <button
                type="button"
                className="btn-add"
                aria-label="Add transaction or category"
                aria-haspopup="dialog"
                onClick={() => setAddTransactionOpen(true)}
              >
                <IconPlus />
                <span>Add</span>
              </button>
            )}
          </div>
        </header>

        {role === 'admin' && (
          <div className="admin-banner" role="status">
            <span className="admin-banner__icon" aria-hidden>
              <IconShield />
            </span>
            <p className="admin-banner__text">
              Admin mode — you can add and manage transactions and categories.
            </p>
          </div>
        )}

        <section className="metrics-row" aria-label="Key metrics">
          <article className="metric-card">
            <div className="metric-card__top">
              <span className="metric-card__label">Total Balance</span>
              <div className="metric-card__icon metric-card__icon--wallet">
                <IconWallet />
              </div>
            </div>
            <p className="metric-card__value">{formatINR(summary.balance)}</p>
          </article>
          <article className="metric-card">
            <div className="metric-card__top">
              <span className="metric-card__label">Monthly Income</span>
              <div className="metric-card__icon metric-card__icon--income">
                <IconArrowUp />
              </div>
            </div>
            <p className="metric-card__value">{formatINR(summary.totalIncome)}</p>
          </article>
          <article className="metric-card">
            <div className="metric-card__top">
              <span className="metric-card__label">Monthly Expenses</span>
              <div className="metric-card__icon metric-card__icon--expense">
                <IconArrowDown />
              </div>
            </div>
            <p className="metric-card__value">{formatINR(summary.totalExpenses)}</p>
          </article>
        </section>

        <section className="charts-row" aria-label="Charts">
          <article className="chart-card chart-card--trend">
            <div className="chart-card__head">
              <h2 className="chart-card__title">Balance Trend</h2>
              <p className="chart-card__sub">Last 30 days</p>
            </div>
            <div className="chart-card__plot chart-card__plot--trend">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={balanceSeries}
                  margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id={balanceGradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00cf8b" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#00cf8b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="0"
                    stroke="rgba(136, 153, 150, 0.14)"
                    horizontal
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'rgb(136,153,150)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    dy={6}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fill: 'rgb(136,153,150)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(n) => `₹${n.toLocaleString('en-IN')}`}
                    width={64}
                  />
                  <Tooltip content={<BalanceTooltip />} cursor={{ stroke: 'rgba(0,207,139,0.35)' }} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#00cf8b"
                    strokeWidth={2}
                    fill={`url(#${balanceGradientId})`}
                    dot={false}
                    activeDot={{ r: 4, fill: '#00cf8b', stroke: '#0b1411', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="chart-card chart-card--donut">
            <div className="chart-card__head">
              <h2 className="chart-card__title">Spending by Category</h2>
            </div>
            <div className="donut-wrap">
              <div className="donut-wrap__chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spending}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="80%"
                      paddingAngle={2}
                      stroke="none"
                    >
                      {spending.map((entry) => (
                        <Cell key={entry.category} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="category-scroll" role="list" aria-label="Category breakdown">
                {spending.map((row) => (
                  <div key={row.category} className="category-row" role="listitem">
                    <span className="category-row__left">
                      <span
                        className="category-row__dot"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="category-row__name">{row.category}</span>
                    </span>
                    <span className="category-row__pct">{row.pct}%</span>
                    <span className="category-row__amt">
                      {formatINR(row.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="footer-row" aria-label="Quick links">
          <button
            type="button"
            className="link-card"
            onClick={() => navigate('/transactions')}
          >
            <span className="link-card__icon link-card__icon--list">
              <IconList />
            </span>
            <span className="link-card__text">
              <span className="link-card__title">Transaction Details</span>
              <span className="link-card__desc">View, filter and search all transactions.</span>
            </span>
            <span className="link-card__chev" aria-hidden>
              <IconChevron />
            </span>
          </button>
          <button type="button" className="link-card">
            <span className="link-card__icon link-card__icon--insights">
              <IconSparkles />
            </span>
            <span className="link-card__text">
              <span className="link-card__title">Insights</span>
              <span className="link-card__desc">Spending patterns and trends</span>
            </span>
            <span className="link-card__chev" aria-hidden>
              <IconChevron />
            </span>
          </button>
        </section>
      </div>

      <AddTransactionModal
        isOpen={addTransactionOpen}
        onClose={() => setAddTransactionOpen(false)}
      />
    </>
  )
}
