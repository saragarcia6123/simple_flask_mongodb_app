from flask import Flask, render_template, jsonify, request
from flask_pymongo import PyMongo
from bson import ObjectId

app = Flask(__name__)

app.config["MONGO_URI"] = "mongodb://localhost:27017"
mongo = PyMongo(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/users', methods=['POST'])
def add_user():
    if mongo.db is None:
        return jsonify({'error': 'Database not connected'}), 500
    try:
        mongo.db.users.insert_one(request.json)  # Insert user into the database
        return jsonify({'message': 'User added successfully'}), 201  # Created status
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/users', methods=['DELETE'])
def delete_user():
    if mongo.db is None:
        return jsonify({'error': 'Database not connected'}), 500
    user_id = request.json.get('_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    try:    
        result = mongo.db.users.delete_one({'_id': ObjectId(user_id)})
        if result.deleted_count == 0:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users', methods=['GET'])
def get_users():
    if mongo.db is None:
        return jsonify({'error': 'Database not connected'})
    params = {key: value for key, value in request.args.items()} # Extract query parameters
    users = mongo.db.users.find(params)  # Retrieve users based on query parameters
    user_list = [{key: user[key] for key in user if key != '_id'} for user in users] # Convert to dictionary
    return jsonify(user_list), 200

if __name__ == '__main__':
    app.run(debug=True)
