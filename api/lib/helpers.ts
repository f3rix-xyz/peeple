import jwt from "jsonwebtoken";
import { getJWTSECRET } from "../src/server";
import { db } from "./db";
import { pictures, User, users } from "./db/schema";
import { eq } from "drizzle-orm";

type UserWithImage = User & { photo: string };
type RecommendationError = {
  error: string;
};

export const getEmail = (token: string | undefined): string | undefined => {
  if (token) {
    console.log("ARnav");
    try {
      const decoded = jwt.verify(token, getJWTSECRET());
      console.log("in try");
      //@ts-expect-error: W T F
      return decoded.email as string;
    } catch (e) {
      console.error(e);
      throw new Error(`${e}`);
    }
  } else {
    console.error("Token not defined");
  }
};

export const getGender = async (
  email: string | undefined,
): Promise<string | undefined> => {
  if (email) {
    try {
      const gender = await db
        .select({
          gender: users.gender,
        })
        .from(users)
        .where(eq(users.email, email));
      const onluGender: string | null = gender[0].gender;
      if (onluGender) return onluGender;
    } catch (e) {
      console.error(e);
      throw new Error(`${e}`);
    }
  } else {
    console.error("No email");
  }
};

export const getRecommendations = async (
  email: string | undefined,
): Promise<UserWithImage[] | RecommendationError> => {
  console.log("Starting getRecommendations function");

  if (!email) {
    console.error("Email not provided");
    return { error: "Email is required" }; // Return a proper error message
  }

  try {
    console.log("Getting gender for email:", email);
    const gender: string | undefined = await getGender(email);

    if (!gender) {
      console.error("Gender not found for email:", email);
      return { error: "Gender not found" }; // Return a proper error message
    }

    console.log("Gender found:", gender);
    let recommendation;
    let recommendationWithImage;
    try {
      if (gender === "male") {
        console.log("Fetching female users as recommendations");
        recommendation = await db
          .select()
          .from(users)
          .where(eq(users.gender, "female"))
          .execute();

        recommendationWithImage = await Promise.all(
          recommendation.map(async (user: User): Promise<UserWithImage> => {
            const image = (
              await db
                .select({ url: pictures.url })
                .from(pictures)
                .where(eq(pictures.email, user.email))
            )[0];

            return {
              ...user,
              photo: image.url,
            };
          }),
        );

        return recommendationWithImage;
      } else if (gender === "female") {
        console.log("Fetching male users as recommendations");
        recommendation = await db
          .select()
          .from(users)
          .where(eq(users.gender, "male"))
          .execute();

        recommendationWithImage = await Promise.all(
          recommendation.map(async (user: User): Promise<UserWithImage> => {
            const image = (
              await db
                .select({ url: pictures.url })
                .from(pictures)
                .where(eq(pictures.email, user.email))
            )[0];

            return {
              ...user,
              photo: image.url,
            };
          }),
        );
        return recommendationWithImage;
      } else {
        console.error("Unhandled gender type:", gender);
        return { error: "Invalid gender type" }; // Return a proper error message
      }
    } catch (recommendationError) {
      console.error("Error fetching recommendations:", recommendationError);
      throw new Error("Failed to fetch recommendations from database");
    }
  } catch (genderError) {
    console.error("Error fetching gender:", genderError);
    throw new Error("Failed to fetch gender");
  }
};
