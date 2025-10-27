# Appwrite Database Setup for EasyRider Stylists

This document outlines the database schema required for the stylists functionality in the EasyRider booking system.

## Database Configuration

### Database ID
- Database ID: `trimmr-db` (same as favourites)

### Collections

#### 1. Stylists Collection
- Collection ID: `stylists`
- Name: "Salon Stylists"
- Description: "Stores stylist profiles and their salon associations"

#### Attributes

| Attribute | Type | Size | Required | Array | Default | Description |
|-----------|------|------|----------|-------|---------|-------------|
| `salonId` | String | 50 | Yes | No | - | Reference to salon this stylist works at |
| `name` | String | 100 | Yes | No | - | Stylist's full name |
| `specialty` | String | 100 | Yes | No | - | Stylist's specialty (e.g., "Hair Specialist", "Hair Dresser") |
| `imageUrl` | String | 500 | No | No | - | URL to stylist's profile photo |
| `rating` | Double | - | No | No | 0 | Average rating from reviews |
| `reviewCount` | Integer | - | No | No | 0 | Total number of reviews |
| `isTopRated` | Boolean | - | No | No | false | Whether stylist has top-rated status |
| `availableServices` | String | 50 | No | Yes | - | Array of service IDs this stylist can perform |
| `workingHours` | String | 200 | No | No | - | JSON string of working schedule |
| `isActive` | Boolean | - | No | No | true | Whether stylist is currently active |

#### Indexes

1. **Salon Stylists Index**
   - Key: `salonId`
   - Type: key
   - Orders: ASC
   - Purpose: Query all stylists for a specific salon

2. **Service Capability Index**
   - Key: `availableServices`
   - Type: key
   - Orders: ASC
   - Purpose: Find stylists who can perform specific services

3. **Top Rated Index**
   - Key: `isTopRated, rating`
   - Type: key
   - Orders: DESC, DESC
   - Purpose: Query top-rated stylists first

#### Permissions

**Read Access:**
- `users` (All authenticated users can view stylists)

**Write Access:**
- `admins` (Only salon admins can manage stylists)

**Delete Access:**
- `admins` (Only salon admins can delete stylists)

## Sample Data Structure

```json
{
  "$id": "stylist_001",
  "salonId": "salon_001",
  "name": "John Doe",
  "specialty": "Hair Specialist",
  "imageUrl": "https://example.com/stylist1.jpg",
  "rating": 4.8,
  "reviewCount": 124,
  "isTopRated": true,
  "availableServices": ["service_001", "service_002", "service_003"],
  "workingHours": "{\"monday\":{\"start\":\"09:00\",\"end\":\"18:00\"},\"tuesday\":{\"start\":\"09:00\",\"end\":\"18:00\"}}",
  "isActive": true
}
```

## Integration with Booking System

The stylists are integrated into the booking flow as follows:

1. **Service Selection**: User selects services in salon details
2. **Stylist Filtering**: System queries stylists who can perform selected services
3. **Stylist Options**: 
   - "Any Stylist" - System assigns next available
   - "Multiple Stylists" - User can choose different stylists per service
   - Individual Stylist - User selects specific stylist
4. **Availability Check**: Next step checks stylist availability for selected time slots

## Setup Instructions

### Step 1: Create Collection
1. In your Appwrite database `trimmr-db`
2. Create collection with ID: `stylists`
3. Name: "Salon Stylists"

### Step 2: Add Attributes
Add all attributes listed above with exact specifications.

### Step 3: Create Indexes
Add the three indexes for optimal query performance.

### Step 4: Set Permissions
Configure read access for all users, write/delete for admins only.

### Step 5: Populate Sample Data
Add sample stylists for testing the booking flow.

## Booking Store Integration

The stylists are managed through the `useBookingStore` with these methods:

- `loadStylists(salonId, serviceIds?)` - Fetch available stylists
- `setSelectedStylist(stylist)` - Set chosen stylist
- State includes loading, error handling, and caching

## Next Steps

After stylist selection, the booking flow continues to:
1. Date/Time Selection
2. Booking Confirmation
3. Payment Processing
4. Appointment Creation