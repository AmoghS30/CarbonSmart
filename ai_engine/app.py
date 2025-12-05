from flask import Flask, request, jsonify
from ai_predict import predict_emission

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "AI Engine is running!"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        activity = data.get("activity", "")
        prediction = predict_emission(activity)
        return jsonify({"predicted_emission": prediction})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8002)
