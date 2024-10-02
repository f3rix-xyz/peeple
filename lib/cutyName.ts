export const getMapsKey = (): string =>
  process.env.MAPS_KEY ??
  ((): never => {
    throw new Error("GET maps key");
  })();

export const getCityFromCoordinates = async (
  lat: number,
  lng: number,
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${getMapsKey()}`,
    );

    // Parse JSON response
    const data = await response.json();

    // Check if the response has results
    if (data.results && data.results.length > 0) {
      // Find the 'locality' component
      const city = data.results[0].address_components.find((component: any) =>
        component.types.includes("locality"),
      );
      return city ? city.long_name : null;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching city name:", error);
    return null;
  }
};
