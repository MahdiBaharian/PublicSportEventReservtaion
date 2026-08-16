# Sports Ticket Reservation System

## Overview
<img width="1920" height="925" alt="dashbord" src="https://github.com/user-attachments/assets/c8eed3ed-7953-4268-8671-be8662a5a3f8" />

This project is a database-backed sports ticket reservation and
purchasing system. The system allows users to register and authenticate,
search for sporting tickets, view ticket details, create temporary
reservations, complete local payments, view booking history, cancel
tickets, check cancellation penalties, and report ticket-related issues.

A support/admin role is also provided for reviewing reports and
cancelled reservations and for updating reservation or report status.

The project follows the four mandatory phases defined in the course
specification:

1.  ER Diagram and Database Design
2.  Database Tables and Required SQL Queries
3.  Server-side Implementation and APIs
4.  Client-side UI and Elasticsearch Search

The course specification also requires a comprehensive `README.md`
containing project setup instructions, database/Redis configuration, a
complete API list with inputs and outputs, and API testing instructions.
The backend must communicate with the database without using an ORM, and
Redis is required for OTP storage and frequently accessed cached data.

------------------------------------------------------------------------

## Features

### Authentication and Accounts

-   Email/password login
-   Email OTP verification
-   Two-step signup with email verification
-   JWT access and refresh tokens
-   Hashed password storage
-   Password recovery using OTP
-   User profile updates

### Ticket Discovery
<img width="1920" height="922" alt="search_tickets" src="https://github.com/user-attachments/assets/9b7db49e-1898-44d3-b60c-bf31ed50fef5" />

-   Search available tickets
-   Filter by sport
-   Filter by city
-   Filter by ticket category
-   Search by participating team
-   Filter by minimum and maximum price
-   Retrieve detailed ticket and match information
-   Retrieve available cities and venues
-   Cache repeated search requests

### Reservations and Payments
<img width="1920" height="917" alt="payment" src="https://github.com/user-attachments/assets/24a67ea1-b10c-4ae8-81ad-ace089955b64" />

-   Temporary ticket reservations
-   Reservation quantity and seat information
-   Ten-minute payment window
-   Local/simulated payment processing
-   Unique payment tracking codes
-   Booking history
-   Ticket cancellation
-   Capacity restoration after cancellation
-   Cancellation penalty calculation
-   Refund amount calculation

### Reports and Support

-   Submit ticket-related reports
-   Review reports
-   Update report status and reply
-   Review cancelled reservations
-   Update reservation status
-   Admin/support access control

------------------------------------------------------------------------

## Architecture

The backend is implemented using Django REST Framework.

The backend intentionally uses direct SQL queries through Django's
database connection instead of an ORM. This follows the project
requirement that SQL queries be written directly.

``` text
                    ┌──────────────────────┐
                    │      React Client    │
                    └──────────┬───────────┘
                               │ JSON / REST
                               ▼
                    ┌──────────────────────┐
                    │    Django REST API   │
                    └──────┬─────────┬─────┘
                           │         │
                Direct SQL │         │ Cache / OTP
                           ▼         ▼
                    ┌──────────┐  ┌──────────┐
                    │PostgreSQL│  │  Redis   │
                    └──────────┘  └──────────┘
```

The relational database is the source of truth for users, tickets,
reservations, payments, and reports. Redis is used for short-lived OTP
data and frequently requested data such as search results and location
information.

The course specification requires Redis to be synchronized with database
changes and requires cache invalidation when database-backed information
is updated.

------------------------------------------------------------------------

## Tech Stack

  Layer               Technology
  ------------------- --------------------------
  Backend             Python / Django
  API                 Django REST Framework
  Database            PostgreSQL
  Cache               Redis
  Authentication      JWT
  Password Security   Django password hashing
  Client              Web UI
  Search              Elasticsearch in Phase 4
  API Testing         Postman / cURL
  Containerization    Docker

------------------------------------------------------------------------

# Phase 1 --- ER Diagram and Database Design

The relational database is centered around six main entities:

``` text
Users
Tickets
MatchDetails
Reservations
Payments
Reports
```

### Main relationships

``` text
Users (1) ─────────── (N) Reservations

Tickets (1) ─────────── (N) Reservations

Reservations (1) ─────── (N) Payments

Reservations (1) ─────── (N) Reports

Tickets (1) ───────── (0..1) MatchDetails
```

The database uses primary keys and foreign keys to maintain referential
integrity.

------------------------------------------------------------------------

# Phase 2 --- Database and SQL
<img width="1337" height="871" alt="erd" src="https://github.com/user-attachments/assets/e107e4ca-8346-42d2-8ce7-3f3fcfc6b2d9" />

The SQL implementation contains the database schema and the SQL
operations required by the project.

The database includes:

-   Table creation
-   Primary keys
-   Foreign keys
-   Unique constraints
-   Referential actions
-   Initial/sample data
-   Required queries
-   Indexes
-   Stored procedures/functions where implemented

The backend APIs in Phase 3 execute SQL directly against PostgreSQL.

------------------------------------------------------------------------

# Phase 3 --- Server-side Implementation

The third phase requires the backend to communicate with the database
and expose the required functionality through APIs.

The course specification requires:

-   All required APIs to be implemented
-   Direct SQL instead of ORM
-   Redis for OTP and frequently accessed data
-   Single Responsibility for each API
-   JSON request/response handling
-   API testing with Postman or cURL
-   Documentation of all APIs, inputs, outputs, and setup instructions

The current backend implements the required API areas including
authentication, signup, profile management, locations, ticket
search/details, reservations, payments, cancellation, reports, booking
history, and support management.

------------------------------------------------------------------------

# API Reference

All API responses are returned as JSON.

Authenticated APIs require a valid access token. The user ID is
extracted from the request token by the backend authentication utility.

``` http
Authorization: Bearer <access_token>
```

> The exact URL path for each function depends on the project's Django
> `urls.py` configuration. The API names below correspond directly to
> the implemented backend functions.

------------------------------------------------------------------------

## 1. Login
<img width="1920" height="920" alt="login" src="https://github.com/user-attachments/assets/4893fbc2-d226-422e-9abe-222579692c51" />

### Function

``` text
login
```

### Method

``` http
POST
```

### Authentication

Not required.

### Request Body

``` json
{
  "identifier": "user@example.com",
  "password": "password"
}
```

`identifier` can contain either the user's email address or phone
number.

### Success Response

``` json
{
  "message": "ورود موفقیت‌آمیز.",
  "access": "<access_token>",
  "refresh": "<refresh_token>"
}
```

### Status Codes

  Status   Meaning
  -------- ---------------------------------------
  200      Login successful
  401      Invalid credentials or user not found

------------------------------------------------------------------------

## 2. Signup

### Function

``` text
signup
```

### Method

``` http
POST
```

### Authentication

Not required.

### Request Body

``` json
{
  "first_name": "Ali",
  "last_name": "Ahmadi",
  "username": "ali123",
  "email": "ali@example.com",
  "phone_number": "09120000000",
  "password": "StrongPassword"
}
```

### Behavior

The API:

1.  Checks whether the email or username already exists.
2.  Hashes the password.
3.  Temporarily stores the signup data in Redis.
4.  Generates an OTP.
5.  Stores the OTP in Redis with a 120-second TTL.
6.  Sends the OTP by email.

The account is created after OTP verification.

### Success Response

``` json
{
  "message": "کد تایید به ایمیل شما ارسال شد. لطفا برای تکمیل ثبت‌نام آن را وارد کنید."
}
```

------------------------------------------------------------------------

## 3. Send OTP

### Function

``` text
send_otp
```

### Method

``` http
POST
```

### Authentication

Not required.

### Request Body

``` json
{
  "email": "user@example.com"
}
```

### Behavior

The API checks whether the user exists, generates a six-digit OTP,
stores it in Redis for 120 seconds, and sends it by email.

### Success Response

``` json
{
  "message": "کد تایید ورود به ایمیل شما ارسال شد."
}
```

### Status Codes

  Status   Meaning
  -------- -----------------------
  200      OTP sent
  404      User not found
  500      Email sending failure

------------------------------------------------------------------------

## 4. Verify OTP

### Function

``` text
verify_otp
```

### Method

``` http
POST
```

### Authentication

Not required.

### Request Body --- Signup

``` json
{
  "email": "user@example.com",
  "otp": "123456",
  "action": "signup"
}
```

### Request Body --- Login

``` json
{
  "email": "user@example.com",
  "otp": "123456",
  "action": "login"
}
```

### Behavior

For signup, the cached signup information is inserted into PostgreSQL
and the new user receives JWT tokens.

For login, the API validates the email and generates JWT tokens.

### Success Response

``` json
{
  "message": "ثبت‌نام با موفقیت انجام شد.",
  "access": "<access_token>",
  "refresh": "<refresh_token>"
}
```

------------------------------------------------------------------------

## 5. Forget Password

### Function

``` text
forget_password
```

### Method

``` http
POST
```

### Authentication

Not required.

### Request Body

``` json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "NewStrongPassword"
}
```

### Behavior

The API validates the OTP stored in Redis and updates the user's
password with a securely hashed value.

### Success Response

``` json
{
  "message": "رمز عبور با موفقیت بروزرسانی شد."
}
```

------------------------------------------------------------------------

## 6. Update Profile
<img width="1920" height="922" alt="profile" src="https://github.com/user-attachments/assets/2810acf4-e169-4ea4-9264-448a8fecb36e" />

### Function

``` text
update_profile
```

### Methods

``` http
PUT
PATCH
```

### Authentication

Required.

### Request Body

``` json
{
  "first_name": "Ali",
  "last_name": "Ahmadi",
  "phone_number": "09120000000",
  "city": "Tehran"
}
```

All supported fields are optional for partial updates.

### Behavior

The API updates the user's profile in PostgreSQL and refreshes the
corresponding Redis profile cache.

### Success Response

``` json
{
  "message": "پروفایل با موفقیت بروزرسانی شد.",
  "data": {
    "user_id": 1,
    "first_name": "Ali",
    "last_name": "Ahmadi",
    "username": "ali123",
    "email": "ali@example.com",
    "phone_number": "09120000000",
    "city": "Tehran"
  }
}
```

------------------------------------------------------------------------

## 7. Get Locations

### Function

``` text
get_locations
```

### Method

``` http
GET
```

### Authentication

Not required.

### Response

``` json
{
  "Tehran": [
    "Azadi Stadium",
    "Imam Khomeini Stadium"
  ],
  "Shiraz": [
    "Hafezieh Stadium"
  ]
}
```

### Caching

The result is cached in Redis for 24 hours.

------------------------------------------------------------------------

## 8. Search Tickets

### Function

``` text
search_tickets
```

### Method

``` http
GET
```

### Authentication

Not required.

### Supported Query Parameters

  Parameter      Description
  -------------- ----------------------------
  `sport_type`   Sport type
  `city`         Venue city
  `category`     Ticket category
  `team`         Searches home or away team
  `min_price`    Minimum ticket price
  `max_price`    Maximum ticket price

### Example

``` http
GET /api/.../?sport_type=football&city=Tehran&category=VIP&team=Esteghlal&min_price=100000&max_price=500000
```

### Response

``` json
[
  {
    "ticket_id": 1,
    "sport_type": "football",
    "home_team": "Team A",
    "away_team": "Team B",
    "ticket_date_time": "2026-05-10T18:00:00",
    "venue_city": "Tehran",
    "price": 250000,
    "category": "VIP",
    "remaining_capacity": 120,
    "venue_name": "Stadium",
    "tournament_name": "League"
  }
]
```

### Caching

Search results are cached in Redis for 5 minutes.

The cache key is generated from the complete set of query parameters.

------------------------------------------------------------------------

## 9. Get Ticket Details

### Function

``` text
get_ticket_details
```

### Method

``` http
GET
```

### Path Parameter

``` text
ticket_id
```

### Example

``` http
GET /api/.../<ticket_id>/
```

### Response

The response includes:

-   Ticket ID
-   Sport
-   Home team
-   Away team
-   Match date/time
-   City
-   Price
-   Remaining capacity
-   Category
-   Organizer
-   Tournament
-   Venue
-   Facilities

### Example Response

``` json
{
  "ticket_id": 1,
  "sport_type": "football",
  "home_team": "Team A",
  "away_team": "Team B",
  "ticket_date_time": "2026-05-10T18:00:00",
  "venue_city": "Tehran",
  "price": 250000,
  "remaining_capacity": 120,
  "category": "VIP",
  "organizer": "Organizer",
  "tournament_name": "League",
  "venue_name": "Stadium",
  "facilities": "Parking, Food Court"
}
```

------------------------------------------------------------------------

## 10. Reserve Ticket

### Function

``` text
reserve_ticket
```

### Methods

``` http
GET
POST
```

### Authentication

Required.

### POST Request

``` json
{
  "ticket_id": 1,
  "quantity": 2,
  "seat_info": "A-12,A-13"
}
```

`quantity` defaults to `1`.

### Behavior

The API checks remaining capacity and creates a temporary reservation
with status:

``` text
reserved
```

The reservation is intended to have a ten-minute payment window.

### Success Response

``` json
{
  "message": "رزرو موقت انجام شد. ۱۰ دقیقه برای پرداخت فرصت دارید.",
  "reservation_id": 15,
  "reserved_at": "2026-05-01T12:00:00"
}
```

### GET

Returns reservations belonging to the authenticated user.

------------------------------------------------------------------------

## 11. Payment

### Function

``` text
payment_for_ticket
```

### Method

``` http
POST
```

### Authentication

Required.

### Request Body

``` json
{
  "reservation_id": 15,
  "method": "card"
}
```

### Behavior

The API:

1.  Checks reservation ownership.
2.  Checks the ten-minute payment window.
3.  Calculates the total amount.
4.  Creates a payment record.
5.  Generates a unique tracking code.
6.  Changes reservation status to `paid`.
7.  Updates remaining ticket capacity.

### Success Response

``` json
{
  "message": "پرداخت با موفقیت انجام شد و بلیت نهایی صادر گردید.",
  "tracking_code": "<tracking_code>",
  "amount_paid": 500000
}
```

The payment is local/simulated and does not depend on an external
banking gateway.

------------------------------------------------------------------------

## 12. Check Cancellation Penalty

### Function

``` text
check_cancellation_penalty
```

### Methods

``` http
GET
POST
```

### Authentication

Required.

### GET

Returns the cancellation calculation before cancellation.

### Response

``` json
{
  "hours_left_to_match": 30.5,
  "penalty_percentage": 10,
  "penalty_amount": 50000,
  "refund_amount": 450000
}
```

### Current Cancellation Rules

``` text
More than 24 hours before match:
    10% penalty

24 hours or less before match:
    50% penalty

Match started/passed:
    Cancellation is rejected
```

### POST

Confirms the cancellation and restores the ticket capacity.

------------------------------------------------------------------------

## 13. Cancel Ticket and Refund

### Function

``` text
cancel_ticket_and_refund
```

### Method

``` http
POST
```

### Authentication

Required.

### Path Parameter

``` text
reservation_id
```

### Behavior

The API:

1.  Validates ownership.
2.  Rejects an already cancelled reservation.
3.  Changes the reservation status to `cancelled`.
4.  Restores ticket capacity.
5.  Invalidates the user's booking cache.

### Success Response

``` json
{
  "message": "Ticket cancelled successfully and refund initiated."
}
```

------------------------------------------------------------------------

## 14. Get User Bookings

### Function

``` text
get_user_bookings
```

### Method

``` http
GET
```

### Authentication

Required.

### Response

``` json
[
  {
    "reservation_id": 15,
    "quantity": 2,
    "reservation_status": "paid",
    "reserved_at": "2026-05-01T12:00:00",
    "sport_type": "football",
    "home_team": "Team A",
    "away_team": "Team B",
    "ticket_date_time": "2026-05-10T18:00:00",
    "venue_city": "Tehran"
  }
]
```

### Caching

User booking history is cached in Redis for 30 minutes.

The cache is invalidated when a cancellation is performed.

------------------------------------------------------------------------

## 15. Report Ticket Issue

### Function

``` text
report_ticket_issue
```

### Method

``` http
POST
```

### Authentication

Required.

### Path Parameter

``` text
reservation_id
```

### Request Body

``` json
{
  "report_type": "payment_issue",
  "description": "Payment was completed but the ticket status is incorrect."
}
```

### Behavior

The API verifies that the reservation belongs to the authenticated user
and creates a report with:

``` text
report_status = pending
```

### Success Response

``` json
{
  "message": "Report submitted successfully.",
  "report_id": 10
}
```

------------------------------------------------------------------------

## 16. Admin Management

### Function

``` text
admin_management
```

### Methods

``` http
GET
PATCH
```

### Authentication

Required.

### Authorization

Only users with:

``` text
role = admin
```

can access this API.

### GET --- Reports

``` http
?action=reports
```

Returns reports ordered by newest report first.

### GET --- Cancellations

``` http
?action=cancellations
```

Returns cancelled reservations.

### PATCH --- Report

Request:

``` json
{
  "target": "report",
  "id": 10,
  "reply": "The issue has been reviewed.",
  "status": "resolved"
}
```

### PATCH --- Reservation

Request:

``` json
{
  "target": "reservation",
  "id": 15,
  "status": "cancelled"
}
```

### Success Response

``` json
{
  "message": "Update successful"
}
```

### Access Errors

``` text
401 Unauthorized
403 Access denied
404 Record not found
```

------------------------------------------------------------------------

# Redis Usage

Redis is used for short-lived and frequently accessed data as required
by the project specification.

Current Redis usage includes:

  Key Pattern                 Purpose                                    TTL
  --------------------------- ------------------------------ ---------------
  `otp_<email>`               OTP verification                   120 seconds
  `signup_data_<email>`       Temporary signup information       120 seconds
  `tickets_search_<hash>`     Cached ticket search results       300 seconds
  `cities_venues_list`        Cities and venues                86400 seconds
  `user_profile_<user_id>`    Updated profile cache            86400 seconds
  `user_bookings_<user_id>`   Booking history cache             1800 seconds

Cache invalidation is performed when relevant database state changes.

For example, after ticket cancellation:

``` text
PostgreSQL update
      ↓
Ticket capacity restored
      ↓
Reservation cancelled
      ↓
User booking cache deleted
```

------------------------------------------------------------------------

# Security

### Password Hashing

Passwords are not stored as plain text.

The backend uses Django's password hashing utilities:

``` python
make_password(...)
check_password(...)
```

### JWT Authentication

Authenticated requests use access tokens generated by the application's
token utility.

``` http
Authorization: Bearer <access_token>
```

### Role-Based Access

Administrative operations verify the authenticated user's database role
before allowing access.

``` text
role = admin
```

### SQL Injection Protection

SQL queries use parameterized placeholders:

``` python
cursor.execute(
    "SELECT ... WHERE user_id = %s",
    [user_id]
)
```

This prevents user-controlled values from being directly concatenated
into SQL statements.

------------------------------------------------------------------------

# Database Interaction

The backend does not use Django ORM for the project database operations.

Instead, SQL is executed directly using:

``` python
from django.db import connection
```

Example:

``` python
with connection.cursor() as cursor:
    cursor.execute(
        "SELECT ... WHERE user_id = %s;",
        [user_id]
    )
```

This follows the project requirement for direct SQL implementation.

------------------------------------------------------------------------

# API Testing

The project requires all APIs to be tested and their server responses
captured.

APIs can be tested using:

-   Postman
-   cURL
-   Any REST client

### Example --- Login

``` bash
curl -X POST http://localhost:8000/api/...   -H "Content-Type: application/json"   -d '{
    "identifier": "user@example.com",
    "password": "password"
  }'
```

### Example --- Search Tickets

``` bash
curl "http://localhost:8000/api/.../?sport_type=football&city=Tehran&min_price=100000"
```

### Example --- Reserve Ticket

``` bash
curl -X POST http://localhost:8000/api/...   -H "Authorization: Bearer <access_token>"   -H "Content-Type: application/json"   -d '{
    "ticket_id": 1,
    "quantity": 2,
    "seat_info": "A-12,A-13"
  }'
```


### Example --- Payment

``` bash
curl -X POST http://localhost:8000/api/...   -H "Authorization: Bearer <access_token>"   -H "Content-Type: application/json"   -d '{
    "reservation_id": 15,
    "method": "card"
  }'
```

------------------------------------------------------------------------

# Phase 4 --- Client and Elasticsearch

The fourth phase requires a client UI that consumes the backend APIs and
allows users to interact with the system.

The current client includes an authentication interface and is intended
to consume the Phase 3 REST APIs.

The required client flow is:

``` text
Login / Signup
      ↓
Ticket Search
      ↓
Ticket Details
      ↓
Reservation
      ↓
Payment
      ↓
Booking History
      ↓
Cancellation / Report
```

The course specification also requires Elasticsearch in this phase to
improve ticket search performance and reduce pressure on the SQL
database.

The Elasticsearch implementation should:

-   Index ticket and match information
-   Support ticket search
-   Improve filtering/search performance
-   Keep SQL and Elasticsearch data synchronized

------------------------------------------------------------------------

# Docker and Bonus Features

The course specification includes Dockerization as an additional/bonus
requirement.

The expected Docker deliverables include:

-   Backend `Dockerfile`
-   Docker Compose configuration
-   Dockerized database
-   SQL initialization script
-   Ability for the backend to connect to the Dockerized database
-   API testing through the Dockerized backend

Redis can additionally be Dockerized and connected through a Docker
network.

A further bonus phase covers deployment of the backend and database on a
PaaS platform.

------------------------------------------------------------------------

# Project Structure

A recommended repository structure is:

``` text
.
├── backend/
│   ├── api/
│   ├── utils/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── ...
│
├── database/
│   ├── initialization.sql
│   ├── indexes.sql
│   ├── queries.sql
│   └── stored_procedures.sql
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── docs/
│   ├── ERD
│   └── API tests
│
├── docker-compose.yml
└── README.md
```


------------------------------------------------------------------------

# Important Implementation Notes

The following points describe the current implementation and should be
considered when completing the remaining project requirements:

1.  Ticket search currently supports sport, city, category, team,
    minimum price, and maximum price filters.
2.  The project specification also mentions filtering by match date and
    venue; those filters are not present in the provided
    `search_tickets` implementation yet.
3.  The current payment API performs a local/simulated successful
    payment and does not connect to a real banking gateway.
4.  The current `cancel_ticket_and_refund` endpoint reports that a
    refund was initiated, while the separate
    `check_cancellation_penalty` endpoint calculates a penalty and
    refund amount.
5.  OTP data and frequently requested data are stored in Redis with TTL
    values.
6.  The backend uses direct parameterized SQL rather than Django ORM.
7.  The exact HTTP URL paths must match the project's `urls.py`
    configuration.

------------------------------------------------------------------------

# Conclusion

The project implements the main server-side requirements of the sports
ticket reservation system.

The backend provides authentication, OTP verification, profile
management, ticket discovery, ticket details, reservations, payments,
cancellation and refund calculation, booking history, issue reporting,
and administrative management.

PostgreSQL is used as the relational data store, Redis is used for OTP
and caching, and the architecture is prepared for the client and
Elasticsearch requirements of Phase 4.

The README also documents the API inputs, outputs, authentication
requirements, caching behavior, testing approach, and implementation
notes required for the project documentation.
