from flask import Flask, request, send_from_directory, jsonify
from pathlib import Path

app = Flask(__name__)
root_dir = Path(__file__).parents[1]
agent_dir = root_dir / 'agents'


# GET: /file/show?path=mc1/agent.cfg
@app.route('/file/show', methods=['GET'])
def show_file():
    """
    Returns the contents of the specified file within the data directory.
    
    :param filepath: The path to the file relative to the data directory. Path traversal is not allowed.
    :return: The contents of the file if found and readable; otherwise, a failure message.
    """

    file_path = request.args.get('path')

    if file_path is None:
        return jsonify(result='Failure. No path provided')

    # Prevent user from path traversal
    if '..' in file_path:
        return jsonify(result='Failure. Directory traversal is not allowed')
    
    full_path = agent_dir / file_path

    if not full_path.exists():
        return jsonify(result='Failure. No such file or directory')
    try:
        with open(full_path, "r") as f:
            return jsonify(result=f.read())
    except Exception as e:
        return jsonify(result=f'failure. {str(e)}')


# POST: /file/delete
# Body = {
#    path: mc1/agent.cfg
# }
@app.route('/file/delete', methods=['POST'])
def delete_file():
    """
    Deletes the specified directory and its contents from the data directory.
    
    :return: JSON response indicating 'success' or 'failure' with an error message.
    """
    if not request.is_json:
        return jsonify(result='Failure. Content-Type must be application/json')
    
    file_path = request.json.get('path') if request.json else None

    if file_path is None:
        return 'Result: Failure. No path provided'

    # Prevent user from path traversal
    if '..' in file_path:
        return jsonify(result='Failure. Directory traversal is not allowed')
    
    full_path = agent_dir / file_path

    if not full_path.exists():
        return jsonify(result='Failure. No such file or directory')
    
    if not full_path.is_file():
        return jsonify(result='Failure. Not a file')

    try:
        full_path.unlink()
        return jsonify(result='success')
    except Exception as e:
        return jsonify(result=f'failure. {str(e)}')


# GET: /file/list?dir=mc1
@app.route('/file/list', methods=['GET'])
def file_list():
    """
    Lists all files in the specified directory within the data directory.
    
    :return: JSON response with a list of files in the specified directory or a failure message.
    """

    dir = request.args.get('dir')

    # Prevent user from path traversal
    if '..' in dir:
        return jsonify(result='failure. Directory cannot contain ..')
    
    full_path = agent_dir / dir

    if not full_path.exists():
        return jsonify(result='Failure. No such directory')
    
    if not full_path.is_dir():
        return jsonify(result='Failure. Not a directory')
    
    files = [f.name for f in full_path.iterdir() if f.is_file()]
    
    return jsonify(files)


# POST: /upload
# multipart/form-data
# dir: mc1
# file: <file>

# Should maybe update this to only allow agent folders (mc1, mc2, etc)
# Could iterate through the agent folders and check if the dir is in the list
@app.route('/upload', methods=['POST'])
def upload():
    """
    Uploads a file to a specified directory within the data directory. Creates the directory if it doesn't exist.
    
    :param dir: The path to the directory relative to the data directory, obtained from the 'dir' form field. Path traversal is not allowed.
    :param file: The file to upload, obtained from the 'file' form field.
    :return: JSON response indicating 'success' or 'failure' with an appropriate message.
    """
    if not request.headers.get('Content-Type').startswith('multipart/form-data'):
        return jsonify(result='Failure. Content-Type must be multipart/form-data')
    
    dir = request.form.get('dir')

    if dir is None:
        return jsonify('Result: Failure. No path provided')
    
    # Prevent user from path traversal
    if '..' in dir:
        return jsonify(result='Failure. Directory cannot contain ..')

    if 'file' not in request.files:
        return jsonify(result='Failure. No file part')
    
    file = request.files['file']

    if file.filename == '':
        return jsonify(result='Failure. No selected file')

    full_path = agent_dir / dir
    full_path.mkdir(parents=True, exist_ok=True)

    file_path = full_path / file.filename
    file.save(file_path)

    return jsonify(result='Success.')


# GET: /download?filepath=mc9/agent_log.log
@app.route('/download', methods=['GET'])
def download():
    """
    Initiates a download of the specified file from the data directory.
    
    :param filepath: The path to the file relative to the data directory. Path traversal is not allowed.
    :return: The file as an attachment if it exists; otherwise, a JSON response indicating failure.
    """

    filepath = request.args.get('filepath')

    if '..' in filepath:
        return jsonify(result='Failure. Directory cannot contain ..')
    
    print(agent_dir)
    print(filepath)
    return send_from_directory(directory=agent_dir, path=filepath, as_attachment=True)

# The agent management, network configuration, and other specific functionalities
# would need to be adapted based on how you manage agents and configurations in your environment.

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5010, debug=True)