import { useEffect, useRef } from "react";

export default function Map({ addresses }) {
    const mapRef = useRef(null);

    useEffect(() => {
        const loadGoogleMapsScript = () => {
            // Check if the script is already loaded
            if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
                // If the script already exists, initialize the map
                if (window.google) {
                    initMap();
                } else {
                    // Wait for the script to load if it's not fully loaded yet
                    window.addEventListener("load", initMap);
                }
                return;
            }

            // Add the Google Maps API script dynamically
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.head.appendChild(script);
        };

        const initMap = () => {
            if (!mapRef.current) return;

            const map = new google.maps.Map(mapRef.current, {
                zoom: 4,
                center: { lat: 37.0902, lng: -95.7129 }, // Center of the US
            });

            const geocoder = new google.maps.Geocoder();
            const bounds = new google.maps.LatLngBounds();

            addresses.forEach((address) => {
                geocoder.geocode({ address: address }, (results, status) => {
                    if (status === "OK") {
                        const location = results[0].geometry.location;
                        new google.maps.Marker({
                            map: map,
                            position: location,
                            title: address,
                        });
                        bounds.extend(location);
                        map.fitBounds(bounds);
                    } else {
                        console.error(`Geocoding failed for "${address}" with status: ${status}`);
                    }
                });
            });
        };

        loadGoogleMapsScript();
    }, [addresses]);

    return <div ref={mapRef} style={{ height: "600px", width: "100%" }} />;
}