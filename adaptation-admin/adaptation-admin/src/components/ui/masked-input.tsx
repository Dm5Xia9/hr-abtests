import * as React from "react"
import InputMask from "react-input-mask"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: string
  label?: string
  description?: string
  error?: string
  maskPlaceholder?: string
  alwaysShowMask?: boolean
  beforeMaskedStateChange?: (state: any) => any
  containerClassName?: string
  labelClassName?: string
  inputContainerClassName?: string
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ 
    className, 
    label, 
    description,
    error,
    mask, 
    maskPlaceholder = "_",
    alwaysShowMask = false,
    beforeMaskedStateChange,
    containerClassName,
    labelClassName,
    inputContainerClassName,
    ...props 
  }, ref) => {
    return (
      <div className={cn("grid w-full gap-1.5", containerClassName)}>
        {label && (
          <Label htmlFor={props.id} className={labelClassName}>
            {label}
          </Label>
        )}
        <div className={cn("relative", inputContainerClassName)}>
          <InputMask
            mask={mask}
            maskPlaceholder={maskPlaceholder}
            alwaysShowMask={alwaysShowMask}
            beforeMaskedStateChange={beforeMaskedStateChange}
            {...props}
          >
            {(inputProps: any) => (
              <Input 
                ref={ref} 
                className={cn(error && "border-destructive", className)} 
                {...inputProps} 
              />
            )}
          </InputMask>
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }
)
MaskedInput.displayName = "MaskedInput"

export { MaskedInput }

// Предопределенные компоненты для часто используемых масок
export function PhoneInput({
  label = "Телефон",
  description,
  error,
  ...props
}: Omit<MaskedInputProps, "mask"> & {
  label?: string
  description?: string
  error?: string
}) {
  return (
    <MaskedInput
      mask="+7 (999) 999-99-99"
      label={label}
      description={description}
      error={error}
      placeholder="+7 (___) ___-__-__"
      {...props}
    />
  )
}

// Для email не нужна маска, но добавим валидацию
export function EmailInput({
  label = "Email",
  description,
  error,
  setError,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  description?: string
  error?: string
  setError?: React.Dispatch<React.SetStateAction<string | undefined>>
  containerClassName?: string
  labelClassName?: string
  inputContainerClassName?: string
}) {
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const [localError, setLocalError] = React.useState<string | undefined>(error)
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    if (value && !validateEmail(value)) {
      const errorMessage = "Некорректный формат email"
      setLocalError(errorMessage)
      if (setError) {
        setError(errorMessage)
      }
    } else {
      setLocalError(undefined)
      if (setError) {
        setError(undefined)
      }
    }
    
    if (props.onBlur) {
      props.onBlur(e)
    }
  }

  return (
    <div className={cn("grid w-full gap-1.5", props.containerClassName)}>
      {label && (
        <Label htmlFor={props.id} className={props.labelClassName}>
          {label}
        </Label>
      )}
      <div className={cn("relative", props.inputContainerClassName)}>
        <Input
          type="email"
          placeholder="example@domain.com"
          onBlur={handleBlur}
          className={cn(localError && "border-destructive", props.className)}
          {...props}
        />
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {(localError || error) && <p className="text-sm text-destructive">{localError || error}</p>}
    </div>
  )
} 