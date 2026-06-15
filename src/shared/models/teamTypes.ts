export interface teamResponse {
    name: string,
    points: number,
    goalsScored: number,
    goalsConceded: number,
    goalDifference: number
}

export interface teamDisplay {
    teamName: string,
    teamCode: string,
    points: number
}

export interface groupsDisplayResponse {
    groupCode: string,
    teams: teamDisplay[]
}

const GROUP_CODES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;
export type groupCode = typeof GROUP_CODES[number];