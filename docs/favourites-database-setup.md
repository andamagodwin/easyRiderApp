# Appwrite Database Setup for EasyRider Favourites

This document outlines the database schema required for the favourites functionality in the EasyRider app.

## Database Configuration

### Database ID
- Database ID: `trimmr-db`

### Collections

#### 1. Favourites Collection
- Collection ID: `favourites`
- Name: "User Favourites"
- Description: "Stores user's favourite salons"

#### Attributes

| Attribute | Type | Size | Required | Array | Default | Description |
|-----------|------|------|----------|-------|---------|-------------|
| `userId` | String | 36 | Yes | No | - | User's Appwrite account ID |
| `salonId` | String | 50 | Yes | No | - | Unique identifier for the salon |
| `salonName` | String | 100 | Yes | No | - | Name of the salon |
| `salonLocation` | String | 200 | Yes | No | - | Salon's address/location |
| `salonRating` | Double | - | Yes | No | 0 | Salon's average rating |
| `salonReviewCount` | Integer | - | Yes | No | 0 | Number of reviews |
| `salonImageUrl` | String | 500 | No | No | - | URL to salon's image |
| `salonServices` | String | 1000 | No | Yes | - | Array of services offered |

#### Indexes

1. **User Favourites Index**
   - Key: `userId`
   - Type: key
   - Orders: ASC
   - Purpose: Query all favourites for a specific user

2. **User-Salon Index**
   - Key: `userId, salonId`
   - Type: unique
   - Orders: ASC, ASC
   - Purpose: Ensure one favourite per salon per user & quick lookup

#### Permissions

**Read Access:**
- `user:[USER_ID]` (Users can read their own favourites)

**Write Access:**
- `user:[USER_ID]` (Users can create/update/delete their own favourites)

**Delete Access:**
- `user:[USER_ID]` (Users can delete their own favourites)

## Setup Instructions

### Step 1: Create Database
1. Go to your Appwrite Console
2. Navigate to Databases
3. Create a new database with ID: `trimmr-db`

### Step 2: Create Collection
1. Inside the database, create a new collection
2. Set Collection ID: `favourites`
3. Name: "User Favourites"

### Step 3: Add Attributes
Add the attributes listed above in the exact order with the specified configurations.

### Step 4: Create Indexes
Add the indexes for optimal query performance.

### Step 5: Set Permissions
Configure permissions to ensure users can only access their own favourites.

## Usage in App

The favourites store (`store/favourites.ts`) will automatically:

1. **Load Favourites**: Fetch all favourites for the authenticated user
2. **Add Favourite**: Create a new favourite record when user hearts a salon
3. **Remove Favourite**: Delete the favourite record when user un-hearts a salon
4. **Toggle Favourite**: Smart toggle that adds or removes based on current state

## Environment Variables Required

Make sure your `app.json` has the Appwrite configuration:

```json
{
  "expo": {
    "extra": {
      "APPWRITE_ENDPOINT": "https://your-appwrite-endpoint",
      "APPWRITE_PROJECT_ID": "your-project-id"
    }
  }
}
```

## Error Handling

The favourites store includes comprehensive error handling:
- Network errors
- Permission errors
- Validation errors
- Duplicate favourite attempts

All errors are exposed through the `error` state and can be displayed to users.