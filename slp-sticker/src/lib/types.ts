export type NavKey = 'clients' | 'session' | 'reports' | 'settings'

export type GoalDomain = 'articulation' | 'language' | 'fluency' | 'voice' | 'pragmatics' | 'other'

export type GoalScoring = 'trials' | 'rating'

export type Goal = {
  id: string
  label: string
  domain: GoalDomain
  scoring: GoalScoring
  target?: string
  notes?: string
  createdAt: number
}

export type Client = {
  id: string
  name: string
  age?: string
  pronouns?: string
  notes?: string
  goalIds: string[]
  createdAt: number
}

export type SessionGoalResult =
  | {
      goalId: string
      scoring: 'trials'
      correct: number
      total: number
    }
  | {
      goalId: string
      scoring: 'rating'
      rating: number // 0..5
    }

export type Session = {
  id: string
  clientId: string
  startedAt: number
  endedAt: number
  minutes: number
  goalResults: SessionGoalResult[]
  tags?: string[]
  note?: string
}

export type AppSettings = {
  defaultSessionMinutes: number
  quickButtons: {
    correctLabel: string
    incorrectLabel: string
  }
  reducedMotion: boolean
}

export type AppData = {
  version: 1
  goals: Goal[]
  clients: Client[]
  sessions: Session[]
  settings: AppSettings
}
