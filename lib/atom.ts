import { RelationshipPreference } from "@/app/(onboarding)/datingstyle";
import { Occupation } from "@/app/(onboarding)/occupation";
import { Religions } from "@/app/(onboarding)/religion";
import * as Location from "expo-location";
import { atom } from "jotai";

export const nameAtom = atom<string>("");
export const instaAtom = atom<string>("");
export const phoneAtom = atom<string>("");
export const emailAtom = atom<string>("");
export const locationAtom = atom<Location.LocationObject>();
export const genderAtom = atom<"male" | "female" | "">("");
export const relationshipTypeAtom = atom<RelationshipPreference>("casual");
export const heightAtom = atom<number>(170);
export const religionAtom = atom<Religions>("hindu");
export const workplaceAtom = atom<string>("");
export const collegeAtom = atom<string>("");
export const drinkAtom = atom<"yes" | "no" | "sometimes" | "">("");
export const smokeAtom = atom<"yes" | "no" | "sometimes" | "">("");
export const bioAtom = atom<string>("");
export const occupationAtom = atom<Occupation>({
  feild: "",
  area: "student",
});
export const dateAtom = atom<number>(1);
export const monthAtom = atom<number>(1);
export const yearAtom = atom<number>(2010);
