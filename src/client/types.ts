export interface Card {
  id: number;
  list_id: number;
  title: string;
  description: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: number;
  title: string;
  position: number;
  created_at: string;
  cards: Card[];
}

export type BoardData = List[];
