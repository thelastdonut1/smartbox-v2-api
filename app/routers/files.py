import logging
from fastapi import APIRouter, status, Path, UploadFile,File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from werkzeug.utils import secure_filename
import shutil
from enum import Enum
from typing import Annotated
from app.config import settings
from pathlib import Path
from utils import is_safe_path

router = APIRouter(
    prefix="/files",
    tags=["files"]
)


class AgentFile(str, Enum):
    config = "config"
    device = "device"
    log = "log"

    @property
    def path(self):
        """
        Returns the corresponding path for the enum value.
        """
        paths = {"config": "agent.cfg", "device": "device.xml", "log": "logs/agent.log"}
        return paths[self.value]


@router.get("/show/{agent}/{file}")
def show_file(agent: Annotated[str, Path(description="The agent whose file is to be retrieved")],
              file: Annotated[AgentFile, Path(description="The type of file to be retrieved")]):
    """
    Returns the contents of the specified file within the data directory.
    """
    logging.info("Received GET request to files/show")

    full_path = settings.agent_dir / agent / file.path

    logging.info(f"Checking for file: {full_path}")

    if not full_path.is_file():
        logging.error(f"File not found: {full_path}")
        return JSONResponse(status_code=404, content={"message": "File not found"})

    try:
        with open(full_path, "r") as file:
            logging.debug(f"Reading file...")
            content = file.read()
            return JSONResponse(status_code=200, content={"content": content})
    except Exception as e:
        logging.error(f"Error reading file {full_path}: {e}")
        return JSONResponse(status_code=500, content={"message": "Error reading file"})

#PUT: /files/update
# Body = {
#   directory: mc1
#   file: <file>
# }
#TODO: Instead when uploading any .xml file rename it to device.xml. When uploading any .cfg file rename it to agent.cfg.
@router.put("/update")
async def update_file(directory: str = Form(...), file: UploadFile = File(...)):
    logging.info("Received PUT request to /file/update")

    # Validate directory
    if not directory:
        logging.error("Directory parameter is missing.")
        raise HTTPException(status_code=400, detail="Directory parameter is missing.")

    # Validate file
    if not file:
        logging.error("File parameter is missing.")
        raise HTTPException(status_code=400, detail="File parameter is missing.")

    # Sanitize filename to prevent directory traversal attacks
    sanitized_file_name = secure_filename(file.filename)

    # Only allow specific filenames as per the AgentFile enum
    allowed_filenames = {AgentFile.config: "agent.cfg", AgentFile.device: "device.xml"}
    if sanitized_file_name not in allowed_filenames.values():
        raise HTTPException(status_code=400, detail=f"File name {sanitized_file_name} is not allowed.")

    file_path = settings.agent_dir / directory / sanitized_file_name

    # Ensure the path is safe and does not lead outside the intended directory
    if not is_safe_path(settings.agent_dir, directory):
        logging.error(f"Directory {directory} is not a safe path.")
        raise HTTPException(status_code=400, detail=f"Directory {directory} is not a safe path")

    # Create the directory if it doesn't exist
    file_path.parent.mkdir(parents=True, exist_ok=True)

    # Save the file, this will overwrite an existing file with the same name
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return JSONResponse(status_code=200, content={"message": "File updated successfully."})

# DELETE: /files/delete
# Body = {
#    dir: mc1
#    file: agent.cfg
# }
@router.delete("/delete/{agent}/{file}")
def delete_file(agent: str, file: AgentFile):
    """
    Deletes the specified directory and its contents from the data directory.

    :param: agent: The agent whose file is to be retrieved
    :param: file: The type of file to be retrieved
    :return: JSON response indicating 'success' or 'failure' with an error message.
    """
    logging.info("Received DELETE request to files/delete")

    full_path = settings.agent_dir / agent / file.path

    logging.info(f"Checking for file: {full_path}")

    if not full_path.is_file():
        logging.error(f"File not found: {full_path}")
        return JSONResponse(status_code=404, content={"message": "File not found"})

    try:
        full_path.unlink()
        logging.info(f"File was successfully deleted")
        return JSONResponse(status_code=200, content={"message": "File was successfully deleted"})
    except Exception as e:
        logging.error(f"Failed to delete file {full_path}: {e}")
        return JSONResponse(status_code=500, content={"message": f"Failure. {str(e)}"})


# GET: /files/list/mc1
@router.get("/list/{agent}")
async def list_files(agent: str):
    """
    Lists all the files in the specified agent's directory.

    :param agent: The agent whose files are to be listed
    :return: JSON response with a list of files in the specified directory or a failure message.
    """

    full_path = settings.agent_dir / agent

    # May need to check for path traversal here

    logging.info(f"Checking for directory: {full_path}")

    if not full_path.is_dir():
        logging.error(f"Directory was not found: {full_path}")
        return JSONResponse(status_code=404, content={"message": "Directory not found"})

    files = [f.name for f in full_path.iterdir() if f.is_file()]

    logging.info(f"Found {len(files)} files in the specified directory...")
    for file in files:
        logging.info(f"- {file}")

    return JSONResponse(status_code=200, content={"message": files})


# POST: /files/upload
# multipart/form-data
# dir: mc1
# file: <file>
# @router.post("/upload")

# GET: /files/download/mc9/agent.cfg
# @router.get("/download/{dir}/{file}")