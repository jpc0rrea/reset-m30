"use client"

import { useState, useEffect } from "react"
import { Search, Plus } from "lucide-react"
import { type Food, foods } from "@/data/foods"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FoodSearchProps {
  onSelectFood?: (food: Food) => void
}

export function FoodSearch({ onSelectFood }: FoodSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Food[]>([])
  const [selectedTab, setSelectedTab] = useState("all")
  const [groupedFoods, setGroupedFoods] = useState<Record<number, Food[]>>({})

  // Agrupar alimentos por número de grupo
  useEffect(() => {
    const grouped: Record<number, Food[]> = {}
    foods.forEach((food) => {
      if (!grouped[food.groupNumber]) {
        grouped[food.groupNumber] = []
      }
      grouped[food.groupNumber].push(food)
    })
    setGroupedFoods(grouped)
  }, [])

  // Filtrar alimentos com base no termo de pesquisa
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([])
      return
    }

    const normalizedSearchTerm = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    const results = foods.filter((food) => {
      const normalizedName = food.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

      return normalizedName.includes(normalizedSearchTerm)
    })

    setSearchResults(results)
  }, [searchTerm])

  // Filtrar por grupo selecionado
  const filteredResults =
    selectedTab === "all"
      ? searchResults
      : searchResults.filter((food) => food.groupNumber === Number.parseInt(selectedTab))

  // Função para obter a cor do grupo
  const getGroupColor = (groupNumber: number) => {
    const groupColors: Record<number, string> = {
      1: "bg-gray-500",
      2: "bg-green-300",
      3: "bg-green-500",
      4: "bg-rose-500",
      5: "bg-emerald-500",
      9: "bg-amber-500",
      11: "bg-sky-500",
      12: "bg-amber-500",
      13: "bg-sky-500",
    }
    return groupColors[groupNumber] || "bg-gray-500"
  }

  // Renderizar um item de alimento
  const renderFoodItem = (food: Food) => (
    <Card key={food.id} className="mb-2 hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-medium">{food.name}</h4>
            <p className="text-sm text-muted-foreground">
              {food.servingDescription}
              {food.servingWeightGrams && ` (${food.servingWeightGrams}g)`}
            </p>
            {food.notes && <p className="text-xs italic mt-1">{food.notes}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getGroupColor(food.groupNumber)} text-white`}>
              {food.groupNumber}
            </Badge>
            {onSelectFood && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onSelectFood(food)}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">Adicionar</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="w-full">
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar alimentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchTerm && (
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>
            Limpar
          </Button>
        )}
      </div>

      {searchTerm && (
        <div className="mt-2 mb-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full overflow-x-auto flex-nowrap">
              <TabsTrigger value="all">Todos</TabsTrigger>
              {Object.keys(groupedFoods).map((groupNumber) => (
                <TabsTrigger key={groupNumber} value={groupNumber}>
                  Grupo {groupNumber}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {searchTerm && (
        <ScrollArea className="h-[500px] pr-4">
          {filteredResults.length > 0 ? (
            filteredResults.map(renderFoodItem)
          ) : (
            <p className="text-center py-8 text-muted-foreground">Nenhum alimento encontrado para "{searchTerm}"</p>
          )}
        </ScrollArea>
      )}

      {!searchTerm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">
              Pesquise por alimentos para ver informações de porções
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p className="mb-4">Digite o nome de um alimento para ver detalhes sobre porções e pesos</p>
            <p className="text-sm">Clique no botão + para adicionar o alimento à sua refeição</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
