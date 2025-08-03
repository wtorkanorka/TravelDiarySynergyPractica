export interface ITravelRecording {
  user: { first_name: string; last_name: string; user_id: string };
  id: string;
  title: string;
  description: string;
  cost: string;
  culturalHeritageSites: string[];
  evaluation: {
    safety: string;
    population: string;
    vegetation: string;
  };
}
