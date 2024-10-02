import { User } from "../../api/lib/db/schema";

export const getReccomendations = async (
  email: string,
): Promise<User[] | undefined> => {
  try {
    const res = await fetch("http://10.61.39.212:3000/get-reccomendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      const data = await res.json();
      const reccomendations = data.reccomendations as User[];
      return reccomendations;
    } else {
      const er = await res.json();
      console.error(er);
    }
  } catch (e) {
    throw new Error(`${e}`);
  }
};
