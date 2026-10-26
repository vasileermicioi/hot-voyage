# tours-catalog

## Purpose

Public tour discovery and inquiry for Hot Voyage visitors — browsing published tours, recognizing hot offers with urgency, viewing detail with imagery, and submitting a payment-free inquiry.

## Requirements

### Requirement: Browse tours

The system SHALL list published tours with search, destination, price, and hot-only filters plus sorting and pagination.

#### Scenario: Filter hot only

- **WHEN** a visitor selects hot-only on `/tours`
- **THEN** only published hot offers appear ordered by soonest-ending or biggest discount per documented sort

#### Scenario: Empty hot window

- **WHEN** no hot offers are active
- **THEN** the page shows an empty state and offers browsing all tours

#### Scenario: Paginated filtered list

- **WHEN** a visitor combines search, destination, or max-price filters with a sort and page
- **THEN** the system returns the matching page with total count and caps page size

### Requirement: Hot offer urgency

The system SHALL badge active hot offers with discount, countdown to `endsAt`, and seats-left urgency, and SHALL NOT badge expired, archived, or sold-out tours as hot.

#### Scenario: Countdown visible

- **WHEN** a visitor opens a hot tour detail
- **THEN** they see discount pct, time remaining, and seats-left messaging consistent with server data

#### Scenario: Expired or sold-out not hot

- **WHEN** a tour is expired, archived, sold-out (`seatsLeft <= 0`), or outside its hot window
- **THEN** it appears without hot badge and without countdown, showing "ended" or "full" where applicable

### Requirement: Tour detail and inquiry

The system SHALL provide a tour detail with WebP gallery, itinerary, price box, related tours, and an inquiry form that creates an inquiry without payment.

#### Scenario: Detail renders gallery and price box

- **WHEN** a visitor opens `/tours/<slug>` for a published tour
- **THEN** they see a WebP `srcset` gallery, itinerary, includes/excludes, price box with discount, and related tours

#### Scenario: Submit inquiry

- **WHEN** a visitor submits a valid inquiry
- **THEN** the system stores it and shows confirmation; invalid input returns field errors without storing

#### Scenario: Inquiry spam rejected

- **WHEN** a submission fails validation, trips the honeypot, or exceeds the rate limit
- **THEN** the system rejects it with a field or rate error and stores nothing
