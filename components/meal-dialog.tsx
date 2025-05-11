"use client"

import type React from "react"

import { useEffect } from "react"
import type { Food } from "@/data/foods"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PortionInput } from "@/components/portion-input"

interface MealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMeal: () => void
  mealTypes: string[]
  newMeal: {
    type: string
    time: string
    portions: { groupId: number; amount: number | "" }[]
  }
  setNewMeal: React.Dispatch<
    React.SetStateAction<{
      type: string
      time: string
      portions: { groupId: number; amount: number | "" }[]
    }>
  >
  combinedGroups: {
    name: string
    ids: number[]
    color: string
  }[]
  getCurrentPortion: (groupId: number) => number | ""
  updatePortion: (groupId: number, amount: number | "") => void
  foodGroups: {
    id: number
    name: string
    color: string
    group: string
  }[]
  selectedFood: Food | null
}

export function MealDialog({
  open,
  onOpenChange,
  onAddMeal,
  mealTypes,
  newMeal,
  setNewMeal,
  combinedGroups,
  getCurrentPortion,
  updatePortion,
  foodGroups,
  selectedFood,
}: MealDialogProps) {
  // Efeito para destacar o alimento selecionado, se houver
  useEffect(() => {
    if (selectedFood) {
      // Destacar o grupo do alimento selecionado
      const groupElement = document.getElementById(`food-group-${selectedFood.groupNumber}`)
      if (groupElement) {
        groupElement.scrollIntoView({ behavior: "smooth", block: "center" })
        groupElement.classList.add("highlight-group")

        setTimeout(() => {
          groupElement.classList.remove("highlight-group")
        }, 2000)
      }
    }
  }, [selectedFood, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Refeição</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal-type">Tipo de Refeição</Label>
              <Select value={newMeal.type} onValueChange={(value) => setNewMeal({ ...newMeal, type: value })}>
                <SelectTrigger id="meal-type">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-time">Horário</Label>
              <Input
                id="meal-time"
                type="time"
                value={newMeal.time}
                onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Porções</h4>
            {selectedFood && (
              <div className="mb-4 p-3 border rounded-md bg-muted/30">
                <h5 className="font-medium mb-1">Alimento Selecionado</h5>
                <p className="text-sm">
                  {selectedFood.name} - {selectedFood.servingDescription}
                </p>
                {selectedFood.servingWeightGrams && (
                  <p className="text-xs text-muted-foreground">{selectedFood.servingWeightGrams}g por porção</p>
                )}
              </div>
            )}

            {combinedGroups.map((group) => (
              <div key={group.name} className="flex items-center gap-4" id={`food-group-${group.ids[0]}`}>
                <div className={`w-3 h-3 rounded-full ${group.color}`}></div>
                <Label className="flex-1">{group.name}</Label>
                {group.ids.length === 1 ? (
                  <PortionInput
                    className={`w-20 ${selectedFood && selectedFood.groupNumber === group.ids[0] ? "ring-2 ring-primary" : ""}`}
                    value={getCurrentPortion(group.ids[0])}
                    onChange={(value) => updatePortion(group.ids[0], value)}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2 w-50">
                    {group.ids.map((id) => {
                      const subGroup = foodGroups.find((g) => g.id === id)
                      return (
                        <div key={id} className="flex flex-col items-center">
                          <Label className="text-xs mb-1">{subGroup?.name}</Label>
                          <PortionInput
                            className={`w-full ${selectedFood && selectedFood.groupNumber === id ? "ring-2 ring-primary" : ""}`}
                            value={getCurrentPortion(id)}
                            onChange={(value) => updatePortion(id, value)}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={onAddMeal}>Salvar Refeição</Button>
      </DialogContent>
    </Dialog>
  )
}
