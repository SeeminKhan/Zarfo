# Zarfo – AI Powered Food Waste Reduction Platform

**Zarfo** is an AI-powered platform that reduces food waste from hotels and restaurants by deciding whether surplus food should be **sold at a discounted price** or **donated to NGOs and shelters** before expiry. The system combines **Machine Learning, dynamic pricing, and food redistribution** to ensure surplus food is utilized efficiently.

## Problem Statement

Restaurants generate large amounts of surplus food daily which often goes to waste due to:

* Lack of demand prediction
* No pricing strategy for near-expiry food
* Poor coordination with donation networks

**Zarfo solves this using AI-based decision making and automated redistribution.**

## Key Features

### AI Decision System

Predicts whether food should be:

* **SELL** (discounted price)
* **DONATE** (to NGOs or shelters)
  based on expiry time, demand probability, quantity, and price.

### Dynamic Pricing

Food prices **automatically decrease as expiry approaches** to increase chances of selling.

| Time Left | Price |
| --------- | ----- |
| 3 hours   | ₹100  |
| 2 hours   | ₹80   |
| 1 hour    | ₹50   |

### Food Lifecycle Monitoring

An AI agent continuously monitors items and updates decisions:
`SELL → PRICE REDUCTION → DONATE`

### Donation Network

Unsold food is redirected to:

* NGOs
* Orphanages
* Old-age homes
* Food shelters

## System Architecture

```
Frontend (React + Vite)
        |
Node.js Express Backend
        |
FastAPI ML Service
        |
MongoDB Database
```

## Tech Stack

* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** Node.js, Express.js
* **AI / ML:** Python, FastAPI, Scikit-learn, RandomForest Pandas, NumPy
* **Database:** MongoDB

## Machine Learning Models

### Food Decision Model (Classification)

Predicts whether food should be **SELL** or **DONATE**.

Inputs:
* Shelf Life
* Time Left
* Quantity
* Original Price
* Food Category
* Demand Probability

Output:

```
SELL or DONATE
```

### Dynamic Price Model (Regression)

If the item is **SELL**, the model predicts the **optimal discounted price**.

Inputs:
* Time Left
* Shelf Life
* Demand Probability
* Quantity
* Original Price

Output:

```
Suggested Discounted Price
```

## Dynamic Pricing Logic

```
life_ratio = time_left / total_shelf_life
new_price = original_price * life_ratio
```

## Business Rule

Certain rules override ML predictions:

```
If time_left <= 2.5 hours:
decision = DONATE
```

## Future Improvements

* Route optimization for food donation
* Demand prediction using historical sales
* Reinforcement learning for pricing
* Mobile app for NGOs and volunteers
* Google Maps API integration

## Installation

Clone repository:

```
git clone https://github.com/farhat-1203/zarfo.git
```

Backend:

```
cd backend
npm install
npm start
```

ML Service:

```
cd models
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:

```
cd frontend
npm install
npm run dev
```
