# House Price Prediction

A dynamic property valuation system built with a Node.js Express REST API backend and a responsive glassmorphic frontend. It leverages a Gradient Boosting Regressor model trained on 100,000+ data points to predict residential property prices across 20 major Indian cities.

**Live Demo:** [https://house-price-prediction-wlj9.onrender.com](https://house-price-prediction-wlj9.onrender.com)

---

## Features
- **Accurate Estimations**: Powered by a Gradient Boosting Regressor model with a 0.948 $R^2$ validation score.
- **Pan-India Coverage**: Covers 20 major Indian cities and 262 active micro-markets/localities.
- **Dynamic Dashboards**: Interactive charts for average city rates and feature importance breakdowns.
- **Database Fallback**: Runs on a local JSON file-system engine by default if MySQL is not configured.
- **Seeded Transaction History**: Pre-populated with 8,000+ historical predictions for instant analytic views.

---

## Installation & Setup

Ensure you have **Node.js** and **Python 3** installed.

### 1. Configure the Project
Run the setup script to install Node packages, set up the Python environment, generate the dataset, and train the machine learning model:
```bash
./setup.bat
```

### 2. Start the Server
Start the Express server:
```bash
./start.bat
```
Open your browser and navigate to `http://127.0.0.1:8000`.

---

## Database Configuration

By default, the server runs using a local JSON fallback file. To use a persistent MySQL instance:
1. Open the `.env` file located in the `backend/` directory.
2. Edit your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=house_price_db
   ```
3. Restart the server. It will automatically initialize the database schema and migrate records.

---

## Repository Structure
```
House_Price_Prediction/
├── backend/                  # Express REST API Server
│   ├── config/               # Pricing configurations
│   ├── db/                   # DB migrations and fallback drivers
│   ├── routes/               # API routes
│   └── server.js             # Express app entrypoint
├── frontend/                 # Glassmorphic user interface
│   ├── index.html            # Layout view
│   ├── styles.css            # Stylesheets
│   └── app.js                # Frontend controller logic
├── ml/                       # Machine Learning code
│   ├── dataset_gen.py        # Dataset generation engine
│   ├── train.py              # ML model pipeline
│   ├── predict.py            # Stdin/Stdout inference bridge
│   ├── model.joblib          # Trained pipeline file
│   └── model_metadata.json   # Model performance metadata
├── setup.bat                 # Automation setup script
└── start.bat                 # Server launch script
```
