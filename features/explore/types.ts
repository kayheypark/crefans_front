import { Creator } from "@/lib/api/explore";
export interface ExploreData {
  newCreators: Creator[];
  popularCreators: {
    [key: string]: Creator[];
  };
}

export interface ExploreMoreData {
  [key: string]: Creator[];
}
