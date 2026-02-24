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

## Authors:
- Zimmermann Ethane
- Callejo Esteban
- Hinlang Julien