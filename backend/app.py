"""
House Price Prediction System - Backend API
Flask + ML (Random Forest, Gradient Boosting, Ridge) for price prediction
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import pandas as pd
import numpy as np
import os
import pickle
import json
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'house_price.db')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_PATH, exist_ok=True)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT, bedrooms INTEGER, bathrooms REAL, sqft INTEGER,
        year_built INTEGER, lot_size REAL, floors INTEGER, waterfront INTEGER,
        condition_grade INTEGER, predicted_price REAL, actual_price REAL,
        model_used TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT, bedrooms INTEGER, bathrooms REAL, sqft INTEGER,
        year_built INTEGER, lot_size REAL, floors INTEGER, waterfront INTEGER,
        condition_grade INTEGER, predicted_price REAL, model_used TEXT,
        confidence_interval REAL, created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS model_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT, model_name TEXT,
        mae REAL, rmse REAL, r2 REAL, created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )''')
    c.execute("SELECT COUNT(*) FROM properties")
    if c.fetchone()[0] == 0:
        np.random.seed(42)
        locations = ['Downtown', 'Suburb', 'Riverside', 'Hills', 'Coastal', 'Urban', 'Rural']
        for _ in range(400):
            loc = np.random.choice(locations)
            bed = int(np.random.choice([2, 3, 4, 5, 6]))
            bath = round(bed * np.random.uniform(0.8, 1.5), 1)
            sqft = int(np.random.uniform(800, 6000))
            year = int(np.random.uniform(1960, 2023))
            lot = round(np.random.uniform(0.1, 2.0), 2)
            floors = int(np.random.choice([1, 2, 3]))
            water = 1 if np.random.random() < 0.1 else 0
            cond = int(np.random.uniform(3, 10))
            base = 100000 + sqft * 150 + bed * 20000 + (2024 - year) * -500
            price = base * (1 + 0.2 * (cond - 5)) * (1.3 if water else 1) * np.random.uniform(0.85, 1.2)
            c.execute('''INSERT INTO properties (location, bedrooms, bathrooms, sqft, year_built, lot_size, floors, waterfront, condition_grade, actual_price)
                VALUES (?,?,?,?,?,?,?,?,?,?)''', (loc, bed, bath, sqft, year, lot, floors, water, cond, round(price, 2)))
    conn.commit()
    conn.close()

# Load or train model
scaler = None
model = None
label_enc = None
FEATURE_COLS = ['bedrooms', 'bathrooms', 'sqft', 'year_built', 'lot_size', 'floors', 'waterfront', 'condition_grade', 'location_encoded']

def load_model():
    global scaler, model, label_enc
    pkl_path = os.path.join(MODEL_PATH, 'model.pkl')
    if os.path.exists(pkl_path):
        with open(pkl_path, 'rb') as f:
            d = pickle.load(f)
            model, scaler, label_enc = d['model'], d['scaler'], d['label_enc']
        return True
    return False

def load_or_train():
    global scaler, model, label_enc
    conn = get_db()
    df = pd.read_sql("SELECT * FROM properties WHERE actual_price IS NOT NULL", conn)
    conn.close()
    if len(df) < 30:
        return False
    label_enc = LabelEncoder()
    df['location_encoded'] = label_enc.fit_transform(df['location'])
    X = df[FEATURE_COLS].values
    y = df['actual_price'].values
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)
    model = GradientBoostingRegressor(n_estimators=100, random_state=42)
    model.fit(X_train_s, y_train)
    preds = model.predict(X_test_s)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    with open(os.path.join(MODEL_PATH, 'model.pkl'), 'wb') as f:
        pickle.dump({'model': model, 'scaler': scaler, 'label_enc': label_enc, 'mae': mae, 'r2': r2}, f)
    conn = get_db()
    conn.execute("INSERT INTO model_history (model_name, mae, rmse, r2) VALUES (?,?,?,?)", ('Gradient Boosting', mae, rmse, r2))
    conn.commit()
    conn.close()
    return True

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) FROM properties").fetchone()[0]
    avg_price = conn.execute("SELECT AVG(actual_price) FROM properties WHERE actual_price IS NOT NULL").fetchone()[0] or 0
    by_loc = conn.execute("SELECT location, COUNT(*) as c, AVG(actual_price) as avg FROM properties GROUP BY location").fetchall()
    recent = conn.execute("SELECT * FROM predictions ORDER BY created_at DESC LIMIT 10").fetchall()
    conn.close()
    return jsonify({
        'total_properties': total,
        'avg_price': round(avg_price, 2),
        'by_location': [dict(r) for r in by_loc],
        'recent_predictions': [dict(r) for r in recent]
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    global scaler, model, label_enc
    data = request.json
    loc = data.get('location', 'Suburb')
    if not load_model() and not load_or_train():
        return jsonify({'error': 'Train model first with property data'}), 400
    try:
        loc_enc = label_enc.transform([loc])[0]
    except Exception:
        loc_enc = 0
    X = np.array([[
        data.get('bedrooms', 3), data.get('bathrooms', 2),
        data.get('sqft', 2000), data.get('year_built', 2000),
        data.get('lot_size', 0.5), data.get('floors', 1),
        data.get('waterfront', 0), data.get('condition_grade', 6),
        loc_enc
    ]])
    X_s = scaler.transform(X)
    pred = float(model.predict(X_s)[0])
    ci = 0.1 * pred
    conn = get_db()
    conn.execute('''INSERT INTO predictions (location, bedrooms, bathrooms, sqft, year_built, lot_size, floors, waterfront, condition_grade, predicted_price, model_used, confidence_interval)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''',
        (loc, data.get('bedrooms'), data.get('bathrooms'), data.get('sqft'), data.get('year_built'),
         data.get('lot_size'), data.get('floors'), data.get('waterfront'), data.get('condition_grade'),
         pred, 'Gradient Boosting', ci))
    conn.commit()
    conn.close()
    return jsonify({
        'predicted_price': round(pred, 2),
        'confidence_lower': round(pred - ci, 2),
        'confidence_upper': round(pred + ci, 2),
        'model_used': 'Gradient Boosting'
    })

@app.route('/api/properties', methods=['GET'])
def properties():
    conn = get_db()
    page = int(request.args.get('page', 1))
    per = int(request.args.get('per_page', 20))
    rows = conn.execute("SELECT * FROM properties ORDER BY id DESC LIMIT ? OFFSET ?", (per, (page - 1) * per)).fetchall()
    total = conn.execute("SELECT COUNT(*) FROM properties").fetchone()[0]
    conn.close()
    return jsonify({'data': [dict(r) for r in rows], 'total': total, 'page': page, 'total_pages': (total + per - 1) // per})

@app.route('/api/train', methods=['POST'])
def train():
    ok = load_or_train()
    return jsonify({'success': ok, 'message': 'Model trained' if ok else 'Not enough data'})

@app.route('/api/analytics', methods=['GET'])
def analytics():
    conn = get_db()
    by_bed = conn.execute("SELECT bedrooms, AVG(actual_price) as avg FROM properties WHERE actual_price IS NOT NULL GROUP BY bedrooms").fetchall()
    by_year = conn.execute("SELECT year_built, AVG(actual_price) as avg FROM properties WHERE actual_price IS NOT NULL GROUP BY year_built ORDER BY year_built").fetchall()
    price_dist = conn.execute("SELECT CASE WHEN actual_price < 200000 THEN 'Under 200k' WHEN actual_price < 500000 THEN '200k-500k' WHEN actual_price < 1000000 THEN '500k-1M' ELSE '1M+' END as bucket, COUNT(*) as c FROM properties WHERE actual_price IS NOT NULL GROUP BY bucket").fetchall()
    conn.close()
    return jsonify({
        'by_bedrooms': [dict(r) for r in by_bed],
        'by_year': [dict(r) for r in by_year],
        'price_distribution': [dict(r) for r in price_dist]
    })

@app.route('/api/filters', methods=['GET'])
def filters():
    conn = get_db()
    locs = [r[0] for r in conn.execute("SELECT DISTINCT location FROM properties ORDER BY location").fetchall()]
    conn.close()
    return jsonify({'locations': locs})

if __name__ == '__main__':
    init_db()
    load_model() or load_or_train()
    app.run(debug=True, port=5010)
