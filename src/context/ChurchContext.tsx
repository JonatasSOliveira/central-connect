'use client'

import { ChurchController } from '@/application/controllers/church'
import { ChurchStorageDTO } from '@/domain/dtos/church/storage'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useTransition,
} from 'react'

interface ChurchContextProps {
  selectedChurch: ChurchStorageDTO | null
  selectChurchIsLoading: boolean
  setSelectedChurch: (church: ChurchStorageDTO) => Promise<void>
}

const ChurchContext = createContext<ChurchContextProps | undefined>(undefined)

export const ChurchProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChurch, setSelectedChurchState] =
    useState<ChurchStorageDTO | null>(null)
  const [selectChurchIsLoading, startChurchLoad] = useTransition()

  const loadSelectedChurch = () =>
    startChurchLoad(async () => {
      const selectedChurch = await ChurchController.getSelectedChurch()
      if (selectedChurch) setSelectedChurchState(selectedChurch)
    })

  useEffect(() => {
    loadSelectedChurch()
  }, [])

  const setSelectedChurch = async (church: ChurchStorageDTO) => {
    setSelectedChurchState(church)
    await ChurchController.selectChurch(church)
  }

  return (
    <ChurchContext.Provider
      value={{ selectedChurch, setSelectedChurch, selectChurchIsLoading }}
    >
      {children}
    </ChurchContext.Provider>
  )
}

export const useChurch = () => {
  const context = useContext(ChurchContext)
  if (!context) {
    throw new Error('useChurch must be used within a ChurchProvider')
  }
  return context
}
