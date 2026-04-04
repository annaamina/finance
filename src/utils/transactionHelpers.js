// Group transactions by date, returns { "2026-03-01": [...], ... }
export function groupByDate(transactions) {
  return transactions.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = []
    acc[tx.date].push(tx)
    return acc
  }, {})
}

// Returns array of { category, total, color } sorted by total desc
export function calculateCategoryTotals(transactions) {
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

  const expenses = transactions.filter((t) => t.type === 'expense')
  const totals = {}

  expenses.forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + t.amount
  })

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0)

  return Object.entries(totals)
    .map(([category, total]) => ({
      category,
      total,
      pct: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
      color: CATEGORY_COLORS[category] || '#718096',
    }))
    .sort((a, b) => b.total - a.total)
}

// Builds daily running balance series for the chart
// Returns array of { date, balance, label } sorted by date
export function buildBalanceSeries(transactions) {
  const grouped = groupByDate(transactions)
  const sortedDates = Object.keys(grouped).sort()

  let running = 0
  return sortedDates.map((date) => {
    const dayTxs = grouped[date]
    dayTxs.forEach((t) => {
      running += t.type === 'income' ? t.amount : -t.amount
    })
    return {
      date,
      balance: running,
      label: formatShortDate(date), // e.g. "Mar 1"
    }
  })
}

// Format "2026-03-01" → "Mar 1"
export function formatShortDate(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m, 10) - 1]} ${String(parseInt(d, 10)).padStart(2, '0')}`
}

// Format "2026-03-01" → "01/03/2026"
export function formatDisplayDate(isoDate) {
  if (!isoDate) return '—'
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

// Summary totals from transaction list
export function getSummary(transactions) {
  let totalIncome = 0
  let totalExpenses = 0

  transactions.forEach((t) => {
    if (t.type === 'income') totalIncome += t.amount
    else totalExpenses += t.amount
  })

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  }
}

// Format number as ₹ currency string
export function formatINR(amount) {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })
}