import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from functools import wraps
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv()

queries_db = []

API_KEY = os.getenv("OPENROUTER_API_KEY")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# ✅ Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "arya123"

def check_auth(username, password):
    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return jsonify({"message": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated

def store_query(data, response_text):
    """Store query data for analytics"""
    query = {
        "id": len(queries_db) + 1,
        "destination": data.get("destination", "Unknown"),
        "days": data.get("days", "Unknown"),
        "budget": data.get("budget", "Unknown"),
        "preferences": data.get("preferences", ""),
        "prompt": data.get("prompt", ""),
        "response": response_text,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "status": "completed"
    }
    queries_db.append(query)
    return query

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        
        allowed_keywords = [
            "travel", "trip", "itinerary", "vacation", "holiday", "place", 
            "tour", "destination", "stay", "hotel", "food", "budget", 
            "days", "location", "guide", "tourist", "explore", "plan"
        ]

        if 'prompt' in data and data['prompt'].strip():
            prompt = data['prompt'].lower()
            if not any(keyword in prompt for keyword in allowed_keywords):
                return jsonify({"response": "Sorry, I can only help with travel-related queries like planning trips, destinations, itineraries, etc."})
        else:
            destination = data.get("destination", "Kashmir")
            days = data.get("days", "5")
            budget = data.get("budget", "20000")
            preferences = data.get("preferences", "")
            prompt = (
                f"You are a helpful travel assistant. Plan a {days}-day trip to {destination} "
                f"within ₹{budget}. User preferences: {preferences}. "
                "Give a detailed daily itinerary, travel tips, food and hotel suggestions."
            )

        payload = {
            "model": "meta-llama/llama-3-8b-instruct",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 300
        }

        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        result = response.json()
        reply = result["choices"][0]["message"]["content"]

        store_query(data, reply)
        return jsonify({"response": reply})

    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"}), 500

# 🔐 Admin-only: Get all queries
@app.route('/admin/queries', methods=['GET'])
@require_auth
def get_queries():
    return jsonify(queries_db)

# 🔐 Admin-only: Get analytics
@app.route('/admin/analytics', methods=['GET'])
@require_auth
def get_analytics():
    if not queries_db:
        return jsonify({
            "totalQueries": 0,
            "popularDestinations": [],
            "recentActivity": []
        })

    destinations = {}
    for query in queries_db:
        dest = query.get("destination", "Unknown")
        destinations[dest] = destinations.get(dest, 0) + 1

    popular_destinations = [
        {"name": dest, "count": count} 
        for dest, count in sorted(destinations.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    recent_activity = [
        {
            "time": query["timestamp"],
            "action": f"Query for {query['destination']}"
        } for query in queries_db[-10:]
    ]

    return jsonify({
        "totalQueries": len(queries_db),
        "popularDestinations": popular_destinations,
        "recentActivity": recent_activity
    })

if __name__ == '__main__':
    app.run(debug=True)
