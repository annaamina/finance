import './formFields.css'

export function SelectField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  options,
  placeholderLabel = 'Select…',
}) {
  return (
    <div className={`form-field ${error ? 'form-field--invalid' : ''}`}>
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="form-field__control">
        <select
          id={id}
          className="form-field__select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur?.(e)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <option value="">{placeholderLabel}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p className="form-field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
