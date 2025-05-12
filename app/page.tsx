"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Settings, HomeIcon, Search, ChevronLeft, ChevronRight, Pencil, Trash2, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MealDialog } from "@/components/meal-dialog"
import { FoodSearch } from "@/components/food-search"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Food } from "@/data/foods"
import { PortionInput } from "@/components/portion-input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Modificar a definição dos grupos de alimentos para indicar quais estão agrupados
const foodGroups = [
  { id: 4, name: "Proteínas", color: "bg-rose-500", group: "protein" },
  { id: 9, name: "Frutas", color: "bg-amber-500", group: "carbs" },
  { id: 12, name: "Pães/Fibras", color: "bg-amber-500", group: "carbs" },
  { id: 5, name: "Cereais/Feijões", color: "bg-emerald-500", group: "grains" },
  { id: 11, name: "Gorduras Boas", color: "bg-sky-500", group: "fats" },
  { id: 13, name: "Laticínios", color: "bg-sky-500", group: "fats" },
]

// Definir os grupos combinados para exibição
const combinedGroups = [
  { name: "Proteínas", ids: [4], color: "bg-rose-500" },
  { name: "Cereais/Feijões", ids: [5], color: "bg-emerald-500" },
  { name: "Frutas & Pães/Fibras", ids: [9, 12], color: "bg-amber-500" },
  { name: "Gorduras Boas & Laticínios", ids: [11, 13], color: "bg-sky-500" },
]

// Definição das refeições padrão
const mealTypes = ["Café da Manhã", "Lanche da Manhã", "Almoço", "Lanche da Tarde", "Jantar", "Ceia"]

// Tipo para as metas diárias
interface DailyGoals {
  [key: number]: number | ""
}

// Tipo para uma refeição
interface Meal {
  id: string
  type: string
  time: string
  customName?: string
  portions: {
    groupId: number
    amount: number
  }[]
}

// Tipo para os dados de um dia
interface DayData {
  date: string
  meals: Meal[]
}

// Estado inicial das metas diárias
const initialGoals: DailyGoals = {
  4: 12, // Proteínas
  9: 6, // Frutas
  12: 6, // Pães/Fibras (compartilha a meta com Frutas)
  5: 10, // Cereais/Feijões
  11: 4, // Gorduras Boas
  13: 4, // Laticínios (compartilha a meta com Gorduras Boas)
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [goals, setGoals] = useState<DailyGoals>(initialGoals)
  const [dayData, setDayData] = useState<DayData[]>([])
  const [currentDayData, setCurrentDayData] = useState<DayData | null>(null)
  const [newMeal, setNewMeal] = useState<{
    type: string
    time: string
    customName?: string
    portions: { groupId: number; amount: number | "" }[]
  }>({
    type: "Café da Manhã",
    time: "08:00",
    customName: "",
    portions: [],
  })
  const [mealDialogOpen, setMealDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [editingMealId, setEditingMealId] = useState<string | null>(null)

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedGoals = localStorage.getItem("dietGoals")
    const savedDayData = localStorage.getItem("dietDayData")

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }

    if (savedDayData) {
      setDayData(JSON.parse(savedDayData))
    }
  }, [])

  // Atualizar localStorage quando os dados mudam
  useEffect(() => {
    localStorage.setItem("dietGoals", JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    localStorage.setItem("dietDayData", JSON.stringify(dayData))
  }, [dayData])

  // Atualizar dados do dia atual quando a data selecionada muda
  useEffect(() => {
    const dateString = format(selectedDate, "yyyy-MM-dd")
    const existingDayData = dayData.find((day) => day.date === dateString)

    if (existingDayData) {
      setCurrentDayData(existingDayData)
    } else {
      setCurrentDayData({
        date: dateString,
        meals: [],
      })
    }
  }, [selectedDate, dayData])

  // Modificar a função getConsumedPortions para aceitar um array de IDs de grupo
  const getConsumedPortions = (groupIds: number[]) => {
    if (!currentDayData) return 0

    return currentDayData.meals.reduce((total, meal) => {
      let mealTotal = 0
      for (const groupId of groupIds) {
        const groupPortion = meal.portions.find((portion) => portion.groupId === groupId)
        if (groupPortion) {
          mealTotal += groupPortion.amount
        }
      }
      return total + mealTotal
    }, 0)
  }

  // Add edit meal function
  const editMeal = (meal: Meal) => {
    setEditingMealId(meal.id)
    setNewMeal({
      type: meal.type,
      time: meal.time,
      customName: meal.customName || "",
      portions: meal.portions.map(p => ({ ...p, amount: p.amount })),
    })
    setMealDialogOpen(true)
  }

  // Update addMeal function to handle editing
  const addMeal = () => {
    if (!currentDayData) return

    // Filtrar apenas porções com valores maiores que zero
    const validPortions = newMeal.portions
      .filter((portion) => portion.amount !== "" && portion.amount > 0)
      .map(portion => ({
        ...portion,
        amount: Number(portion.amount)
      }))

    if (validPortions.length === 0) {
      alert("Adicione pelo menos uma porção de alimento.")
      return
    }

    const meal: Meal = {
      id: editingMealId || Date.now().toString(),
      type: newMeal.type,
      time: newMeal.time,
      customName: newMeal.customName,
      portions: validPortions,
    }

    const updatedDayData = {
      ...currentDayData,
      meals: editingMealId
        ? currentDayData.meals.map(m => m.id === editingMealId ? meal : m)
        : [...currentDayData.meals, meal],
    }

    // Atualizar o array de dias
    const dateString = format(selectedDate, "yyyy-MM-dd")
    const updatedDays = dayData.filter((day) => day.date !== dateString)
    setDayData([...updatedDays, updatedDayData])
    setCurrentDayData(updatedDayData)

    // Resetar o formulário
    setNewMeal({
      type: "Café da Manhã",
      time: "08:00",
      customName: "",
      portions: [],
    })
    setEditingMealId(null)
    setMealDialogOpen(false)
  }

  // Remover uma refeição
  const removeMeal = (mealId: string) => {
    if (!currentDayData) return

    const updatedMeals = currentDayData.meals.filter((meal) => meal.id !== mealId)
    const updatedDayData = {
      ...currentDayData,
      meals: updatedMeals,
    }

    // Atualizar o array de dias
    const dateString = format(selectedDate, "yyyy-MM-dd")
    const updatedDays = dayData.filter((day) => day.date !== dateString)
    setDayData([...updatedDays, updatedDayData])
    setCurrentDayData(updatedDayData)
  }

  // Modificar a função updateGoal para usar parseFloat
  const updateGoal = (groupId: number, value: number | "") => {
    setGoals({
      ...goals,
      [groupId]: value,
    })
  }

  // Modificar a função updatePortion para usar parseFloat em vez de parseInt
  const updatePortion = (groupId: number, amount: number | "") => {
    const existingPortionIndex = newMeal.portions.findIndex((p) => p.groupId === groupId)

    if (existingPortionIndex >= 0) {
      const updatedPortions = [...newMeal.portions]
      updatedPortions[existingPortionIndex] = { groupId, amount }
      setNewMeal({
        ...newMeal,
        portions: updatedPortions,
      })
    } else {
      setNewMeal({
        ...newMeal,
        portions: [...newMeal.portions, { groupId, amount }],
      })
    }
  }

  // Modificar a função getCurrentPortion para aceitar um array de IDs de grupo
  const getCurrentPortion = (groupId: number): number | "" => {
    const portion = newMeal.portions.find((p) => p.groupId === groupId)
    return portion ? portion.amount : ""
  }

  // Função para adicionar alimento da pesquisa à refeição
  const handleAddFoodToMeal = (food: Food) => {
    setSelectedFood(food)

    // Abrir o diálogo de nova refeição
    setNewMeal({
      ...newMeal,
      portions: [
        ...newMeal.portions.filter((p) => p.groupId !== food.groupNumber),
        { groupId: food.groupNumber, amount: 1 },
      ],
    })

    setMealDialogOpen(true)
    setActiveTab("dashboard")
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="container max-w-2xl p-4 mx-auto flex-none">
        <h1 className="text-2xl font-bold text-center mb-2">Reset M30</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full sticky top-0 z-10">
            <TabsTrigger value="dashboard">
              <HomeIcon className="h-4 w-4 mr-2" />
              Hoje
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Alimentos
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <div className="p-4 overflow-y-auto max-h-[calc(100vh-11rem)]">
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4 mt-0">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</h2>
                </div>
                <div className="flex items-center gap-2">
                
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const prevDay = new Date(selectedDate)
                      prevDay.setDate(prevDay.getDate() - 1)
                      setSelectedDate(prevDay)
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Data
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const nextDay = new Date(selectedDate)
                      nextDay.setDate(nextDay.getDate() + 1)
                      setSelectedDate(nextDay)
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Cards */}
              <div className="space-y-4">
                {combinedGroups.map((group) => {
                  const goal = goals[group.ids[0]]
                  const consumed = getConsumedPortions(group.ids)
                  const remaining = goal === "" ? 0 : Number(goal) - consumed
                  const isOverGoal = consumed > Number(goal)
                  const progress = goal === "" ? 0 : Math.min((consumed / Number(goal)) * 100, 100)

                  return (
                    <Card key={group.name}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex  items-center gap-2 w-[90%]">
                            <h3 className="font-medium max-w-[calc(100%-100px)] sm:max-w-[250px] truncate" title={group.name}>{group.name}</h3>
                            {goal !== "" && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                isOverGoal 
                                ? "bg-amber-100 text-amber-800"
                                : remaining > 0
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                              }`}>
                                {isOverGoal 
                                  ? `+${(consumed - Number(goal)).toFixed(1).replace(/\.0$/, "")} extras`
                                  : remaining > 0
                                  ? `Faltam ${remaining.toFixed(1).replace(/\.0$/, "")}`
                                  : "Meta batida ✅"
                                }
                              </span>
                            )}
                          </div>  
                            <span className="text-sm min-w-max">
                              {consumed.toFixed(1).replace(/\.0$/, "")} / {goal === "" ? "-" : goal.toFixed(1).replace(/\.0$/, "")}
                            </span>
                        </div>
                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`absolute top-0 left-0 h-full ${group.color}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">
                  {isToday(selectedDate) 
                    ? "Refeições de Hoje" 
                    : `Refeições de ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`}
                </h3>
                {currentDayData?.meals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nenhuma refeição registrada hoje</p>
                ) : (
                  <div className="space-y-3">
                    {currentDayData?.meals
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((meal) => (
                        <Card key={meal.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-top mb-2">
                              <div>
                                <h4 className="font-medium">
                                  {meal.customName ? (
                                    <span title={meal.type}>{meal.customName}</span>
                                  ) : (
                                    meal.type
                                  )}
                                </h4>
                                <p className="text-sm text-muted-foreground">{meal.time}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-7 w-7">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => editMeal(meal)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => removeMeal(meal.id)} className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remover
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {meal.portions.map((portion) => {
                                const group = foodGroups.find((g) => g.id === portion.groupId)
                                return (
                                  <div key={portion.groupId} className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full ${group?.color} mr-2`}></div>
                                    <span className="text-sm">
                                      {group?.name}: {portion.amount.toFixed(1).replace(/\.0$/, "")}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </div>

            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="mt-0">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Pesquisar Alimentos</h2>
                <FoodSearch onSelectFood={handleAddFoodToMeal} />
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-0">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Metas Diárias</h2>
                <div className="space-y-4">
                  {combinedGroups.map((group) => (
                    <div key={group.name} className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${group.color}`}></div>
                      <Label className="flex-1">{group.name}</Label>
                      <PortionInput
                        className="w-20"
                        value={goals[group.ids[0]]}
                        onChange={(newValue) => updateGoal(group.ids[0], newValue)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="container max-w-2xl mx-auto">
          <Button className="w-full" onClick={() => setMealDialogOpen(true)}>
            Adicionar Refeição
          </Button>
        </div>
      </div>

      <MealDialog
        open={mealDialogOpen}
        onOpenChange={setMealDialogOpen}
        onAddMeal={addMeal}
        mealTypes={mealTypes}
        newMeal={newMeal}
        setNewMeal={setNewMeal}
        combinedGroups={combinedGroups}
        getCurrentPortion={getCurrentPortion}
        updatePortion={updatePortion}
        foodGroups={foodGroups}
        selectedFood={selectedFood}
        isEditing={editingMealId !== null}
      />
    </div>
  )
}
