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
    goalsB: number | null
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
    goalsA: number,
    goalsB: number
}