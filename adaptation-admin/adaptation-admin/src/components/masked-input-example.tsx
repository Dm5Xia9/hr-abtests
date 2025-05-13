import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneInput, EmailInput } from "@/components/ui/masked-input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function MaskedInputExample() {
  const { toast } = useToast()
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [phoneError, setPhoneError] = useState<string | undefined>()
  const [emailError, setEmailError] = useState<string | undefined>()

  const validatePhone = (phone: string) => {
    // Удаляем все не-цифры и проверяем длину
    const digits = phone.replace(/\D/g, "")
    if (digits.length !== 11) {
      return "Номер телефона должен содержать 11 цифр"
    }
    return undefined
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация телефона
    const phoneValidationError = validatePhone(phone)
    setPhoneError(phoneValidationError)
    
    // Если ошибок нет, отправляем форму
    if (!phoneValidationError && !emailError) {
      toast({
        title: "Форма отправлена",
        description: `Телефон: ${phone}, Email: ${email}`,
      })
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Контактные данные</CardTitle>
        <CardDescription>Введите ваш телефон и email</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PhoneInput
            label="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            description="В формате +7 (900) 123-45-67"
            error={phoneError}
            required
          />
          
          <EmailInput
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            description="Ваш рабочий или личный email"
            error={emailError}
            setError={setEmailError}
            required
          />
          
          <Button type="submit" className="w-full">
            Отправить
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 