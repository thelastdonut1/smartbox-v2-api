from flask import Flask, request, send_from_directory, jsonify
import os
import subprocess
import socket
import time

app = Flask(__name__)
dataDir = "/data/appdata/"

@app.route('/fileShow/<path:filepath>', methods=['GET'])
def file_show(filepath):
    if '..' in filepath:
        return 'result:failure. Directory cannot contain ..'
    full_path = os.path.join(dataDir, filepath)
    if not os.path.exists(full_path):
        return 'result:failure. no such file'
    try:
        with open(full_path, "r") as f:
            return f.read()
    except Exception as e:
        return f"result:failure. unknown error {str(e)}"

@app.route('/fileDel/<path:dir>', methods=['POST'])
def file_del(dir):
    if '..' in dir:
        return jsonify(result='failure. Directory cannot contain ..')
    full_path = os.path.join(dataDir, dir)
    if not os.path.exists(full_path):
        return jsonify(result='failure. no such directory')
    try:
        subprocess.call(['rm', '-Rf', full_path])
        return jsonify(result='success')
    except Exception as e:
        return jsonify(result=f'failure. {str(e)}')

@app.route('/fileList/<path:dir>', methods=['GET'])
def file_list(dir):
    if '..' in dir:
        return jsonify(result='failure. Directory cannot contain ..')
    full_path = os.path.join(dataDir, dir)
    if not os.path.exists(full_path):
        return jsonify(result='failure. no such directory')
    files = [f for f in os.listdir(full_path) if os.path.isfile(os.path.join(full_path, f))]
    return jsonify(files)

@app.route('/upload', methods=['POST'])
def upload():
    dir = request.form.get('dir')
    if '..' in dir:
        return jsonify(result='failure. Directory cannot contain ..')
    full_path = os.path.join(dataDir, dir)
    if 'file' not in request.files:
        return jsonify(result='failure. No file part')
    file = request.files['file']
    if file.filename == '':
        return jsonify(result='failure. No selected file')
    if not os.path.exists(full_path):
        os.makedirs(full_path)
    file.save(os.path.join(full_path, file.filename))
    return jsonify(result='success.')

@app.route('/download/<path:filepath>', methods=['GET'])
def download(filepath):
    if '..' in filepath:
        return jsonify(result='failure. Directory cannot contain ..')
    return send_from_directory(directory=dataDir, filename=filepath, as_attachment=True)

# The agent management, network configuration, and other specific functionalities
# would need to be adapted based on how you manage agents and configurations in your environment.

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5010, debug=True)
