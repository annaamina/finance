import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTransactionStore } from '../store/useTransactionStore'
import { formatINR } from '../utils/transactionHelpers'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import './Insights.css'

// ── Icons ────────────────────────────────────────────────────────────────────

function IconArrowUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 19V5M12 5l-6 6M12 5l6 6"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrowDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M12 19l6-6M12 19l-6-6"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="7" r="1.2" fill="currentColor" />
    </svg>
  )
}

// ── Category colors (same as Dashboard / Transactions) ────────────────────────

const CATEGORY_COLORS = {
  'Housing':        '#4c51bf',
  'Food & Dining':  '#ed8936',
  'Transportation': '#38b2ac',
  'Utilities':      '#667eea',
  'Entertainment':  '#9f7aea',
  'Healthcare':     '#48bb78',
  'Shopping':       '#ed64a1',
  'Savings':        '#00cf8b',
  'Income':         '#00cf8b',
}

// ── Helper functions ──────────────────────────────────────────────────────────

function calculateSummary(transactions) {
  let totalIncome = 0
  let totalSpent = 0

  transactions.forEach((t) => {
    if (t.type === 'income') totalIncome += t.amount
    else totalSpent += t.amount
  })

  return { totalIncome, totalSpent }
}

function calculateCategoryTotals(transactions) {
  const map = {}
  transactions.forEach((t) => {
    if (t.type !== 'expense') return
    map[t.category] = (map[t.category] || 0) + t.amount
  })

  return Object.entries(map)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

function calculateMonthlyData(transactions) {
  const map = {}

  transactions.forEach((t) => {
    const d = new Date(t.date)
    // "Apr 2026" style key for sorting, display label is "Apr"
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('en-IN', { month: 'short' })

    if (!map[key]) map[key] = { key, month: label, income: 0, expense: 0 }
    if (t.type === 'income') map[key].income += t.amount
    else map[key].expense += t.amount
  })

  return Object.values(map).sort((a, b) => a.key.localeCompare(b.key))
}

// ── Custom Tooltips ───────────────────────────────────────────────────────────

function MonthlyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="ins-tooltip">
      <p className="ins-tooltip__label">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="ins-tooltip__row" style={{ color: p.fill }}>
          {p.dataKey === 'income' ? 'Income' : 'Expenses'}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  )
}

function CategoryTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="ins-tooltip">
      <p className="ins-tooltip__label">{payload[0].payload.category}</p>
      <p className="ins-tooltip__row" style={{ color: payload[0].fill }}>
        {formatINR(payload[0].value)}
      </p>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Insights() {
  const transactions = useTransactionStore((state) => state.transactions)

  const summary      = useMemo(() => calculateSummary(transactions), [transactions])
  const categoryData = useMemo(() => calculateCategoryTotals(transactions), [transactions])
  const monthlyData  = useMemo(() => calculateMonthlyData(transactions), [transactions])

  const topCategory = categoryData[0] ?? null

  return (
    <div className="dashboard insights-page">

      {/* ── Header ── */}
      <header className="transactions-page__header">
        <div className="transactions-page__header-left">
          <Link to="/" className="transactions-page__back-icon" aria-label="Back">←</Link>
          <div>
            <h1 className="dash-header__title">Insights</h1>
            <p className="dash-header__subtitle">Monthly overview of your financial data</p>
          </div>
        </div>
      </header>

      {/* ── Summary Cards ── */}
      <section className="metrics-row ins-metrics" aria-label="Summary">

        <article className="metric-card">
          <div className="metric-card__top">
            <span className="metric-card__label">Total Income</span>
            <div className="metric-card__icon metric-card__icon--income">
              <IconArrowUp />
            </div>
          </div>
          <p className="metric-card__value">{formatINR(summary.totalIncome)}</p>
          <p className="ins-card__sub">all time</p>
        </article>

        <article className="metric-card">
          <div className="metric-card__top">
            <span className="metric-card__label">Total Spent</span>
            <div className="metric-card__icon metric-card__icon--expense">
              <IconArrowDown />
            </div>
          </div>
          <p className="metric-card__value">{formatINR(summary.totalSpent)}</p>
          <p className="ins-card__sub">all time</p>
        </article>

        <article className="metric-card">
          <div className="metric-card__top">
            <span className="metric-card__label">Top Category</span>
            <div className="metric-card__icon metric-card__icon--wallet">
              <IconTag />
            </div>
          </div>
          {topCategory ? (
            <>
              <p className="metric-card__value ins-top-cat">{topCategory.category}</p>
              <p className="ins-card__sub">
                {summary.totalSpent > 0
                  ? `${Math.round((topCategory.total / summary.totalSpent) * 100)}% of expenses`
                  : '—'}
              </p>
            </>
          ) : (
            <p className="metric-card__value">—</p>
          )}
        </article>

      </section>

      {/* ── Monthly Comparison Chart ── */}
      <section className="ins-chart-card" aria-label="Monthly Comparison">
        <div className="chart-card__head">
          <div>
            <h2 className="chart-card__title">
              <span className="ins-chart-icon">▐</span> Monthly Comparison
            </h2>
            <p className="chart-card__sub">Income vs expenses — last {monthlyData.length} months</p>
          </div>
        </div>
        <div className="ins-chart-plot">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 8, right: 24, left: 0, bottom: 4 }} barGap={4}>
              <CartesianGrid strokeDasharray="0" stroke="rgba(136,153,150,0.12)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: 'rgb(136,153,150)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fill: 'rgb(136,153,150)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(n) => `₹${(n / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip content={<MonthlyTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: 'rgb(136,153,150)', paddingTop: 12 }}
                formatter={(value) => value === 'income' ? 'Income' : 'Expenses'}
              />
              <Bar dataKey="income"  fill="#00cf8b" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expense" fill="#f56565" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Spending by Category Chart ── */}
      <section className="ins-chart-card" aria-label="Spending by Category">
        <div className="chart-card__head">
          <div>
            <h2 className="chart-card__title">
              <span className="ins-chart-icon">📅</span> Spending by Category
            </h2>
          </div>
        </div>
        <div className="ins-chart-plot">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 8, right: 24, left: 0, bottom: 4 }} barGap={4}>
              <CartesianGrid strokeDasharray="0" stroke="rgba(136,153,150,0.12)" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fill: 'rgb(136,153,150)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fill: 'rgb(136,153,150)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(n) => `₹${(n / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip content={<CategoryTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {categoryData.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={CATEGORY_COLORS[entry.category] || '#718096'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  )
}
