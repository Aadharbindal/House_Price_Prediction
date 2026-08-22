<div align="center">

# 🏘️ House Price Prediction

### ML-powered property valuation across 20 Indian cities

A Gradient Boosting model behind a Node.js REST API, estimating residential
property prices from location, size, condition and connectivity.

<br>

<p>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white&style=for-the-badge" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white&style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white&style=for-the-badge" alt="Python" />
  <img src="https://img.shields.io/badge/Scikit--Learn-1.5-F7931E?logo=scikit-learn&logoColor=white&style=for-the-badge" alt="Scikit-Learn" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white&style=for-the-badge" alt="MySQL" />
</p>

<h3><a href="https://house-price-prediction-w1j9.onrender.com"><b>Try the live app &rarr;</b></a></h3>

</div>

<br />

---

## 📊 Model Performance

The estimator is a Gradient Boosting Regressor trained on a generated dataset of
Indian residential listings.

| Metric | Value | Reading |
| :--- | :--- | :--- |
| **R² (validation)** | `0.948` | The model accounts for ~95% of the variance in price |
| **MAE** | `₹22.3 L` | Typical miss on an individual property |
| **RMSE** | `₹41.6 L` | Well above MAE, so a minority of large errors dominate — expected where a few luxury properties sit far above the median |

### What actually drives the estimate

Feature importance, grouped:

| Group | Share |
| :--- | ---: |
| Location (city & locality) | **59.2%** |
| Size & BHK | **31.3%** |
| Amenities | 4.6% |
| Age & connectivity | 2.5% |
| Property type | 2.0% |
| Furnishing | 0.4% |

Location and size together explain over 90% of the prediction, which matches how
Indian residential pricing behaves — the same flat in two localities is two
different assets. Furnishing barely moves the number.

---

## 🏗️ How it fits together

```
Browser  ──►  Express API  ──►  Python inference  ──►  model.joblib
              (Node.js)         (child_process)        (Gradient Boosting)
                   │
                   ▼
              MySQL, or a JSON
              fallback if unconfigured
```

Express owns the HTTP layer, serves the frontend as static files, and shells out
to Python only for inference. Keeping the model in Python means training and
serving share one scikit-learn pipeline, so features are transformed identically
in both — the usual source of silent drift when a model is reimplemented in the
serving language.

**The database is optional.** With no MySQL credentials configured the server
falls back to a local JSON store, so the project runs immediately after cloning.
Configure MySQL when history and analytics need to persist properly.

---

## ⚡ Features

- **Pan-India coverage** — 20 cities and 262 localities, each with its own rate basis
- **Instant valuation** — property attributes in, price estimate out
- **Analytics dashboards** — average city rates and feature-importance breakdowns
- **Prediction history** — seeded with 8,000+ records so the analytics views have something to show on first run
- **Feedback capture** — users can rate an estimate against what they believe the property is worth
- **Graceful degradation** — no database, no problem; the JSON fallback keeps everything working

---

## 🚀 Running it locally

Requires **Node.js 18+** and **Python 3.10+**.

### 1. Setup

Installs Node packages and the pinned Python dependencies, creates `backend/.env`
from the example, and trains the model if `ml/model.joblib` is missing:

```bash
scripts\setup.bat
```

### 2. Start

```bash
scripts\start.bat
```

Then open **http://127.0.0.1:8000**.

Both scripts anchor themselves to the repository root, so they work whether you
double-click them or run them from another directory.

---

## 🗄️ Database configuration

The server starts on a JSON fallback. To use MySQL instead, edit
`backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=house_price_db
```

Restart the server — it initialises the schema and migrates existing records on
boot.

---

## 🔌 API

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service status and which datastore is active |
| `GET` | `/api/cities` | Supported cities and their localities |
| `POST` | `/api/predict` | Estimate a price from property attributes |
| `GET` | `/api/history` | Past predictions |
| `POST` | `/api/feedback` | Submit feedback on an estimate |
| `GET` | `/api/analytics` | City rate averages and feature importance |

---

## 📁 Repository structure

```
House_Price_Prediction/
├── backend/                # Express REST API
│   ├── config/             # Per-city pricing configuration
│   ├── db/                 # Connection, schema, JSON fallback driver
│   ├── routes/             # API route handlers
│   └── server.js           # App entrypoint; also serves ../frontend
├── frontend/               # Static UI, served by Express
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── ml/                     # Model training and inference
│   ├── dataset_gen.py      # Synthetic dataset generation
│   ├── train.py            # Training pipeline
│   ├── predict.py          # stdin/stdout inference bridge
│   ├── model.joblib        # Trained pipeline
│   ├── model_metadata.json # Scores and feature importance
│   └── requirements.txt    # Pinned Python dependencies
├── scripts/                # Windows setup and launch scripts
└── render.yaml             # Deployment specification
```

---

## ☁️ Deployment

Deployed as a single Render web service: Express serves both the API and the
frontend, and Python runs alongside it for inference. Configuration lives in
[`render.yaml`](render.yaml).

Python dependencies are installed from `ml/requirements.txt` rather than resolved
fresh. `model.joblib` is a pickle, and a pickle only reloads reliably on the
library versions that wrote it — an unpinned install would eventually pull a
newer numpy whose internals have moved, breaking inference on the host while it
continued to work locally.

> **The first request after an idle period is slow.** The free tier spins the
> service down after roughly 15 minutes without traffic, and Render shows a
> "waking up" page while the container boots again. Loading the app once
> beforehand makes everything after it immediate.

---

## 📄 License

MIT — see [LICENSE](LICENSE).
