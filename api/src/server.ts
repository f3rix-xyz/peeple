import e, { Request, Response } from "express";
import cors from "cors";
import { db } from "../lib/db";
import { likes, pictures, users } from "../lib/db/schema";
import { eq, sql, and, inArray } from "drizzle-orm";
import { createTransport, SentMessageInfo } from "nodemailer";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEmail, getRecommendations } from "../lib/helpers";

const app = e();
const port: number = 3000;

const logWithColor = (message: string, color: string = "\x1b[37m") => {
  console.log(`${color}%s\x1b[0m`, message);
};

// Secret environment variables
export const getJWTSECRET = (): string =>
  process.env.JWT_SECRET ??
  ((): never => {
    logWithColor("JWT_SECRET is missing!", "\x1b[31m"); // Red
    throw new Error("PLZ Define JWT Secret");
  })();

const getGmail = (): string =>
  process.env.GMAIL ??
  ((): never => {
    logWithColor("GMAIL is missing!", "\x1b[31m"); // Red
    throw new Error("Mail not defined");
  })();

const getGmailPass = (): string =>
  process.env.GMAIL_PASS ??
  ((): never => {
    logWithColor("GMAIL_PASS is missing!", "\x1b[31m"); // Red
    throw new Error("PLZ GET GMAIL PASSWORD");
  })();

// Middlewares
app.use(e.json());
app.use(
  cors({
    origin: "*",
  }),
);

// Dummy users storage
let dummyusers: { [key: string]: string } = {};

// Clear dummyusers periodically
setInterval(() => {
  logWithColor("Clearing OTP memory", "\x1b[33m"); // Yellow
  dummyusers = {};
}, 25920000); // 1Month

// Check if email exists
app.post("/check-email", async (req: Request, res: Response) => {
  logWithColor("POST /check-email - Request received", "\x1b[36m"); // Cyan
  try {
    const { email } = req.body;
    if (!email) {
      logWithColor("Email is required but missing", "\x1b[31m"); // Red
      res.status(400).json({ error: "Email is required" });
      return;
    }

    logWithColor(`Checking if email exists: ${email}`, "\x1b[36m"); // Cyan
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length > 0) {
      logWithColor(`User with email ${email} found`, "\x1b[32m"); // Green
      const nameExists = user[0].name;
      if (nameExists) {
        logWithColor(`User already has a name: ${nameExists}`, "\x1b[33m"); // Yellow
        res.json({ exists: true });
        return;
      } else {
        logWithColor(`User has no name, allowing profile creation`, "\x1b[33m"); // Yellow
        res.json({ exists: false });
        return;
      }
    } else {
      logWithColor(
        `No user with email ${email}, creating new user`,
        "\x1b[36m",
      ); // Cyan
      await db.insert(users).values({
        id: v4(),
        email: email,
      });
      res.json({ exists: false });
    }
  } catch (error) {
    logWithColor(`Error during email check: ${error}`, "\x1b[31m"); // Red
    res.status(500).json({ error: "Internal server error" });
  }
});

// Send OTP
app.post("/send-otp", (req: Request, res: Response) => {
  logWithColor("POST /send-otp - Request received", "\x1b[36m"); // Cyan
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  logWithColor(`Generated OTP for ${email}: ${otp}`, "\x1b[36m"); // Cyan
  dummyusers[email] = otp;

  const mailOptions = {
    from: getGmail(),
    to: email,
    subject: "Your OTP",
    text: `Your OTP is ${otp}`,
  };

  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: getGmail(),
      pass: getGmailPass(),
    },
  });

  logWithColor(`Attempting to send OTP to ${email}`, "\x1b[33m"); // Yellow
  transporter.sendMail(
    mailOptions,
    (error: Error | null, info: SentMessageInfo): Response | undefined => {
      if (error) {
        logWithColor(`Error sending OTP to ${email}: ${error}`, "\x1b[31m"); // Red
        return res.status(500).json({ error: "Error sending OTP" });
      } else {
        logWithColor(`OTP sent to ${email}: ${info.response}`, "\x1b[32m"); // Green
        return res.status(200).json({ message: "OTP sent to email" });
      }
    },
  );
});

// Verify OTP
app.post("/verify-otp", (req: Request, res: Response) => {
  logWithColor("POST /verify-otp - Request received", "\x1b[36m"); // Cyan
  const { email, otp } = req.body;
  logWithColor(`Verifying OTP for ${email}`, "\x1b[33m"); // Yellow

  if (dummyusers[email] === otp) {
    logWithColor(`OTP verified for ${email}`, "\x1b[32m"); // Green
    const token = jwt.sign({ email }, getJWTSECRET(), { expiresIn: "1h" });
    logWithColor(`Token generated for ${email}: ${token}`, "\x1b[36m"); // Cyan
    res.status(200).json({ token });
  } else {
    logWithColor(
      `Invalid OTP for ${email}. Provided OTP: ${otp}, Expected OTP: ${dummyusers[email]}`,
      "\x1b[31m", // Red
    );
    res.status(401).json({ error: "Invalid OTP" });
  }
});

app.post("/verify-token", (req: Request, res: Response) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    console.log(token);
    console.log("ibi");
    const email = getEmail(token);
    console.log("got Email");
    if (email) {
      res.status(200).json({ email });
    } else return;
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/get-user-from-token", async (req: Request, res: Response) => {
  logWithColor("POST /verify-token - Request received", "\x1b[36m"); // Cyan
  const token = req.headers["authorization"]?.split(" ")[1];
  logWithColor(`Received token: ${token}`, "\x1b[33m"); // Yellow

  if (!token) {
    logWithColor("No token provided", "\x1b[31m"); // Red
    res.status(401).json({ error: "Token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJWTSECRET());
    logWithColor(`Token verified, decoded email: ${decoded}`, "\x1b[32m"); // Green
    //@ts-expect-error: h i o
    const email = decoded.email;
    console.log(email);
    const userr = await db.select().from(users).where(eq(users.email, email));
    const user = userr[0];
    console.log(user);
    console.log("before image call");
    const imagess = await db
      .select()
      .from(pictures)
      .where(eq(pictures.email, email));
    console.log("after Image call");
    const images = imagess.map(
      (i: { id: number; email: string; url: string }): string => i.url,
    );
    console.log(images);
    res.json({ user, images });
  } catch (e) {
    logWithColor(`Token verification failed: ${e}`, "\x1b[31m"); // Red
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/user-form-email", async (req: Request, res: Response) => {
  console.log("Android req Received");
  const { email } = req.body;
  console.log(req.body);
  try {
    console.log("try");
    const user = (
      await db.select().from(users).where(eq(users.email, email))
    )[0];
    const imagess = await db
      .select()
      .from(pictures)
      .where(eq(pictures.email, email));
    const images = imagess.map(
      (i: { id: number; email: string; url: string }): string => i.url,
    );
    console.log(user, images);
    res.json({ user, images });
  } catch (e) {
    logWithColor(`${e}`, "\x1b[31m"); // Red
    res.status(401).json({ error: e });
  }
});
// Create or update user
app.post("/create-user", async (req: Request, res: Response) => {
  logWithColor("POST /create-user - Request received", "\x1b[36m"); // Cyan
  const { user } = req.body;
  logWithColor(`Received user data: ${JSON.stringify(user)}`, "\x1b[33m"); // Yellow

  if (!user || !user.name) {
    logWithColor("User name or data is missing", "\x1b[31m"); // Red
    res.status(400).json({ error: "Name and email are required" });
    return;
  }

  try {
    logWithColor(
      `Checking if user with email ${user.email} exists`,
      "\x1b[33m",
    ); // Yellow
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email));

    if (existingUser.length <= 0) {
      logWithColor(`User with email ${user.email} does not exist`, "\x1b[31m"); // Red
      res.status(409).json({ error: "User with this email doesn't exist" });
      return;
    }

    logWithColor(`Updating user details for ${user.email}`, "\x1b[33m"); // Yellow
    console.log(user.religion);
    await db
      .update(users)
      .set({
        name: user.name,
        location: user.location,
        gender: user.gender,
        relationshiptype: user.relationshiptype,
        height: user.height,
        religion: user.religion,
        occupationArea: user.occupationArea,
        occupationField: user.occupationField,
        drink: user.drink,
        smoke: user.smoke,
        bio: user.bio,
        date: user.date,
        month: user.month,
        year: user.year,
        instaId: user.instaId,
        phone: user.phone,
      })
      .where(eq(users.email, user.email));

    logWithColor(`User details updated for ${user.email}`, "\x1b[32m"); // Green
    res.status(201).json({ created: true });
  } catch (error) {
    logWithColor(`Error creating/updating user: ${error}`, "\x1b[31m"); // Red
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/profile-images", async (req: Request, res: Response) => {
  const { email, url } = req.body;
  console.log(`email ki behen ki chut ${email}`);
  console.log(
    "Received POST request for /profile-images with the following data:",
  );
  console.log(JSON.stringify(req.body, null, 2));

  // Field validation logging
  if (!email || !url) {
    console.log("Missing fields in request body:");
    if (!email) console.log("Missing email");
    if (!url) console.log("Missing URL");

    res.status(400).json({ error: "All fields are required" });
  }

  try {
    console.log("Inserting new image into the database...");

    // Insert new image record
    const newImage = await db.insert(pictures).values({
      email,
      url,
    });

    console.log("Image inserted successfully into the database");
    console.log("Inserted image details:");
    console.log(JSON.stringify(newImage, null, 2));

    // Send success response
    res.status(201).json({ message: "Image uploaded successfully", newImage });

    // Log the success response
    console.log("Sent 201 response to client: Image uploaded successfully");
  } catch (error) {
    console.error("Error occurred while inserting image into the database:");
    console.error(error);

    // Send error response
    res.status(500).json({ error: "Failed to upload image" });

    // Log the error response
    console.log("Sent 500 response to client: Failed to upload image");
  }
});

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// POST route for uploading image to S3
app.post("/upload-image", async (req, res) => {
  const { filename } = req.body;

  logWithColor(
    `🚀 Starting the upload process for image: "${filename}"`,
    "\x1b[34m",
  ); // Blue

  try {
    logWithColor(
      `📦 Preparing to upload the image to S3 with filename: "${filename}"`,
      "\x1b[34m",
    ); // Blue

    const command = new PutObjectCommand({
      Bucket: "peeple",
      Key: `uploads/${filename}`,
      ContentType: "image/jpeg",
    });

    logWithColor(
      `🔗 Generating a signed URL for the image upload...`,
      "\x1b[34m",
    ); // Blue

    try {
      const uploadUrl = await getSignedUrl(s3, command);
      logWithColor(
        `✅ Successfully generated the upload URL for "${filename}":\n${uploadUrl}`,
        "\x1b[35m",
      ); // Magenta

      res
        .status(200)
        .json({ message: "Upload URL generated successfully", uploadUrl });
    } catch (error: any) {
      logWithColor(
        `❌ Failed to generate upload URL for "${filename}". Error: ${error.message}`,
        "\x1b[31m",
      ); // Red
      res
        .status(500)
        .json({ error: "Error generating signed URL", details: error.message });
    }
  } catch (error: any) {
    logWithColor(
      `❌ Something went wrong during the upload initiation for "${filename}". Error: ${error.message}`,
      "\x1b[31m",
    ); // Red
    res.status(500).json({
      error: "Failed to initiate image upload",
      details: error.message,
    });
  }
});

// POST route for generating image viewing URL
app.post("/generate-url", async (req, res) => {
  const { filename } = req.body;

  logWithColor(
    `🔍 Received a request to generate a viewing URL for the image: "${filename}"`,
    "\x1b[36m",
  ); // Cyan

  if (!filename) {
    logWithColor("❌ No filename was provided in the request.", "\x1b[31m"); // Red
    res.status(400).json({ error: "Filename is required" });
  }

  try {
    const getObjectURL = async (key: string) => {
      logWithColor(
        `🌐 Generating signed URL for image key: "${key}"`,
        "\x1b[36m",
      ); // Cyan

      try {
        const url = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: "peeple",
            Key: key,
          }),
        );
        logWithColor(
          `🔗 Successfully generated viewing URL for "${filename}":\n${url}`,
          "\x1b[35m",
        ); // Magenta
        return url;
      } catch (error: any) {
        logWithColor(
          `❌ Error occurred while generating viewing URL for "${filename}": ${error.message}`,
          "\x1b[31m",
        ); // Red
        throw error;
      }
    };

    const key = `uploads/${filename}`;
    const url = await getObjectURL(key);

    logWithColor(
      `✅ Viewing URL generation for "${filename}" is complete.`,
      "\x1b[35m",
    ); // Magenta
    res.json({ filename, url });
  } catch (error: any) {
    logWithColor(
      `❌ Failed to generate viewing URL for "${filename}". Error: ${error.message}`,
      "\x1b[31m",
    ); // Red
    res.status(500).json({ error: "Failed to generate URL" });
  }
});

app.post("/get-recommendations", async (req: Request, res: Response) => {
  console.log("HEYYYYYY");
  const { email } = req.body;
  if (!email) res.status(400).json({ error: "Email is required." });

  console.log(email, "is sent");
  try {
    const recommendations = await getRecommendations(email);
    console.log(recommendations);
    res.json({ recommendations });
  } catch (e) {
    console.error("Error fetching recommendations:", e);
    res.status(500).json({ error: "Failed to fetch recommendations." });
  }
});

app.post("checkPlan", async (req: Request, res: Response) => {
  console.log("bhaiya req ja rhi hai ");
  const { email } = req.body;
  try {
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user[0].subscription === "basic") {
      res.json({ hasBasicPlan: true });
    } else {
      res.json({ hasBasicPlan: false });
    }
  } catch (e) {
    throw new Error(`${e}`);
  }
});

app.post("updateUserPlan", async (req: Request, res: Response) => {
  const { email, plan } = req.body;

  const togglePlan = (currentPlan: string) => {
    return currentPlan === "basic" ? "premium" : "basic";
  };

  try {
    const newPlan = togglePlan(plan); // Toggle the plan
    await db
      .update(users)
      .set({
        subscription: newPlan,
      })
      .where(eq(users.email, email));
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/add-like", async (req: Request, res: Response) => {
  try {
    const { likerEmail, likedEmail } = req.body;

    // Check if both emails are provided
    if (!likerEmail || !likedEmail) {
      res.status(400).json({
        message: "Both likerEmail and likedEmail must be provided.",
      });
    }

    console.log(
      `\x1b[36m[Debug] Received likerEmail: ${likerEmail}, likedEmail: ${likedEmail}`,
    );

    // Insert into the 'likes' table
    await db.insert(likes).values({
      likerEmail,
      likedEmail,
    });

    console.log("\x1b[32m[Success] Like added successfully");

    // Respond with success
    res.status(201).json({
      message: "Like added successfully.",
      likerEmail,
      likedEmail,
    });
  } catch (error) {
    console.error("\x1b[31m[Error] Failed to add like:", error);
    res.status(500).json({
      message: "Failed to add like.",
      error: error,
    });
  }
});

app.post("/liked-by", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Check if the email is provided
    if (!email) {
      res.status(400).json({
        message: "User email must be provided.",
      });
    }

    console.log(`\x1b[36m[Debug] Fetching users who liked: ${email}`);

    // Query the likes table to find all users who liked this user
    const likedByUsers = await db
      .select({
        likerEmail: users.email,
        likerName: users.name,
      })
      .from(likes)
      .innerJoin(users, eq(likes.likerEmail, users.email)) // Correct usage of eq for inner join
      .where(eq(likes.likedEmail, email)); // Ensure to use eq for where condition

    console.log("\x1b[32m[Success] Users fetched successfully:", likedByUsers);

    // Respond with the list of users who liked this user
    res.status(200).json({
      message: "Users fetched successfully.",
      likedByUsers,
    });
  } catch (error: any) {
    console.error("\x1b[31m[Error] Failed to fetch users:", error);
    res.status(500).json({
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
});

app.post("/mutual-likes", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Check if the email is provided
    if (!email) {
      res.status(400).json({
        message: "User email must be provided.",
      });
    }

    console.log(`\x1b[36m[Debug] Fetching mutual likes for: ${email}`);

    const usersWhoLikedMe = await db
      .select({ likerEmail: likes.likerEmail })
      .from(likes)
      .where(eq(likes.likedEmail, email));

    const likerEmails = usersWhoLikedMe.map(user => user.likerEmail);

    // Then, get all users that the given user has liked and who have also liked them back
    const mutualLikes = await db
      .select({
        name: users.name,
        instaId: users.instaId,
        phone: users.phone,
        photoUrl: pictures.url,
      })
      .from(likes)
      .innerJoin(users, eq(likes.likedEmail, users.email))
      .innerJoin(pictures, eq(users.email, pictures.email))
      .where(
        and(
          eq(likes.likerEmail, email),
          inArray(likes.likedEmail, likerEmails)
        )
      )
      .groupBy(users.name, users.instaId, users.phone, pictures.url, users.email, pictures.id);

    // Extracting results from the returned data
    const results = mutualLikes.map((row) => ({
      userName: row.name,
      instaId: row.instaId,
      phone: row.phone,
      photoUrl: row.photoUrl,
    }));
    console.log(
      "\x1b[32m[Success] Mutual likes fetched successfully:",
      results,
    );

    // Respond with the list of mutual likes along with user details
    res.status(200).json({
      message: "Mutual likes fetched successfully.",
      mutualLikes: results, // Responding with the extracted user details
    });
  } catch (error: any) {
    console.error("\x1b[31m[Error] Failed to fetch mutual likes:", error);
    res.status(500).json({
      message: "Failed to fetch mutual likes.",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  logWithColor(`Server listening on port ${port}`, "\x1b[32m"); // Green
});
