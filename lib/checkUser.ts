export const userExists = async (
  email: string,
): Promise<boolean | undefined> => {
  try {
    console.log(`randiyon ki email ${email}`);
    const response = await fetch(`${process.env.EXPO_PUBLIC_API}/check-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok)
      throw new Error(
        `Server responded with status: ${response.status} ${response.json()}`,
      );

    const data = await response.json();

    console.log(data);
    return data.exists;
  } catch (e) {
    console.error(e);
  }
};
