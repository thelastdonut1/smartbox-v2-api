import docker
from pathlib import Path
import logging
import shutil
from utils import is_port_in_use
from app.config import settings


client = docker.from_env()


class ContainerError(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message


root_dir = Path(__file__).parent  # Path to the root directory flask_app
PORT_RANGE = (5000, 5010)


def get_existing_container(client, name):
    try:
        return client.containers.get(name)
    except docker.errors.NotFound:
        return None
    

def build_or_get_image():
    try:
        image = client.images.get("mtconnect-agent")
        logging.info("Image found locally.")
    except docker.errors.ImageNotFound:
        logging.info("Image not found, building now...")
        image, _ = client.images.build(path="../", dockerfile="Dockerfile.agent", tag="mtconnect-agent", rm=True)
    return image


def run_container(image, agent_name, port):
    existing_container = get_existing_container(client, agent_name)
    if existing_container:
        logging.info(f"Container '{agent_name}' already exists. Consider stopping/removing it before proceeding.")
        raise ContainerError(f"Container '{agent_name}' already exists. Consider stopping/removing it before proceeding.")

    local_path = settings.agent_dir / agent_name  # Path to the agent directory

    if local_path.exists():  # Check if the agent directory exists
        logging.info(f"Agent '{agent_name}' already exists. Consider removing it before proceeding.")
        raise ContainerError(f"Agent '{agent_name}' already exists. Consider removing it before proceeding.")

    local_path.mkdir(parents=True)  # Create the agent directory if it does not exist

    target = root_dir / "agent" / "default"
    logging.info(f"Copying files from {target} to {local_path} in container {agent_name}...")

    shutil.copytree(root_dir / "agent" / "default", local_path, dirs_exist_ok=True)

    host_machine_path = Path(settings.agent_dir , agent_name)

    logging.info(f"Host machine path: {host_machine_path}")

    agent_port = port

    agent_command = ["/usr/bin/mtcagent", "run", "/app/agent/agent.cfg"]

    container = client.containers.run(image, detach=True, ports={5000: agent_port},
                                      volumes={f"{host_machine_path}": {"bind": "/app/agent", "mode": "rw"}},
                                      name=agent_name, command=agent_command)
    
    logging.info(f"Container '{agent_name}' started.")

    return container


def delete_container(name):
    try:
        container = client.containers.get(name)
        container.stop()
        container.remove(v=True) #* This argument will remove the need for delete_mounts function. Needs testing
        delete_local_directory(name)
        # delete_mounts(container)
    except docker.errors.APIError as e:
        logging.info(f"Error communicating with Docker client. Container '{name}' did not get removed.")
        raise ContainerError
    except docker.errors.NotFound as e:
        logging.info(f"Container '{name}' does not exists.")
        raise ContainerError
    except Exception as e:
        logging.error(f"Error while deleting container '{name}. {e}")
        raise Exception
    logging.info("Container successfully removed")


def delete_local_directory(name):
    """
    Deletes the agent folder and its contents. Used when removing an agent.
    :param name: The name of the agent
    :return: None
    """
    directory = settings.agent_dir / name
    shutil.rmtree(directory)


# def delete_mounts(container):
#     mounts = container.attrs['Mounts']
#     for mount in mounts:
#         volume_name = mount["Name"]
#         try:
#             volume = client.volumes.get(volume_name)
#             volume.remove()
#         except docker.errors.NotFound as e:
#             logging.info(f"Volume '{volume_name}' does not exists. Try again Error: {e}.")
#             return
#         except docker.errors.APIError as e:
#             logging.info(f"Volume '{volume_name}' did not get removed. Container Error: {e}.")
#             return


# TODO: make a mass create function that will run when the flask app starts up (10 agents)
def make_multiple_containers(image, agent_name, port, number):
    for numbers in range(number):
        try:
            if is_port_in_use(port + numbers):
                logging.info(f"Port {port + numbers} is in use. Try again.")
                return False, port + numbers
            run_container(image, agent_name + str(numbers), port + numbers)
        except docker.errors.APIError as e:
            logging.info(f"Container '{agent_name + str(numbers)}' did not start. Error: {e}.")
    return True, port + numbers


def stop_container(agent_name):
    container = client.containers.get(agent_name)
    container.stop()


def start_container(agent_name):
    container = client.containers.get(agent_name)
    container.start()


if __name__ == "__main__":
    image = build_or_get_image()
    run_container(image)
