import * as React from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerProps {
  value?: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  minDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [viewDate, setViewDate] = React.useState(value || new Date())

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get day of week for first day (0 = Sunday)
  const startDayOfWeek = monthStart.getDay()
  const paddingDays = Array(startDayOfWeek).fill(null)

  const handleSelect = (day: Date) => {
    onChange(day)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, startOfDay(minDate))) {
      return true
    }
    return false
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : placeholder}
          {value && (
            <X
              className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewDate(subMonths(viewDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(viewDate, 'MMMM yyyy')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewDate(addMonths(viewDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div
                key={day}
                className="h-8 w-8 text-center text-xs font-medium text-muted-foreground flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map((_, i) => (
              <div key={`padding-${i}`} className="h-8 w-8" />
            ))}
            {days.map((day) => {
              const isSelected = value && isSameDay(day, value)
              const isCurrentMonth = isSameMonth(day, viewDate)
              const isDayToday = isToday(day)
              const isDisabled = isDateDisabled(day)

              return (
                <Button
                  key={day.toISOString()}
                  variant="ghost"
                  size="icon"
                  disabled={isDisabled}
                  className={cn(
                    'h-8 w-8 p-0 font-normal',
                    !isCurrentMonth && 'text-muted-foreground opacity-50',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                    isDayToday && !isSelected && 'bg-accent text-accent-foreground',
                    isDisabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => handleSelect(day)}
                >
                  {format(day, 'd')}
                </Button>
              )
            })}
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleSelect(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                handleSelect(tomorrow)
              }}
            >
              Tomorrow
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                const nextWeek = new Date()
                nextWeek.setDate(nextWeek.getDate() + 7)
                handleSelect(nextWeek)
              }}
            >
              Next Week
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
