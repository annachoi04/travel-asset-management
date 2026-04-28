"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ChevronDown, Search } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { countryData } from "@/lib/store"
import { cn } from "@/lib/utils"

interface TravelInfoStepProps {
  tripName: string
  country: string
  city: string
  startDate: string
  endDate: string
  people: number
  onUpdate: (data: {
    tripName: string
    country: string
    city: string
    startDate: string
    endDate: string
    people: number
  }) => void
  onNext: () => void
  onBack?: () => void
}

export function TravelInfoStep({
  tripName,
  country,
  city,
  startDate,
  endDate,
  people,
  onUpdate,
  onNext,
  onBack,
}: TravelInfoStepProps) {
  const [localName, setLocalName] = useState(tripName)
  const [localCountry, setLocalCountry] = useState(country)
  const [localCity, setLocalCity] = useState(city)
  const [localStartDate, setLocalStartDate] = useState<Date | undefined>(
    startDate ? new Date(startDate) : undefined
  )
  const [localEndDate, setLocalEndDate] = useState<Date | undefined>(
    endDate ? new Date(endDate) : undefined
  )
  const [localPeople, setLocalPeople] = useState(people || 1)
  
  const [countrySearch, setCountrySearch] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)

  const countries = Object.keys(countryData)
  const filteredCountries = useMemo(() => {
    return countries.filter((c) => c.toLowerCase().includes(countrySearch.toLowerCase()))
  }, [countrySearch])

  const cities = localCountry ? countryData[localCountry]?.cities || [] : []
  const filteredCities = useMemo(() => {
    return cities.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
  }, [cities, citySearch])

  const handleNext = () => {
    onUpdate({
      tripName: localName,
      country: localCountry,
      city: localCity,
      startDate: localStartDate ? format(localStartDate, "yyyy-MM-dd") : "",
      endDate: localEndDate ? format(localEndDate, "yyyy-MM-dd") : "",
      people: localPeople,
    })
    onNext()
  }

  const isValid =
    localName &&
    localCountry &&
    localCity &&
    localStartDate &&
    localEndDate &&
    localPeople > 0

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 px-5 pt-12 pb-32">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          어디로 떠나고 싶으세요? 🌍
        </h1>
        <p className="text-muted-foreground mb-8">
          당신의 꿈꾸는 여행지를 알려주세요
        </p>

        {/* Trip Name */}
        <section className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            여행 이름
          </label>
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="예: 니스 힐링 여행"
            className="w-full h-14 px-4 rounded-xl bg-input text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </section>

        {/* Country Selection */}
        <section className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            나라
          </label>
          <div className="relative">
            <button
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="w-full h-14 px-4 rounded-xl bg-input text-foreground text-left flex items-center justify-between"
            >
              <span className={localCountry ? "text-foreground" : "text-muted-foreground"}>
                {localCountry ? `${countryData[localCountry]?.flag} ${localCountry}` : "나라를 선택하세요"}
              </span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {showCountryDropdown && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="나라 검색..."
                      className="w-full h-10 pl-10 pr-4 rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredCountries.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setLocalCountry(c)
                        setLocalCity("")
                        setShowCountryDropdown(false)
                        setCountrySearch("")
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3"
                    >
                      <span className="text-xl">{countryData[c].flag}</span>
                      <span className="text-foreground">{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* City Selection */}
        <section className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            도시
          </label>
          <div className="relative">
            <button
              onClick={() => localCountry && setShowCityDropdown(!showCityDropdown)}
              className={cn(
                "w-full h-14 px-4 rounded-xl bg-input text-left flex items-center justify-between",
                !localCountry && "opacity-50 cursor-not-allowed"
              )}
              disabled={!localCountry}
            >
              <span className={localCity ? "text-foreground" : "text-muted-foreground"}>
                {localCity || "도시를 선택하세요"}
              </span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {showCityDropdown && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      placeholder="도시 검색..."
                      className="w-full h-10 pl-10 pr-4 rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredCities.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setLocalCity(c)
                        setShowCityDropdown(false)
                        setCitySearch("")
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-accent transition-colors text-foreground"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Date Selection */}
        <section className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            여행 기간
          </label>
          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex-1 h-14 px-4 rounded-xl bg-input text-left flex items-center justify-between">
                  <span className={localStartDate ? "text-foreground" : "text-muted-foreground"}>
                    {localStartDate ? format(localStartDate, "yyyy.MM.dd", { locale: ko }) : "출발일"}
                  </span>
                  <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={localStartDate}
                  onSelect={(date) => {
                    setLocalStartDate(date)
                    if (date && localEndDate && date > localEndDate) {
                      setLocalEndDate(undefined)
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <span className="flex items-center text-muted-foreground">~</span>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex-1 h-14 px-4 rounded-xl bg-input text-left flex items-center justify-between">
                  <span className={localEndDate ? "text-foreground" : "text-muted-foreground"}>
                    {localEndDate ? format(localEndDate, "yyyy.MM.dd", { locale: ko }) : "귀국일"}
                  </span>
                  <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={localEndDate}
                  onSelect={setLocalEndDate}
                  disabled={(date) => 
                    date < new Date() || 
                    (localStartDate ? date < localStartDate : false)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </section>

        {/* People Selection */}
        <section className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">
            인원
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => setLocalPeople(num)}
                className={cn(
                  "w-12 h-12 rounded-xl font-medium transition-colors",
                  localPeople === num
                    ? "bg-primary text-primary-foreground"
                    : "bg-input text-foreground hover:bg-accent"
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background border-t border-border">
        <div className="flex gap-3">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 h-14 text-lg font-semibold rounded-2xl"
            >
              이전
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="flex-1 h-14 text-lg font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  )
}
