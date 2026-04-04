/**
 * Pure validation helpers for the add-transaction form.
 * Return an empty string when valid, otherwise a user-facing message.
 */

export function validateName(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return 'Name is required'
  if (trimmed.length < 3) return 'Name must be at least 3 characters'
  return ''
}

export function validateAmount(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return 'Amount is required'
  const n = Number.parseFloat(raw)
  if (Number.isNaN(n)) return 'Enter a valid amount'
  if (n <= 0) return 'Amount must be greater than 0'
  return ''
}

export function validateDate(value) {
  if (!value || !String(value).trim()) return 'Date is required'
  return ''
}

export function validateCategory(value) {
  if (!value) return 'Please select a category'
  return ''
}

export function validateAccount(value) {
  if (!value) return 'Please select an account'
  return ''
}

export function parseAmount(value) {
  const n = Number.parseFloat(String(value ?? '').trim())
  return Number.isNaN(n) ? null : n
}

export function isFormValid(values) {
  return (
    !validateName(values.name) &&
    !validateAmount(values.amount) &&
    !validateDate(values.date) &&
    !validateCategory(values.category) &&
    !validateAccount(values.account)
  )
}
