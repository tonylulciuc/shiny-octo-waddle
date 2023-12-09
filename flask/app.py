#!/usr/bin/env python
# encoding: utf-8
import os
import json
import shutil
from flask_cors import CORS
from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager, decode_token

# Environment variables
API_USERS = [x.split(':') for x in os.getenv('API_USERS').split(',')]
SERVER_VOLUMNS = [x.split(':') for x in os.getenv('SERVER_VOLUMNS').split(',')]
PORT = os.getenv('SERVER_PORT')
DEBUG = os.getenv('DEBUG') == 'true'

# Server

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

# Authentication

@app.route('/whoami', methods=["GET"])
@jwt_required()
def whoami():
    return decode_token(request.headers.get('Authorization').replace('Bearer ', ''))['sub']

@app.route('/validate', methods=["GET"])
@jwt_required()
def is_authenticated():
    return "0k", 200

@app.route('/login', methods=["POST"])
def create_token():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    found = False

    for [name, pwd] in API_USERS:
        if username == name and password == pwd:
            found = True
            break

    if not found:
        return "Invalid username or password", 401

    access_token = create_access_token(identity=username)
    response = {"access_token":access_token}
    return response

@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        return response

# File managment 

def get_user_volumns(): 
    user = whoami()
    volumns = []

    for [account, volumn] in SERVER_VOLUMNS:
        if user == account:
            volumns.append(volumn)
    
    return volumns

def get_files():
    volumns = get_user_volumns()
    data=[]
    data_with_volumns=[]

    for volumn in volumns:
        for root, dirs, files in os.walk(volumn):
            for name in files:
                file = os.path.join(root.replace(f"{volumn}", ''), name).lstrip('/')

                data.append(file)
                data_with_volumns.append([volumn, file])
    
    return data, data_with_volumns


@app.route('/dir/all', methods=['GET'])
@jwt_required()
def query_dir_all():
    files, files_with_volumns = get_files()

    return jsonify(files)


def find_file(filename: str):
    files, files_with_volumns = get_files()
    data  = None

    for [volumn, file] in files_with_volumns:
        if filename == file:
            data = f"{volumn}/{file}"
            break
    
    return data


@app.route('/file/<path:filename>', methods=['GET'])
@jwt_required()
def download_file(filename):
    path_to_content = find_file(filename=filename)
    
    if path_to_content is None:
        return "File not find", 404

    return send_file(path_to_content, as_attachment=True)

@app.route('/file/<path:filename>', methods=['DELETE'])
@jwt_required()
def remove_file(filename):
    print(filename)
    path_to_content = find_file(filename=filename)
    
    if path_to_content is None:
        return "File not find", 404

    os.remove(path_to_content)

    return 'OK', 200


@app.route('/storage/space', methods=['GET'])
@jwt_required()
def storage_space():
    total_space = 0
    free_space = 0
    used_space = 0
    volumns = get_user_volumns()

    for volumn in volumns:
        statvfs = os.statvfs(volumn)
        total_space += statvfs.f_frsize * statvfs.f_blocks     # Size of filesystem in bytes
        free_space += statvfs.f_frsize * statvfs.f_bfree      # Actual number of free bytes

    used_space = total_space - free_space

    return { 'total_space': total_space, 'free_space': free_space, 'used_space': used_space, 'percent_used': f"{(used_space / total_space) *  100:.2}" }, 200

def find_volumn_with_space(size):
    volumns = get_user_volumns()

    for volumn in volumns:
        statvfs = os.statvfs(volumn)
        
        if size < statvfs.f_frsize * statvfs.f_bfree:
            return volumn
    
    return None



@app.route('/upload2', methods=['POST']) 
@jwt_required()
def upload2():
    file = request.files['file']
    form = request.form
    original_size = int(form['originalSize'])
    current_chunk = int(form['chunkNumber'])
    total_chunks = int(form['totalChunks'])
    chunk_offset = int(form['chunkOffset'])
    original_name = form['originalName']
    volumn = find_volumn_with_space(original_size)

    if volumn is None:
        return 'No more memory, please free space or add more storage', 507

    file_path = os.path.join(volumn, secure_filename(original_name))
    print(file_path)

    if os.path.exists(file_path) and current_chunk == 0:
        return { 'msg': 'File already exists' }, 400

    try:
        with open(file_path, 'ab') as f:
            f.seek(chunk_offset)
            f.write(file.stream.read())
    except OSError:
        return { 'msg': 'Failed to write chunk' }, 500

    if current_chunk + 1 == total_chunks:
        if os.path.getsize(file_path) != original_size:
            return { 'msg': 'Size mismatch' }, 500


    return { 'msg': 'OK' }, 200

@app.route('/upload', methods=['POST']) 
@jwt_required()
def upload_files():
    failed_to_save = []

    for key in request.files.keys(): 
        file = request.files[key]
        volumn = find_volumn_with_space(file.tell())

        if volumn is None:
            failed_to_save.append(file.filename)
        else:
            file.save(f"{volumn}/{file.filename}") 

    if len(failed_to_save) > 0:
        return f'Failed to upload: {failed_to_save}', 409

    return 'OK', 200


if __name__ == "__main__":
    app.run(port=PORT, debug=DEBUG)