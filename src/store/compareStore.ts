import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompareCollege {
  id: string;
  name: string;
  location: string;
  fees: number;
  rating: number;
  imageUrl: string;
  courses: string[];
  facilities: string[];
  placementAverage: number;
  placementHighest: number;
}

interface CompareState {
  selectedColleges: CompareCollege[];
  addToCompare: (college: CompareCollege, addToast: (msg: string, type: "success" | "error") => void) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  setCompare: (colleges: CompareCollege[]) => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      selectedColleges: [],
      addToCompare: (college, addToast) => {
        set((state) => {
          if (state.selectedColleges.some((c) => c.id === college.id)) {
            addToast(`${college.name} is already in your comparison list.`, "error");
            return state;
          }
          if (state.selectedColleges.length >= 3) {
            addToast("You can compare up to 3 colleges at a time.", "error");
            return state;
          }
          addToast(`${college.name} added to comparison list.`, "success");
          return {
            selectedColleges: [...state.selectedColleges, college],
          };
        });
      },
      removeFromCompare: (id) =>
          set((state) => ({
            selectedColleges: state.selectedColleges.filter((c) => c.id !== id),
          })),
      clearCompare: () => set({ selectedColleges: [] }),
      setCompare: (colleges) => set({ selectedColleges: colleges }),
    }),
    {
      name: "college-compare-store",
    }
  )
);
