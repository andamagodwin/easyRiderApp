import React, { useEffect } from 'react';
import Mapbox, { MapView, Camera } from '@rnmapbox/maps';
import { View, Alert } from 'react-native';

const accessToken = 'pk.eyJ1IjoiYW5kYW1hZXpyYSIsImEiOiJjbWM3djMyamcwMmxuMmxzYTFsMThpNTJwIn0.9H7kNoaCYW0Kiw0wzrLfhQ';

// Set access token before component mounts
Mapbox.setAccessToken(accessToken);

const Map = () => {
  useEffect(() => {
    // Verify Mapbox is properly initialized
    console.log('Mapbox access token set');
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView 
        style={{ flex: 1 }}
        styleURL={Mapbox.StyleURL.Street}
        onDidFailLoadingMap={() => {
          console.error('Map loading failed');
          Alert.alert('Map Error', 'Failed to load map. Please check your internet connection.');
        }}
        onDidFinishLoadingMap={() => {
          console.log('Map loaded successfully');
        }}
      >
        <Camera 
          zoomLevel={12}
          centerCoordinate={[-74.006, 40.7128]} // New York City coordinates
          animationDuration={2000}
        />
      </MapView>
    </View>
  );
};

export default Map;
