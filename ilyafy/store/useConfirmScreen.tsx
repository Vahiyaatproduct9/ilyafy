import { create } from 'zustand';
type criteriaType = {
  title: string | null;
  body: string | null;
  yesFunction: (() => any) | (() => Promise<any>) | null;
  noFunction: (() => any) | (() => Promise<any>) | null;
  critical: 'yes' | 'no' | null;
  yesLabel: string | null;
  noLabel: string | null;
};
type confirmScreen = {
  data: criteriaType;
  setData: (arg: Partial<criteriaType>) => void;
  clearData: () => void;
  isVisible: boolean;
  setVisible: (arg: boolean) => void;
};
export default create<confirmScreen>((set, get) => ({
  data: {
    title: null,
    body: null,
    yesFunction: null,
    noFunction: null,
    critical: null,
    yesLabel: null,
    noLabel: null,
  },
  isVisible: false,
  setData: arg => {
    set({ data: { ...get().data, ...arg }, isVisible: true });
  },
  clearData: () => {
    set({
      data: {
        title: null,
        body: null,
        yesFunction: null,
        noFunction: null,
        critical: null,
        yesLabel: null,
        noLabel: null,
      },
      isVisible: false,
    });
  },
  setVisible: arg => {
    set({ isVisible: arg });
  },
}));
