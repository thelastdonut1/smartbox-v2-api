import docker
import yaml
import os
from pathlib import Path
from dotenv import load_dotenv
import logging


MODE = "DEVELOPMENT"


logging.basicConfig(level=logging.INFO)


def initialize():
    if MODE.lower() == 'development':
        load_dotenv('app/config/.env.development')
    elif MODE.lower() == 'production':
        load_dotenv('app/config/.env.production')


def parse_volumes(volumes: list[dict]):
    parsed_volumes = {}

    for volume in volumes:
        volume = interpolate_env_variables(volume)
        volume_key = volume['source']
        volume_value = {'bind': volume['target'], 'mode': volume.get('mode', 'rw')}
        parsed_volumes[volume_key] = volume_value

    return parsed_volumes


def parse_ports(ports: list[str]):
    parsed_ports = {}

    for port in ports:
        port = port.split(':')
        host_port = int(port[0])
        container_port = int(port[1])
        parsed_ports[host_port] = container_port

    return parsed_ports


def interpolate_env_variables(volume: dict):
    for key, value in volume.items():
        if isinstance(value, str) and value.startswith('$'):
            value = value[1:].replace('{', '').replace('}', '')
            volume[key] = os.getenv(value)

    return volume


def get_config(config_file: str):
    config_dir = Path(__file__).parent / 'app' / 'config'
    config_path = config_dir / config_file

    with open(config_path, 'r') as f:
        settings: dict = yaml.safe_load(f)

    return settings

            
def build_image(build_settings: dict):
    image, _ = client.images.build(**build_settings)
    return image


def check_environment_variables():
    required_env_variables = ['LOCAL_AGENT_DIR', 'DOCKER_AGENT_DIR']

    for env_var in required_env_variables:
        if not os.getenv(env_var):
            raise EnvironmentError(f"Environment variable {env_var} is not set.")
        else:
            if env_var == 'DOCKER_AGENT_DIR':
                value = os.getenv(env_var)
                if value.startswith('C:/Program Files/Git'):
                    os.environ[env_var] = value.split('C:/Program Files/Git')[1]


if __name__ == '__main__':
    initialize()

    check_environment_variables()

    client = docker.from_env()
    settings = get_config('docker-api-config.yml')

    build_settings = settings.pop('build')
    image = build_image(build_settings)
    logging.info(f"Finished building image: {image.tags.pop()}")

    volume_settings = settings.pop('volumes')
    volumes = parse_volumes(volume_settings)
    logging.info(f"Parsed volumes: {volumes}")

    port_settings = settings.pop('ports')
    ports = parse_ports(port_settings)
    logging.info(f"Parsed ports: {ports}")

    container = client.containers.run(image=image, volumes=volumes, ports=ports, detach=True, **settings) 
    logging.info(f"Container {container.name} is running.")