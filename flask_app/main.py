from flask import Flask, request, send_from_directory, jsonify
import os
import subprocess
import socket
import time

app = Flask(__name__)
dataDir = "/data/appdata/"

@app.route('/fileShow/<path:filepath>', methods=['GET'])
def file_show(filepath):
    """
    Returns the contents of the specified file within the data directory.
    
    :param filepath: The path to the file relative to the data directory. Path traversal is not allowed.
    :return: The contents of the file if found and readable; otherwise, a failure message.
    """
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
    """
    Deletes the specified directory and its contents from the data directory.
    
    :param dir: The path to the directory relative to the data directory. Path traversal is not allowed.
    :return: JSON response indicating 'success' or 'failure' with an error message.
    """
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
    """
    Lists all files in the specified directory within the data directory.
    
    :param dir: The path to the directory relative to the data directory. Path traversal is not allowed.
    :return: JSON response with a list of files in the specified directory or a failure message.
    """
    if '..' in dir:
        return jsonify(result='failure. Directory cannot contain ..')
    full_path = os.path.join(dataDir, dir)
    if not os.path.exists(full_path):
        return jsonify(result='failure. no such directory')
    files = [f for f in os.listdir(full_path) if os.path.isfile(os.path.join(full_path, f))]
    return jsonify(files)

@app.route('/upload', methods=['POST'])
def upload():
    """
    Uploads a file to a specified directory within the data directory. Creates the directory if it doesn't exist.
    
    :param dir: The path to the directory relative to the data directory, obtained from the 'dir' form field. Path traversal is not allowed.
    :return: JSON response indicating 'success' or 'failure' with an appropriate message.
    """
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
    """
    Initiates a download of the specified file from the data directory.
    
    :param filepath: The path to the file relative to the data directory. Path traversal is not allowed.
    :return: The file as an attachment if it exists; otherwise, a JSON response indicating failure.
    """
    if '..' in filepath:
        return jsonify(result='failure. Directory cannot contain ..')
    return send_from_directory(directory=dataDir, filename=filepath, as_attachment=True)

# The agent management, network configuration, and other specific functionalities
# would need to be adapted based on how you manage agents and configurations in your environment.

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5010, debug=True)
