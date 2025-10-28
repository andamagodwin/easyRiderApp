# Appwrite Bookings Collection Setup

## Collection Name: `bookings`

### Attributes to Create:

1. **userId** (String)
   - Size: 255
   - Required: Yes
   - Array: No
   
2. **salonId** (String)
   - Size: 255
   - Required: Yes
   - Array: No

3. **salonName** (String)
   - Size: 500
   - Required: Yes
   - Array: No

4. **salonAddress** (String)
   - Size: 500
   - Required: No
   - Array: No

5. **salonImageUrl** (String)
   - Size: 2000
   - Required: No
   - Array: No

6. **stylistId** (String)
   - Size: 255
   - Required: No
   - Array: No

7. **stylistName** (String)
   - Size: 255
   - Required: No
   - Array: No

8. **serviceIds** (String)
   - Size: 36
   - Required: Yes
   - Array: Yes ✓

9. **serviceNames** (String)
   - Size: 255
   - Required: Yes
   - Array: Yes ✓

10. **servicePrices** (Float)
    - Required: Yes
    - Array: Yes ✓

11. **appointmentDate** (String)
    - Size: 255
    - Required: Yes
    - Array: No

12. **appointmentTime** (String)
    - Size: 255
    - Required: Yes
    - Array: No

13. **totalPrice** (Float)
    - Required: Yes
    - Array: No

14. **totalDuration** (Integer)
    - Required: Yes
    - Array: No
    - Min: 0
    - Max: 999999

14. **discount** (Float)
    - Required: No
    - Array: No
    - Default: 0

15. **finalAmount** (Float)
    - Required: Yes
    - Array: No

16. **paymentMethod** (String)
    - Size: 50
    - Required: Yes
    - Array: No

17. **paymentStatus** (String)
    - Size: 50
    - Required: Yes
    - Array: No
    - Default: pending

18. **bookingStatus** (String)
    - Size: 50
    - Required: Yes
    - Array: No
    - Default: confirmed

19. **notes** (String)
    - Size: 1000
    - Required: No
    - Array: No

### Indexes to Create:

1. **userId_index**
   - Type: Key
   - Attribute: userId
   - Order: ASC

2. **salonId_index**
   - Type: Key
   - Attribute: salonId
   - Order: ASC

3. **bookingStatus_index**
   - Type: Key
   - Attribute: bookingStatus
   - Order: ASC

4. **createdAt_index**
   - Type: Key
   - Attribute: $createdAt
   - Order: DESC

### Permissions:

Set appropriate permissions based on your app's needs:
- **Create**: Users (to allow logged-in users to create bookings)
- **Read**: Users (users can read their own bookings)
- **Update**: Admins (for status updates)
- **Delete**: Admins only

## Implementation Summary:

✅ **BookingDocument** type created in `lib/appwrite-service.ts`
✅ **createBooking()** method added to AppwriteService
✅ **getUserBookings()** method added for fetching user's bookings
✅ **SuccessModal** component created with animation
✅ **Booking summary screen** updated to:
   - Create booking in Appwrite
   - Show loading state
   - Display success modal
   - Reset booking store after success
   - Navigate to home after booking

## Next Steps:

1. Go to your Appwrite console
2. Navigate to your database (trimmr-db)
3. Create a new collection called "bookings"
4. Add all the attributes listed above
5. Create the indexes
6. Set the permissions
7. Test the booking flow in your app!
