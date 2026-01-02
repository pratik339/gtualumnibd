import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AlumniLocation {
  country: string;
  city: string | null;
  count: number;
  coordinates: [number, number]; // [lng, lat]
}

// Country to coordinates mapping
const countryCoordinates: Record<string, [number, number]> = {
  'India': [78.9629, 20.5937],
  'United States': [-95.7129, 37.0902],
  'USA': [-95.7129, 37.0902],
  'United Kingdom': [-3.4360, 55.3781],
  'UK': [-3.4360, 55.3781],
  'Canada': [-106.3468, 56.1304],
  'Australia': [133.7751, -25.2744],
  'Germany': [10.4515, 51.1657],
  'France': [2.2137, 46.2276],
  'Singapore': [103.8198, 1.3521],
  'UAE': [53.8478, 23.4241],
  'United Arab Emirates': [53.8478, 23.4241],
  'Dubai': [55.2708, 25.2048],
  'Qatar': [51.1839, 25.3548],
  'Saudi Arabia': [45.0792, 23.8859],
  'Japan': [138.2529, 36.2048],
  'South Korea': [127.7669, 35.9078],
  'China': [104.1954, 35.8617],
  'Netherlands': [5.2913, 52.1326],
  'Switzerland': [8.2275, 46.8182],
  'Ireland': [-8.2439, 53.4129],
  'New Zealand': [174.8860, -40.9006],
  'South Africa': [22.9375, -30.5595],
  'Brazil': [-51.9253, -14.2350],
  'Mexico': [-102.5528, 23.6345],
  'Spain': [-3.7492, 40.4637],
  'Italy': [12.5674, 41.8719],
  'Sweden': [18.6435, 60.1282],
  'Norway': [8.4689, 60.4720],
  'Denmark': [9.5018, 56.2639],
  'Finland': [25.7482, 61.9241],
  'Poland': [19.1451, 51.9194],
  'Belgium': [4.4699, 50.5039],
  'Austria': [14.5501, 47.5162],
  'Malaysia': [101.9758, 4.2105],
  'Thailand': [100.9925, 15.8700],
  'Indonesia': [113.9213, -0.7893],
  'Philippines': [121.7740, 12.8797],
  'Vietnam': [108.2772, 14.0583],
  'Russia': [105.3188, 61.5240],
  'Kenya': [37.9062, -0.0236],
  'Nigeria': [8.6753, 9.0820],
  'Egypt': [30.8025, 26.8206],
  'Israel': [34.8516, 31.0461],
  'Turkey': [35.2433, 38.9637],
  'Pakistan': [69.3451, 30.3753],
  'Bangladesh': [90.3563, 23.6850],
  'Sri Lanka': [80.7718, 7.8731],
  'Nepal': [84.1240, 28.3949],
  'Oman': [55.9754, 21.4735],
  'Kuwait': [47.4818, 29.3117],
  'Bahrain': [50.5577, 26.0667],
};

export const useAlumniLocations = () => {
  const [locations, setLocations] = useState<AlumniLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAlumni, setTotalAlumni] = useState(0);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('location_country, location_city')
          .eq('status', 'approved')
          .not('location_country', 'is', null);

        if (error) throw error;

        if (profiles) {
          // Group by country and count
          const countryGroups: Record<string, { count: number; cities: Set<string> }> = {};
          
          profiles.forEach(profile => {
            const country = profile.location_country;
            if (country) {
              if (!countryGroups[country]) {
                countryGroups[country] = { count: 0, cities: new Set() };
              }
              countryGroups[country].count++;
              if (profile.location_city) {
                countryGroups[country].cities.add(profile.location_city);
              }
            }
          });

          const locationData: AlumniLocation[] = Object.entries(countryGroups)
            .map(([country, data]) => {
              const coords = countryCoordinates[country];
              if (!coords) return null;
              
              return {
                country,
                city: data.cities.size > 0 ? Array.from(data.cities)[0] : null,
                count: data.count,
                coordinates: coords,
              };
            })
            .filter((loc): loc is AlumniLocation => loc !== null);

          setLocations(locationData);
          setTotalAlumni(profiles.length);
        }
      } catch (error) {
        console.error('Error fetching alumni locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();

    // Set up realtime subscription for live updates
    const channel = supabase
      .channel('alumni-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchLocations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { locations, loading, totalAlumni };
};
