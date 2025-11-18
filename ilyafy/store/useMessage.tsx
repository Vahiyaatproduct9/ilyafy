import { create } from 'zustand';
type useMessageProp = {
  message: string;
  setMessage: (arg: string) => void;
};
export default create<useMessageProp>()(set => ({
  message: '',
  setMessage: arg => {
    set({ message: arg });
  },
}));
