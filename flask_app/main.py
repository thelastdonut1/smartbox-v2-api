import logging
from flask import Flask, request, send_from_directory, jsonify
from pathlib import Path
import docker
from socket import socket, AF_INET, SOCK_STREAM
from DockerCommands import build_or_get_image, run_container, get_existing_container, stop_container, start_container, delete_container, read_file, make_multiple_containers, upload_file

app = Flask(__name__)
root_dir = Path(__file__).parent
print(root_dir)

agent_dir = Path("/srv/smartbox-api/agents") # Path to the agent directory
agent_dir.mkdir(parents=True, exist_ok=True) # Create the agent directory if it does not exist

client = docker.from_env()

# GET: /hello-world
# @app.route('/hello-world', methods=['GET'])
# def hello_world():
#     """
#     Returns a simple 'Hello, World!' message.
    
#     :return: A 'Hello, World!' message.
#     """
#     logging.info("Hello, World!")
#     return jsonify(result='Hello, World!')

# GET: /file/show?name=mc1&file=agent.cfg
@app.route('/file/show', methods=['GET'])
def show_file():
    """
    Returns the contents of the specified file within the data directory.
    
    :param filepath: The path to the file relative to the data directory. Path traversal is not allowed.
    :return: The contents of the file if found and readable; otherwise, a failure message.
    """
    agent_name = request.args.get('name')

    if agent_name is None:
        return jsonify(result='Failure. No path provided')

    file = request.args.get('file')

    if file is None:
        return jsonify(result='Failure. No file provided')
    
    container = get_existing_container(client, agent_name)
    if not container:
        return jsonify(result= f"Container '{agent_name}' does not exist. Please check name and try again.")
    
    return jsonify(result= f"{read_file(file, agent_name)}")




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
        return jsonify(result='Success')
    except Exception as e:
        return jsonify(result=f'Failure. {str(e)}')


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
    
    
    print(filepath)
    return send_from_directory(directory=root_dir, path=filepath, as_attachment=True)


# GET: /agent/list
@app.route('/agent/list', methods=['GET'])
def agent_list():
    """
    Lists all agent folders within the data directory.
    
    :return: JSON response with a list of agent folders or a failure message.
    """
    #agent_dir = root_dir / 'config'
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
        return jsonify(result= f"Container '{agent}' does not exist. Please check name and try again.")

    start_container(agent)  

    return jsonify(result= f"Container '{agent}' started.")
   


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
        return jsonify(result= f"Container '{agent}' does not exist. Please check name and try again.")

    stop_container(agent)  

    return jsonify(result= f"Container '{agent}' stopped.")
   

# POST: /create
# Body = {
#    name: mc1
#    port: 5002
# }

# Could iterate through the agent folders and check if the dir is in the list
# Add a way to check if a port has been taken by a container even if the container is not in use
# Creates different agents 
    # Get: /create?name=mc1
@app.route('/create', methods=['POST'])
def create():
    """
    Will call the DockerCreate.py and make a new agent based off of the user prompts

    """

    port = request.json.get('port') if request.json else None
    agent_name = request.json.get('name') if request.json else None

    if not port:
        return jsonify(result= "Port not specified")
    
    if not agent_name:
        return jsonify(result= "Agent name not specified")
    

    if is_port_in_use(port):
        return jsonify(result= "Post is in use. Please use a different port")


    image = build_or_get_image()
    container = run_container(image, agent_name, port)

    return jsonify(result=f'{container.name} Started on {port}')


def is_port_in_use(port):
    with socket(AF_INET, SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0



# POST: /delete
# Body = {
#    "name": "mc1" OR "names": ["mc1", "mc2", "mc3"]
# }
@app.route('/delete', methods=['POST'])
def delete_agents():
    """
    Deletes agent(s) based on a single name or a list of names provided in the request.
    Still need to handle valueErrors more thourghly.
    """
    if not request.is_json:
        return jsonify(result='Failure. Content-Type must be application/json'), 415

    container_name = request.json.get('name') # Single deletion
    container_names = request.json.get('names') # Multiple deletions

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

    results = {} # Store the results of the deletion process in a empty dictionary
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
        return jsonify(result= "Port not specified")
    
    if not agent_name:
        return jsonify(result= "Agent name not specified")
    
    if not number:
        return jsonify(result= "Number of agents not specified")

    image = build_or_get_image()
    container, used_port = make_multiple_containers(image, agent_name, port, number)
    if not container:
        return jsonify(result= f'Failure. Port {used_port} is in use. Please use a different port. Agents have not been created.')

    return jsonify(result=f'{number} Containers named {agent_name} started on {port}-{used_port}')


# TODO: Add a way to change the agent.cfg file( this does not work yet )
# POST: /add/file
# Body = {
#    name: Agent
#    file: agent.cfg
# }
@app.route('/add/file', methods=['POST'])
def add_new_file():
    """
    This will change the agent.cfg or mazak.xml file based on what the user sends

    """
    file = request.files['file']
    agent_name = request.form.get('name')

    if not file:
        return jsonify(result= "File not specified")
    
    if not agent_name:
        return jsonify(result= "Agent name not specified")

    container = get_existing_container(client, agent_name)
    if not container:
        return jsonify(result= f"Container '{agent_name}' does not exist. Please check name and try again.")
    
    upload_file(file, agent_name)
    return jsonify(result=f'{file} uploaded to {agent_name}')
    



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


