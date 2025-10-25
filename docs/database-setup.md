# Appwrite Database Schema Setup Guide

This guide will help you set up the required collections in your Appwrite database to support the enhanced salon details functionality.

## Collections Overview

You'll need to create the following collections in your Appwrite database:

### 1. `salons` Collection (Enhanced)

**Collection ID:** `salons`

#### Attributes:
- `name` (String, Required) - Salon name
- `address` (String, Required) - Street address
- `city` (String, Required) - City name
- `state` (String, Required) - State/Province
- `latitude` (Float, Required) - GPS latitude
- `longitude` (Float, Required) - GPS longitude  
- `rating` (Float, Required) - Average rating (0-5)
- `reviewCount` (Integer, Required) - Number of reviews
- `imageUrl` (String, Optional) - Main salon image URL
- `phone` (String, Optional) - Contact phone number
- `description` (String, Optional) - Salon description
- `workingHours` (String, Optional) - Operating hours (e.g., "9AM-10PM, Mon-Sun")
- `images` (String Array, Optional) - Additional image URLs
- `services` (String Array, Optional) - Array of service IDs (for reference)
- `isActive` (Boolean, Required, Default: true) - Whether salon is active

#### Indexes:
- `isActive` (Single Key)
- `city` (Single Key)
- `rating` (Single Key)

### 2. `salon_services` Collection (New)

**Collection ID:** `salon_services`

This collection stores individual services offered by each salon with their specific pricing and details.

#### Attributes:
- `salonId` (String, Required) - Reference to salon document ID
- `name` (String, Required) - Service name (e.g., "Hair Cut", "Deep Treatment")
- `price` (Float, Required) - Service price in USD
- `duration` (Integer, Required) - Service duration in minutes
- `category` (String, Required) - Service category (e.g., "Hair Cut", "Hair Styling", "Hair Treatments", "Combo")
- `description` (String, Optional) - Detailed service description
- `isActive` (Boolean, Required, Default: true) - Whether service is available

#### Indexes:
- `salonId` (Single Key)
- `category` (Single Key)  
- `isActive` (Single Key)
- `salonId_isActive` (Compound Key: salonId + isActive)

### 3. `services` Collection (Existing)

**Collection ID:** `services`

Keep your existing services collection for the main service categories.

#### Attributes:
- `name` (String, Required) - Service category name
- `icon` (String, Required) - Icon name for UI
- `isActive` (Boolean, Optional, Default: true)
- `order` (Integer, Optional) - Display order

## Sample Data

### Sample Salon Document:
```json
{
  "$id": "hair-avenue-001",
  "name": "Hair Avenue",
  "address": "No 03, Kadalana Road",
  "city": "Kadalana", 
  "state": "Moratuwa",
  "latitude": 6.7944,
  "longitude": 79.8816,
  "rating": 4.7,
  "reviewCount": 312,
  "imageUrl": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
  "phone": "+94 11 234 5678",
  "description": "Hair Avenue provides expert haircuts, styling, along with services like facials, cleanups, skincare and makeup to keep you looking your best.",
  "workingHours": "9AM-10PM, Mon-Sun",
  "images": [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop"
  ],
  "services": [],
  "isActive": true
}
```

### Sample Salon Service Documents:
```json
[
  {
    "$id": "service-001",
    "salonId": "hair-avenue-001",
    "name": "Hair Cut",
    "price": 10.00,
    "duration": 30,
    "category": "Hair Cut",
    "description": "Professional hair cutting service",
    "isActive": true
  },
  {
    "$id": "service-002", 
    "salonId": "hair-avenue-001",
    "name": "Hair Wash",
    "price": 5.00,
    "duration": 30,
    "category": "Hair Cut",
    "isActive": true
  },
  {
    "$id": "service-003",
    "salonId": "hair-avenue-001", 
    "name": "Basic Styling",
    "price": 15.00,
    "duration": 45,
    "category": "Hair Styling",
    "isActive": true
  },
  {
    "$id": "service-004",
    "salonId": "hair-avenue-001",
    "name": "Deep Treatment", 
    "price": 35.00,
    "duration": 90,
    "category": "Hair Treatments",
    "isActive": true
  }
]
```

## Setup Steps in Appwrite Console

1. **Navigate to Databases** in your Appwrite project
2. **Create/Update Collections:**
   - If `salons` exists, add the new attributes listed above
   - Create new `salon_services` collection with the specified attributes
3. **Set Permissions:**
   - For both collections, set read permissions for authenticated users
   - Set write permissions as needed for your admin/management flow
4. **Create Indexes:**
   - Add the indexes listed above for better query performance
5. **Add Sample Data:**
   - Use the Appwrite console to add some sample salon and service data for testing

## Next Steps

After setting up the database:

1. **Test the App:** The salon details screen should now work with mock data
2. **Replace Mock Data:** Update the `loadSalonDetails` function in `/app/salon/[id].tsx` to use real Appwrite data instead of mock data
3. **Add Real Data:** Use the Appwrite console or create an admin interface to add real salon and service data
4. **Implement Booking:** Add a booking system that references these services

## API Usage Examples

```typescript
// Get salon details
const salon = await AppwriteService.getSalonById('hair-avenue-001');

// Get salon services  
const services = await AppwriteService.getSalonServices('hair-avenue-001');

// Get services by category
const haircuts = services.filter(s => s.category === 'Hair Cut');
```

The enhanced schema supports all the features shown in your reference design, including:
- Multiple service categories with filtering
- Individual service pricing and duration
- Detailed salon information
- Professional service organization
- Expandable for future booking system integration