import './formFields.css'

export function InputField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  placeholder,
  leftAdornment,
  rightAdornment,
  autoComplete,
  inputMode,
  className = '',
  inputRef,
}) {
  const controlClass = [
    'form-field__control',
    'form-field__control--input',
    leftAdornment || rightAdornment ? 'form-field__control--has-adorn' : '',
    leftAdornment ? 'form-field__control--with-left' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`form-field ${error ? 'form-field--invalid' : ''} ${className}`.trim()}>
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
      <div className={controlClass}>
        {leftAdornment ? (
          <span className="form-field__adorn form-field__adorn--left">{leftAdornment}</span>
        ) : null}
        <input
          ref={inputRef}
          id={id}
          className="form-field__input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur?.(e)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {rightAdornment ? (
          <span className="form-field__adorn form-field__adorn--right">{rightAdornment}</span>
        ) : null}
      </div>
      {error ? (
        <p className="form-field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
