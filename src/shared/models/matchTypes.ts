export interface match {
    matchId: number,
    round: number,
    date: string,
    groupCode: string,
    teamAName: string,
    teamBName: string,
    teamACode: string,
    teamBCode: string,
    goalsA: number | null,
    goalsB: number | null,
    played: boolean
}

export interface finalsMatch {
    matchId: number,
    key: number,
    stage: number,
    date: Date,
    nextMatchKey: number,
    teamAName: string,
    teamBName: string,
    teamACode: string,
    teamBCode: string,
    goalsA: number | null,
    goalsB: number | null
}

export interface thirdPlace {
    index: number,
    group: string
}

export interface thirdPlaceSlot {
    key: number,
    index: number
}