import docker
import yaml
from pathlib import Path

client = docker.from_env()

with open('docker-compose.yml', 'r') as f:
    settings = yaml.safe_load(f)

build_settings = settings['build']
container_settings = settings['container']

def build_image(path: Path, tag: str):
    image, _ = client.images.build(path=str(path), tag=tag)
    return image