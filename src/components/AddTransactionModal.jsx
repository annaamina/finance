import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  isFormValid,
  parseAmount,
  validateAccount,
  validateAmount,
  validateCategory,
  validateDate,
  validateName,
} from '../lib/transactionFormValidation'
import { useTransactionStore } from '../store/useTransactionStore'
import { InputField } from './InputField'
import { SelectField } from './SelectField'
import './AddTransactionModal.css'

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const CATEGORY_OPTIONS = [
  { value: 'Housing',        label: 'Housing' },
  { value: 'Food & Dining',  label: 'Food & Dining' },
  { value: 'Shopping',       label: 'Shopping' },
  { value: 'Entertainment',  label: 'Entertainment' },
  { value: 'Utilities',      label: 'Utilities' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Healthcare',     label: 'Healthcare' },
  { value: 'Income',         label: 'Income' },
]

const ACCOUNT_OPTIONS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank', label: 'Bank' },
]

function todayISODate() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconArrowUpSmall() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 19V5M12 5l-5 5M12 5l5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconArrowDownSmall() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M12 19l5-5M12 19l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function getFocusableElements(container) {
  if (!container) return []
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
}

export function AddTransactionModal({ isOpen, onClose,editTransaction=null }) {
  const addTransaction = useTransactionStore((state) => state.addTransaction)
  const updateTransaction = useTransactionStore((state) => state.updateTransaction)
  const isEditMode = !!editTransaction
  const baseId = useId()
  const titleId = `${baseId}-title`
  const panelRef = useRef(null)
  const nameInputRef = useRef(null)
  const dateInputRef = useRef(null)
  const returnFocusRef = useRef(null)

  const [shouldRender, setShouldRender] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  const [transactionType, setTransactionType] = useState('income')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISODate)
  const [category, setCategory] = useState('')
  const [account, setAccount] = useState('')

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({
    name: false,
    amount: false,
    date: false,
    category: false,
    account: false,
  })

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true))
      })
      return () => cancelAnimationFrame(id)
    }
    setAnimateIn(false)
    const hideTimer = window.setTimeout(() => setShouldRender(false), 240)
    return () => clearTimeout(hideTimer)
  }, [isOpen])

  useEffect(() => {
    if (!shouldRender) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [shouldRender])

  useEffect(() => {
  if (isOpen) {
    returnFocusRef.current = document.activeElement
    if (isEditMode) {
      setTransactionType(editTransaction.type)
      setName(editTransaction.name)
      setAmount(String(editTransaction.amount))
      setDate(editTransaction.date)
      setCategory(editTransaction.category)
      setAccount(editTransaction.account)
    } else {
      setTransactionType('income')
      setName('')
      setAmount('')
      setDate(todayISODate())
      setCategory('')
      setAccount('')
    }
    setErrors({})
    setTouched({ name: false, amount: false, date: false, category: false, account: false })
  } else if (returnFocusRef.current) {
    returnFocusRef.current.focus?.()
    returnFocusRef.current = null
  }
}, [isOpen])

  useEffect(() => {
    if (!shouldRender || !animateIn) return
    const id = window.requestAnimationFrame(() => {
      nameInputRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [shouldRender, animateIn])

  const formValid = useMemo(
    () =>
      isFormValid({
        name,
        amount,
        date,
        category,
        account,
      }),
    [name, amount, date, category, account],
  )

  function handleOverlayMouseDown(e) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  function handleModalKeyDown(e) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const panel = panelRef.current
    if (!panel) return
    const list = getFocusableElements(panel)
    if (list.length === 0) return
    const first = list[0]
    const last = list[list.length - 1]
    const active = document.activeElement
    if (e.shiftKey) {
      if (active === first || !panel.contains(active)) {
        e.preventDefault()
        last.focus()
      }
    } else if (active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  function handleNameChange(value) {
    setName(value)
    setErrors((prev) => {
      if (!touched.name && !prev.name) return prev
      return { ...prev, name: validateName(value) }
    })
  }

  function handleNameBlur(e) {
    const value = e.target.value
    setTouched((t) => ({ ...t, name: true }))
    setErrors((prev) => ({ ...prev, name: validateName(value) }))
  }

  function handleAmountChange(value) {
    setAmount(value)
    setErrors((prev) => {
      if (!touched.amount && !prev.amount) return prev
      return { ...prev, amount: validateAmount(value) }
    })
  }

  function handleAmountBlur(e) {
    const value = e.target.value
    setTouched((t) => ({ ...t, amount: true }))
    setErrors((prev) => ({ ...prev, amount: validateAmount(value) }))
  }

  function handleDateChange(value) {
  const today = todayISODate()
  const clamped = value > today ? today : value
  setDate(clamped)
  setErrors((prev) => {
    if (!touched.date && !prev.date) return prev
    return { ...prev, date: validateDate(clamped) }
  })
}

  function handleDateBlur(e) {
    const value = e.target.value
    setTouched((t) => ({ ...t, date: true }))
    setErrors((prev) => ({ ...prev, date: validateDate(value) }))
  }

  function handleCategoryChange(value) {
    setCategory(value)
    setErrors((prev) => {
      if (!touched.category && !prev.category) return prev
      return { ...prev, category: validateCategory(value) }
    })
  }

  function handleCategoryBlur(e) {
    const value = e.target.value
    setTouched((t) => ({ ...t, category: true }))
    setErrors((prev) => ({ ...prev, category: validateCategory(value) }))
  }

  function handleAccountChange(value) {
    setAccount(value)
    setErrors((prev) => {
      if (!touched.account && !prev.account) return prev
      return { ...prev, account: validateAccount(value) }
    })
  }

  function handleAccountBlur(e) {
    const value = e.target.value
    setTouched((t) => ({ ...t, account: true }))
    setErrors((prev) => ({ ...prev, account: validateAccount(value) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setTouched({
      name: true,
      amount: true,
      date: true,
      category: true,
      account: true,
    })
    const nextErrors = {
      name: validateName(name),
      amount: validateAmount(amount),
      date: validateDate(date),
      category: validateCategory(category),
      account: validateAccount(account),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    const parsedAmount = parseAmount(amount)
    if (parsedAmount == null) return

    const payload = {
      type: transactionType,
      name: name.trim(),
      amount: parsedAmount,
      date,
      category,
      account,
    }

    if (isEditMode) {
        updateTransaction({ id: editTransaction.id, ...payload })
      } else {
        addTransaction(payload)
      }
      onClose()
        }

  if (!shouldRender) return null

  const modalClass =
    transactionType === 'expense'
      ? 'add-tx-modal add-tx-modal--expense'
      : 'add-tx-modal add-tx-modal--income'

  const submitLabel = transactionType === 'income' ? 'Add Income' : 'Add Expense'

  return createPortal(
    <div
      className={`add-tx-overlay ${animateIn ? 'add-tx-overlay--visible' : ''}`}
      role="presentation"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        ref={panelRef}
        className={modalClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={handleModalKeyDown}
      >
        <header className="add-tx-modal__header">
          <h2 className="add-tx-modal__title" id={titleId}>
            {isEditMode ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button
            type="button"
            className="add-tx-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            <IconClose />
          </button>
        </header>

        <div className="add-tx-modal__scroll">
          <form className="add-tx-modal__body" onSubmit={handleSubmit} noValidate>
            <div className="add-tx-type-toggle" role="group" aria-label="Transaction type">
              <button
                type="button"
                className={`add-tx-type-toggle__btn add-tx-type-toggle__btn--income ${
                  transactionType === 'income' ? 'add-tx-type-toggle__btn--active' : ''
                }`}
                onClick={() => setTransactionType('income')}
                aria-pressed={transactionType === 'income'}
              >
                <IconArrowUpSmall />
                Income
              </button>
              <button
                type="button"
                className={`add-tx-type-toggle__btn add-tx-type-toggle__btn--expense ${
                  transactionType === 'expense' ? 'add-tx-type-toggle__btn--active' : ''
                }`}
                onClick={() => setTransactionType('expense')}
                aria-pressed={transactionType === 'expense'}
              >
                <IconArrowDownSmall />
                Expense
              </button>
            </div>

            <InputField
              id={`${baseId}-name`}
              label="Name"
              value={name}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              error={errors.name}
              placeholder="e.g. Monthly Salary, Grocery run..."
              autoComplete="off"
              inputRef={nameInputRef}
            />

            <InputField
              id={`${baseId}-amount`}
              label="Amount"
              value={amount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              error={errors.amount}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              leftAdornment={<span>₹</span>}
            />

            <InputField
              id={`${baseId}-date`}
              label="Date"
              value={date}
              onChange={handleDateChange}
              onBlur={handleDateBlur}
              error={errors.date}
              type="date"
              max={todayISODate()}
              inputRef={dateInputRef}
              rightAdornment={
  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <IconCalendar />
  </span>
}
              onRightAdornmentClick={() => dateInputRef.current?.showPicker()}
            />

            <SelectField
              id={`${baseId}-category`}
              label="Category"
              value={category}
              onChange={handleCategoryChange}
              onBlur={handleCategoryBlur}
              error={errors.category}
              options={CATEGORY_OPTIONS}
              placeholderLabel="Select category"
            />

            <SelectField
              id={`${baseId}-account`}
              label="Account"
              value={account}
              onChange={handleAccountChange}
              onBlur={handleAccountBlur}
              error={errors.account}
              options={ACCOUNT_OPTIONS}
              placeholderLabel="Select account"
            />

            {isEditMode ? (
              <div className="add-tx-modal__edit-actions">
                <button type="button" className="add-tx-modal__cancel" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`add-tx-modal__submit ${
                    transactionType === 'income'
                      ? 'add-tx-modal__submit--income'
                      : 'add-tx-modal__submit--expense'
                  }`}
                  disabled={!formValid}
                >
                  Save Changes
                </button>
              </div>
              ) : (
                <button
                  type="submit"
                  className={`add-tx-modal__submit ${
                    transactionType === 'income'
                      ? 'add-tx-modal__submit--income'
                      : 'add-tx-modal__submit--expense'
                  }`}
                  disabled={!formValid}
                >
                  {transactionType === 'income' ? 'Add Income' : 'Add Expense'}
                </button>
)}
          </form>
        </div>
      </div>
    </div>,
    document.body,
  )
}
