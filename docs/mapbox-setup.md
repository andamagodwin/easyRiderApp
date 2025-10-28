# Mapbox Setup Guide

## Configuration Required

### 1. Get Mapbox Access Token
1. Go to [https://www.mapbox.com/](https://www.mapbox.com/)
2. Sign up or log in to your account
3. Go to your Account page → Access tokens
4. Create a new token or copy your default public token

### 2. Add Token to Environment

Add to your `.env` file (create if it doesn't exist):
```
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

### 3. Update app.json

Add Mapbox configuration to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsDownloadToken": "YOUR_MAPBOX_DOWNLOAD_TOKEN",
          "RNMapboxMapsVersion": "10.16.0"
        }
      ]
    ]
  }
}
```

### 4. iOS Configuration (if applicable)

Add to `ios/Podfile`:
```ruby
pre_install do |installer|
  $RNMapboxMaps.pre_install(installer)
end

post_install do |installer|
  $RNMapboxMaps.post_install(installer)
end
```

### 5. Android Configuration

The Android configuration should already be set up from the initial @rnmapbox/maps installation.

## Rebuild After Configuration

After adding the token and configuration:

```bash
# Prebuild to apply native changes
npx expo prebuild --clean

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

## Features Implemented

- ✅ Interactive map with Mapbox
- ✅ Custom salon markers (blue pins with scissors icon)
- ✅ Location search bar
- ✅ Filter options button
- ✅ Bottom sheet with salon cards
- ✅ Horizontal scrollable salon list
- ✅ Tap marker to focus on specific salon
- ✅ Tap salon card to view details
- ✅ Heart icon for favorites
- ✅ Distance, rating, and location display

## Current Implementation

The map view screen (`app/map-view.tsx`) includes:
- 7 mock salons around Lakewood, California
- Blue map markers for each salon
- Bottom carousel showing salon cards
- When marker is tapped, only that salon card shows
- Navigation to salon details on card tap
- Back button to return to home
