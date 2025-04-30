import { create } from "zustand";

const usePremiumModal = create((set)=>({
    openPremiumModal:false,
    setOpenPremiumModal:(openPremiumModal)=>set({openPremiumModal})
}))

export default usePremiumModal