# HBnB - Airbnb-like Application (Phase 1)

RESTful API built with Flask for managing an Airbnb-style rental platform.  
Project structured in clean layers (API / Services-Facade / Models / Persistence).

## Current phase:  
- Modular structure + proper Python packaging  
- **In-memory** repository (InMemoryRepository)  
- **Facade** pattern (HBnBFacade)  
- Versioned API endpoints (`/api/v1/`) — skeleton only for now  
- Basic Flask setup + automatic Swagger documentation

## Project Structure
```bash
hbnb/
├── app/                        → Main application source code
│   ├── init.py             	→ Flask app + RESTx API creation
│   ├── api/                    → API endpoints (organized by version)
│   │   ├── init.py
│   │   └── v1/                 → API version 1
│   │       ├── init.py
│   │       ├── users.py        → /users endpoints
│   │       ├── places.py       → /places endpoints
│   │       ├── reviews.py      → /reviews endpoints
│   │       └── amenities.py    → /amenities endpoints
│   ├── models/                 → Business/domain entities
│   │   ├── init.py
│   │   ├── user.py
│   │   ├── place.py
│   │   ├── review.py
│   │   └── amenity.py
│   ├── services/               → Business logic layer
│   │   ├── init.py         	→ Global facade instance (singleton)
│   │   └── facade.py           → HBnBFacade – single entry point for operations
│   └── persistence/            → Data persistence layer
│       ├── init.py
│       └── repository.py       → Repository interface + InMemory implementation
├── run.py                      → Main entry point to start the application
├── config.py                   → Configuration (dev, test, prod, env variables)
├── requirements.txt            → Python dependencies
└── README.md                   → This file
```
## Prerequisites

- Python 3.9+ (tested with 3.10–3.12)
- pip
- (recommended) virtual environment

## Installation

# 1. Clone the repository (or navigate to your project folder)
```bash

git clone <your-repo-url>
cd hbnb

```
# 2. Create and activate a virtual environment (strongly recommended)
```bash

python -m venv venv
source venv/bin/activate      # Linux / macOS
# or
venv\Scripts\activate         # Windows

```
# 3. Install dependencies
```bash

pip install -r requirements.txt

```

## Main Dependencies (requirements.txt)

flask
flask-restx

## Running the Application

# From the project root
python run.py

The API will be available at:
→ http://127.0.0.1:5000/
→ Interactive Swagger documentation: http://127.0.0.1:5000/api/v1/

## Current Project Status (as of February 2026)

Clean layered architecture in place
Functional in-memory repository
HBnBFacade created (singleton via app.services)
RESTx API skeleton with namespaces ready for implementation
Endpoints not yet implemented (placeholders only)

Planned next steps:

Full implementation of models (User, Place, Review, Amenity)
Input data validation
Relationship handling (reviews ↔ places, amenities ↔ places…)
Gradual replacement of in-memory repository with SQLAlchemy

## Useful Commands
Bash# Quick restart
python run.py

# Exit the virtual environment when finished
deactivate


# Business Logic Layer
The Business Logic layer represents the core domain of the application.
It contains the main entities and defines how they interact with each other.

### Location in project:
```bash
app/models/
```
Each entity inherits from BaseModel, which provides:
- id
- created_at
- updated_at
- save()
- update(data_dict)


## User
Represents a platform user.
### Attributes
- id
- first_name
- last_name
- email
- is_admin
- places (list of owned places)
- reviews (list of written reviews)

### Responsibilities
- Own places
- Write reviews
- Validate personal information

#### Example
```bash
from app.models.user import User

user = User(
    first_name="John",
    last_name="Doe",
    email="john.doe@example.com"
)

print(user.first_name)  # John
```


## 🏠 Place
Represents a rental property.

### Attributes
- id
- title
- description
- price
- latitude
- longitude
- owner (User instance)
- reviews (list of Review objects)
- amenities (list of Amenity objects)

### Responsibilities
- Belongs to a User (owner)
- Stores reviews
- Stores amenities
- Validates price and geolocation

#### Example
```bash
from app.models.place import Place

place = Place(
    title="Cozy Apartment",
    description="A nice place to stay",
    price=120,
    latitude=48.8566,
    longitude=2.3522,
    owner=user
)

print(place.title)  # Cozy Apartment
```


## ⭐ Review
Represents a review written by a user for a place.

### Attributes
- id
- text
- rating (0–5)
- user (User instance)
- place (Place instance)

### Responsibilities
- Validate rating range
- Link a user to a place
- Provide feedback about a place

#### Example
```bash
from app.models.review import Review

review = Review(
    text="Amazing stay!",
    rating=5,
    user=user,
    place=place
)

print(review.rating)  # 5
```


## 🛜 Amenity
Represents a feature of a place (Wi-Fi, Pool, Parking, etc.).

### Attributes
- id
- name

### Responsibilities
- Describe facilities available in a place

#### Example
```bash
from app.models.amenity import Amenity

wifi = Amenity(name="Wi-Fi")
place.add_amenity(wifi)
```


## 🔗 Entity Relationships
The domain model includes the following relationships:

- User → Place
One user can own multiple places.

- User → Review
One user can write multiple reviews.

- Place → Review
One place can have multiple reviews.

- Place → Amenity
One place can have multiple amenities.

These relationships are managed through object references and list attributes inside each entity.


## 🏗 Business Logic Design Principles
- Encapsulation through property getters/setters
- Strong validation at entity level
- Clear separation between:
- - Models (domain logic)
- - Services (Facade layer)
- - Persistence (Repository layer)
- - API layer (Flask endpoints)

The Business Logic layer is fully independent from Flask and can be tested separately using unit tests.


## 🧪 Example of Independent Testing
```bash
from app.models.user import User
from app.models.place import Place
from app.models.review import Review

user = User("Alice", "Smith", "alice@example.com")
place = Place("Beach House", "Sea view", 200, 10.0, 20.0, user)
review = Review("Excellent!", 5, place, user)

assert len(place.reviews) == 1
assert len(user.reviews) == 1
```

## Authors:
- Zimmermann Ethane
- Callejo Esteban
- Hinlang Julien
