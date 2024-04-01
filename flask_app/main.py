import logging
from flask import Flask, request, send_from_directory, jsonify
from pathlib import Path
import docker
from socket import socket, AF_INET, SOCK_STREAM
from werkzeug.exceptions import BadRequest
from werkzeug.utils import secure_filename
from DockerCommands import (build_or_get_image, run_container, get_existing_container, stop_container, start_container,
                            delete_container, make_multiple_containers)

app = Flask(__name__)
root_dir = Path(__file__).parent

agent_dir = Path("/srv/smartbox-api/agents")  # Path to the agent directory
agent_dir.mkdir(parents=True, exist_ok=True)  # Create the agent directory if it does not exist

client = docker.from_env()


# GET: /file/show/mc1/agent.cfg
@app.route('/file/show/<path:file_path>', methods=['GET'])
def show_file(file_path):
    """
    Returns the contents of the specified file within the data directory.
    
    :param file_path: The path to the file relative to the data directory. Path traversal is not allowed.
    :return: The contents of the file if found and readable; otherwise, a failure message.
    """
    logging.info("Received GET request to file/show")

    safe_file_path = Path(agent_dir, secure_filename(file_path))

    if not safe_file_path.is_file():
        return jsonify(result='Failure. The file or directory does not exist.')

    try:
        with open(file_path, 'r') as f:  # Open the file
            return jsonify(f.read())
    except Exception as e:  # Catch any exceptions
        return jsonify(result=f'Failure. {str(e)}')


# DELETE: /file/delete
# Body = {
#    name: mc1
#    file: agent.cfg
# }
@app.route('/file/delete', methods=['DELETE'])
def delete_file():
    """
    Deletes the specified directory and its contents from the data directory.
    
    :return: JSON response indicating 'success' or 'failure' with an error message.
    """
    logging.info("Received DELETE request to /file/delete")

    if not request.is_json:
        raise BadRequest("Content-Type must be application/json")

    data = request.get_json()
    name = data.get('name')
    file = data.get('file')

    if not name or not file:
        raise BadRequest("Both 'name' and 'file' are required in the JSON payload")

    # Sanitize and validate the directory name and file name
    sanitized_name = secure_filename(name)
    sanitized_file = secure_filename(file)

    if not sanitized_name or not sanitized_file:
        raise BadRequest("Invalid directory or file name")

    file_path = agent_dir / sanitized_name / sanitized_file

    if not file_path.exists():
        return jsonify(result='Failure. No such file')

    if not file_path.is_file():
        return jsonify(result='Failure. Not a file')

    try:
        file_path.unlink()
        return jsonify(result='Success')
    except Exception as e:
        return jsonify(result=f'Failure. {str(e)}')


@app.route('/file/list/<path:directory>', methods=['GET'])
def file_list(directory):
    """
    Lists all the files in the specified agent's directory.

    :param directory: The agent directory to list the files of
    :return: JSON response with a list of files in the specified directory or a failure message.
    """
    sanitized_directory = secure_filename(directory)

    if not sanitized_directory:
        return jsonify(result='Failure. Invalid directory name')

    full_path = agent_dir / sanitized_directory

    if not full_path.exists():
        return jsonify(result='Failure. No such directory')

    if not full_path.is_dir():
        return jsonify(result='Failure. Not a directory')

    files = [f.name for f in full_path.iterdir() if f.is_file()]

    return jsonify(files)


# POST: /file/upload
# multipart/form-data
# dir: mc1
# file: <file>

# Should maybe update this to only allow agent folders (mc1, mc2, etc.)
# Could iterate through the agent folders and check if the dir is in the list
@app.route('/file/upload', methods=['POST'])
def upload():
    """
    Uploads a file to a specified directory within the data directory. Creates the directory if it doesn't exist.

    Request body parameters:
    - dir: The directory where the file should be uploaded (e.g., 'mc1', 'mc2', etc.).
    - file: The file to be uploaded.

    :return: JSON response indicating 'success' or 'failure' with an appropriate message.
    """
    logging.info("Received POST request to /file/upload")

    if 'multipart/form-data' not in request.content_type:
        return BadRequest('Failure. Content-Type must be multipart/form-data')

    directory = request.form.get('dir')
    file = request.files.get('file')

    if not directory:
        return BadRequest('Failure. Request body must contain a directory.')

    if not file:
        return BadRequest('Failure. Request body must contain a file')

    # Can this check be consolidated into some other logic?
    if file.filename == '':
        return jsonify(result='Failure. No selected file')

    file_path = Path(directory, file.filename)

    sanitized_file_path = secure_filename(str(file_path))

    if not sanitized_file_path:
        return BadRequest('Failure. File or directory name was invalid.')

    full_path = agent_dir / sanitized_file_path
    full_path.mkdir(parents=True, exist_ok=True)

    file.save(full_path)

    return jsonify(result='Success.')


# GET: /file/download/mc9/agent_log.log
@app.route('/file/download/<path:file_path>', methods=['GET'])
def download(file_path):
    """
    Initiates a download of the specified file from the data directory.

    :param file_path: The path to the file relative to the data directory. Path traversal is not allowed.
    :return: The file as an attachment if it exists; otherwise, a JSON response indicating failure.
    """

    safe_file_path = Path(root_dir, secure_filename(file_path))

    if not safe_file_path.is_file():
        return jsonify(result='Failure. The file does not exist.')

    return send_from_directory(directory=root_dir, path=file_path, as_attachment=True)


# GET: /agent/list
@app.route('/agent/list', methods=['GET'])
def agent_list():
    """
    Lists all agent folders within the data directory.
    
    :return: JSON response with a list of agent folders or a failure message.
    """
    # agent_dir = root_dir / 'config'
    agents = [f.name for f in agent_dir.iterdir() if f.is_dir()]
    return jsonify(agents)


# GET: /agent/start?agent=mc1
@app.route('/agent/start', methods=['GET'])
def start_agent():
    """
    Starts the specified agent.
    
    :param agent: The name of the agent to start.
    :return: JSON response indicating 'success' or 'failure' with an appropriate message.
    """
    agent = request.args.get('agent')

    if agent is None:
        return jsonify(result='Failure. No agent provided')

    container = get_existing_container(client, agent)
    if not container:
        return jsonify(result=f"Container '{agent}' does not exist. Please check name and try again.")

    start_container(agent)

    return jsonify(result=f"Container '{agent}' started.")


# GET: /agent/stop?agent=mc1
@app.route('/agent/stop', methods=['GET'])
def stop_agent():
    """
    Stops the specified agent.
    
    :param agent: The name of the agent to stop.
    :return: JSON response indicating 'success' or 'failure' with an appropriate message.
    """
    agent = request.args.get('agent')

    if agent is None:
        return jsonify(result='Failure. No agent provided')

    container = get_existing_container(client, agent)
    if not container:
        return jsonify(result=f"Container '{agent}' does not exist. Please check name and try again.")

    stop_container(agent)

    return jsonify(result=f"Container '{agent}' stopped.")


# POST: /agent/create
# Body = {
#    name: mc1
#    port: 5002
# }

# !Handle the existing container error to display a message
# Creates different agents 
# Get: /create?name=mc1
@app.route('/agent/create', methods=['POST'])
def create():
    """
    Will call the DockerCreate.py and make a new agent based off of the user prompts

    """

    port = request.json.get('port') if request.json else None
    agent_name = request.json.get('name') if request.json else None

    if not port:
        return jsonify(result="Port not specified")

    if not agent_name:
        return jsonify(result="Agent name not specified")

    if is_port_in_use(port):
        return jsonify(result="Post is in use. Please use a different port")

    image = build_or_get_image()
    container = run_container(image, agent_name, port)

    return jsonify(result=f'{container.name} Started on {port}')


def is_port_in_use(port):
    with socket(AF_INET, SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


# POST: /agent/delete
# Body = {
#    "name": "mc1" OR "names": ["mc1", "mc2", "mc3"]
# }
@app.route('/agent/delete', methods=['POST'])
def delete_agents():
    """
    Deletes agent(s) based on a single name or a list of names provided in the request.
    Still need to handle valueErrors more thoroughly.
    """
    if not request.is_json:
        return jsonify(result='Failure. Content-Type must be application/json'), 415

    container_name = request.json.get('name')  # Single deletion
    container_names = request.json.get('names')  # Multiple deletions

    if container_name and container_names:
        return jsonify(result='Failure. Please provide either a single name or a list of names, not both.'), 400

    if container_name:
        # Single deletion, converting to list for consistency
        names_to_delete = [container_name]
    elif isinstance(container_names, list):
        # Multiple deletions
        names_to_delete = container_names
    else:
        return jsonify(result='Failure. Invalid or missing agent name(s)'), 400

    results = {}  # Store the results of the deletion process in an empty dictionary
    for name in names_to_delete:
        try:
            print(name)
            container = get_existing_container(client, name)
            if container:
                delete_container(name)
                results[name] = 'Deleted'
            else:
                results[name] = 'Not Found'
        except ValueError as e:
            results[name] = f'Error: {e}'
    return jsonify(results)


# POST: /create
# Body = {
#    name: Agent
#    port: 5001
#    number: 10
# }
# Could iterate through the agent folders and check if the dir is in the list
# Add a way to check if a port has been taken by a container even if the container is not in use
# This will create agents based on the number passed into the route
# this could be changed to work on startup later

@app.route('/create/multiple', methods=['POST'])
def create_ten():
    """
    Will call the DockerCreate.py and make 10 new agents based off of the user prompts
    name: the name will be used to name the agents and will increment by 1
    port: the port will be what the agents start on. This will also increment by 1

    """

    port = request.json.get('port') if request.json else None
    agent_name = request.json.get('name') if request.json else None
    number = request.json.get('number') if request.json else None

    if not port:
        return jsonify(result="Port not specified")

    if not agent_name:
        return jsonify(result="Agent name not specified")

    if not number:
        return jsonify(result="Number of agents not specified")

    image = build_or_get_image()
    container, used_port = make_multiple_containers(image, agent_name, port, number)
    if not container:
        return jsonify(
            result=f'Failure. Port {used_port} is in use. Please use a different port. Agents have not been created.')

    return jsonify(result=f'{number} Containers named {agent_name} started on {port}-{used_port}')


# TODO: Add a way to change the agent.cfg file( this does not work yet )
# POST: /add/file
# Body = {
#    name: Agent
#    file: agent.cfg
# }
# @app.route('/add/file', methods=['POST'])
# def add_new_file():
#     """
#     This will change the agent.cfg or mazak.xml file based on what the user sends

#     """
#     file = request.files['file']
#     agent_name = request.form.get('name')

#     if not file:
#         return jsonify(result= "File not specified")

#     if not agent_name:
#         return jsonify(result= "Agent name not specified")

#     container = get_existing_container(client, agent_name)
#     if not container:
#         return jsonify(result= f"Container '{agent_name}' does not exist. Please check name and try again.")

#     upload_file(file, agent_name)
#     return jsonify(result=f'{file} uploaded to {agent_name}.')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
