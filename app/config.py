from pydantic_settings import BaseSettings
from pydantic import Field
from pathlib import Path


class Settings(BaseSettings):
    agent_dir: Path = Field(..., alias="LOCAL_AGENT_DIR")
    docker_agent_dir: Path = Field(..., alias="DOCKER_AGENT_DIR")

    class Config:
        env_file = "app/config/.env.development"  # Load the .env file from the specified path
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra fields in the .env file (PYTHONPATH, etc.)


settings = Settings()  # Instantiate the settings object
