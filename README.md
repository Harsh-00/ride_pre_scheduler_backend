# Corporate Ride Scheduling System

##  Problem Statement
Rapido is launching a portal for corporate clients to pre-schedule daily rides for their employees.
You are tasked with designing and implementing a system to support ride booking, management,
and approval workflows.

## Project
- **Explanation Video:** [Watch here](https://youtu.be/oj6ClLw5h28)
- **Hosted on Railway:** [Live Backend](https://ridepreschedulerbackend-production.up.railway.app)
- **Base URL:**  https://ridepreschedulerbackend-production.up.railway.app
- **Postman Collection:**
  - [Open in Postman Workspace](https://web.postman.co/workspace/My-Workspace~bbabd945-af76-441c-87f0-11754a03d297/collection/29814775-efd5b0d7-68a7-4168-91ba-dc78d3463c51?action=share&source=copy-link&creator=29814775)
  - [Download Corporate_Ride_Scheduler.postman_collection](./Corporate_Ride_Scheduler.postman_collection.json)




## Run Locally

Clone the project

```bash
  git clone https://github.com/Harsh-00/ride_pre_scheduler_backend.git
```

Go to the project directory

```bash
  cd ride_pre_scheduler_backend
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```
---
 


## Approach
- Initially, for any corporate organization, there exist 1 admin (Stakeholder) in my database. ( Needed such that he/she can crete entries for their employees)
- Admin can create users having role as "user" or "admin".
- Token generation is done while creation of user and saved within the user's data entry.

## User Management

### 1. Authenticate User
- **Endpoint**: `/api/v1/users/authenticate`
- **Payload**:
  ```json
  {
    "email": "john@example.com",
    "password": "john1234"
  }
  ```
- **Method**: POST
- **Access**: Public
- **What it does**: Authenticates a user and returns a token.

### 2. Create User (Admin Only)
- **Endpoint**: `/api/v1/users`
- **Payload**:
  ```json
  {
    "name": "John Doe",
    "email": "john1.admin@example.com",
    "password": "john12345",
    "role": "admin",
    "employeeId": "ADM005"
  }
  ```
- **Method**: POST
- **Access**: Admin
- **What it does**: Creates a new user with a specified role.

### 3. Get My Profile
- **Endpoint**: `/api/v1/users/me`
- **Payload**: None
- **Method**: GET
- **Access**: Authenticated User
- **What it does**: Fetches the currently logged-in user's profile.

### 4. Update My Profile
- **Endpoint**: `/api/v1/users/me`
- **Payload**:
  ```json
  {
    "name": "John Updated-2",
    "email": "john.updated@example.com"
  }
  ```
- **Method**: PUT
- **Access**: Authenticated User
- **What it does**: Updates current user's profile. User cannot update their token, role, employee_Id

### 5. Update User by ID (Admin Only) (BONUS)
- **Endpoint**: `/api/v1/users/:userId`
- **Payload**:
  ```json
  {
    "name": "John Updated-3",
    "employeeId": "EMP-004",
    "role": "admin"
  }
  ```
- **Method**: PUT
- **Access**: Admin
- **What it does**: Updates another user's profile based on their ID. (No restrictions)

---

## Ride Booking

### 1. Create Ride
- **Endpoint**: `/api/v1/rides`
- **Payload**:
  ```json
  {
    "pickup": "Marathalli",
    "dropoff": "HSR Layout",
    "datetime": "2025-08-07T12:00:00Z"
  }
  ```
- **Method**: POST
- **Access**: Authenticated User
- **What it does**: Books a new ride for the user.

### 2. Get My Rides
- **Endpoint**: `/api/v1/rides`
- **Payload**: None
- **Method**: GET
- **Access**: Authenticated User
- **What it does**: Fetches all rides of the logged-in user.

### 3. Get Ride Detail
- **Endpoint**: `/api/v1/rides/:rideId`
- **Payload**: None
- **Method**: GET
- **Access**: Authenticated User
- **What it does**: Fetches detailed information for a specific ride.

### 4. Cancel Ride
- **Endpoint**: `/api/v1/rides/:rideId/cancel`
- **Payload**: None
- **Method**: POST
- **Access**: Authenticated User
- **What it does**: Cancels a specific ride.

---

## Admin APIs

### 1. View All Rides
- **Endpoint**: `/api/v1/admin/rides`
- **Payload**: None
- **Method**: GET
- **Access**: Admin
- **What it does**: Retrieves all ride bookings.

### 2. View All Rides by Date
- **Endpoint**: `/api/v1/admin/rides?date=YYYY-MM-DD&status={status}&user={user_id}`
- **Payload**: None
- **Method**: GET
- **Access**: Admin
- **What it does**: Retrieves all rides for a specific date.

### 3. Approve/Reject Ride
- **Endpoint**: `/api/v1/admin/rides/:rideId`
- **Payload**:
  ```json
  {
    "action": "Rejected"
  }
  ```
- **Method**: PATCH
- **Access**: Admin
- **What it does**: Approves or rejects a ride booking.

### 4. Get Ride Analytics
- **Endpoint**: `/api/v1/admin/analytics`
- **Payload**: None
- **Method**: GET
- **Access**: Admin
- **What it does**: Returns analytics for rides.
- **Response**: 
  ```json 
  {
    "success": true,
    "message": "Analytics fetched successfully",
    "data": {
        "summary": {
            "totalRides": 5,
            "uniqueUsers": 1,
            "cancelledRides": 2,
            "approvedRides": 0,
            "approvalRate": 0,
            "avgRidesPerUser": 5
        },
        "dailyStats": [.....],
        "topUsers": [.....],
        "ridesPerUserPerDay": [....],
  }
  ```

## Database Design

The backend database for the Corporate Ride Scheduler uses three core models:

### 1. **User**
Represents both employees and admins.

| Field       | Type       | Description                  |
|-------------|------------|------------------------------|
| employeeId  | String     | Unique ID for employee       |
| name        | String     | Full name (max 100 chars)    |
| email       | String     | Unique email (lowercased)    |
| password    | String     | Hashed password              |
| role        | String     | Enum: 'user' or 'admin'      |
| token       | String     | Unique authentication token  |
| timestamps  | Date       | CreatedAt, UpdatedAt         |

---

### 2. **Ride**
Represents a scheduled ride requested by a user.

| Field     | Type     | Description                        |
|-----------|----------|------------------------------------|
| user      | ObjectId | Ref to User (who booked the ride)  |
| pickup    | String   | Pickup location                    |
| dropoff   | String   | Dropoff location                   |
| datetime  | Date     | Scheduled date and time            |
| status    | String   | Enum: Pending, Approved, Rejected, Cancelled |
| timestamps| Date     | CreatedAt, UpdatedAt               |

---

### 3. **AdminAction**
Represents actions (approve/reject) taken by admins on rides.

| Field     | Type     | Description                     |
|-----------|----------|---------------------------------|
| ride      | ObjectId | Ref to Ride                     |
| admin     | ObjectId | Ref to User (admin only)        |
| action    | String   | Enum: Approved, Rejected        |
| timestamp | Date     | Time of the action              |

---

### Relationships
- One **User** can book multiple **Rides**.
- One **Admin** (a type of User) can take multiple **AdminActions**.
- One **AdminAction** is associated with one **Ride** and one **Admin**.

