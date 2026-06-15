import type { adaptiveRequest, finalsResponse, finalsSimulationMatch, groupsResponse } from "../../features/simulation/models/simulationTypes";
import type { finalsMatch, match } from "../models/matchTypes";
import type { groupCode, groupsDisplayResponse } from "../models/teamTypes";

import { axiosService } from "./axiosService";

export const fetchService = {
    groups: () => axiosService.get<groupsDisplayResponse[]>(`/api/WorldCupTeams/groups`),

    matches: () => axiosService.get<match[]>(`/api/WorldCupMatches`),

    //Unused
    groupmatches: (groupCode: groupCode) => axiosService.get<match[]>(`/api/WorldCupMatches/group/${groupCode}`),

    finalsmatches: () => axiosService.get<finalsMatch[]>(`/api/WorldCupFinals`),

    simulategroups: (type: 0 | 1,) => 
        axiosService.get<groupsResponse>(`/api/Simulators/groups`, {
            params: { type }
        }),

    finalsforsimulation: () => axiosService.get<finalsSimulationMatch[]>(`/api/WorldCupFinals/simulation`),

    simulateknockouts: (type: 0 | 1, matches : finalsSimulationMatch[]) =>
        axiosService.post<finalsResponse>(`/api/Simulators/knockouts/simple`,
            matches,
            {
                params: { type },
            },
        ),

    simulateknockoutsadp: (request: adaptiveRequest) =>
        axiosService.post<finalsResponse>(`/api/Simulators/knockouts/adaptive`,
            request
        ),     
};
    
      