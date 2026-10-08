import api from './api';

export interface LeaderboardEntry {
  user_id: number;
  username: string;
  value: number;
  rank_position: number;
}

export interface LeaderboardResponse {
  ranking_type: 'points' | 'negative_points' | 'streak' | 'task_specific';
  entries: LeaderboardEntry[];
  total_participants: number;
  updated_at: string;
}

export interface UserTaskRankingInfo {
  task_id: number;
  task_name: string;
  total_earned: number;
  completion_count: number;
  success_rate: number;
}

export interface UserRankingsResponse {
  overall_rank: number | null;
  points: number;
  negative_points: number;
  streak_rank: number | null;
  streak_count: number;
  task_rankings: UserTaskRankingInfo[];
}

export type RankingType = 'points' | 'negative_points' | 'streak' | 'task_specific';

class RankingsApi {
  async leaderboard(rankingType: RankingType, params?: {task_id?: number; limit?: number}): Promise<LeaderboardResponse> {
    const query = params ? {...params} : {};
    const resp = await api.get<LeaderboardResponse>(`/rankings/leaderboard/${rankingType}`, {params: query});
    return resp.data;
  }

  async updateAll(): Promise<{message: string; timestamp: string}> {
    const resp = await api.get<{message: string; timestamp: string}>('/rankings/update');
    return resp.data;
  }

  async mine(): Promise<UserRankingsResponse> {
    const resp = await api.get<UserRankingsResponse>('/rankings/my');
    return resp.data;
  }

  async byUserId(userId: number): Promise<UserRankingsResponse> {
    const resp = await api.get<UserRankingsResponse>(`/rankings/user/${userId}/rankings`);
    return resp.data;
  }
}

export default new RankingsApi();
