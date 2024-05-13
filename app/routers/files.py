import logging
from fastapi import APIRouter, status, Path, UploadFile,File, Form, HTTPException, Depends, Request
from fastapi.responses import JSONResponse, FileResponse
import shutil
from enum import Enum
from typing import Annotated
from app.config import settings
from pathlib import Path
from app.utils import is_safe_path
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(
    prefix="/files",
    tags=["files"]
)

limiter = Limiter(key_func=get_remote_address)  # Define the limiter for this router

class AgentFile(str, Enum):
    config = "config"
    device = "device"
    log = "log"

    @property
    def path(self):
        """
        Returns the corresponding path for the enum value.
        """
        paths = {"config": "agent.cfg", "device": "device.xml", "log": "agent.log"}
        return paths[self.value]


@router.get("/show/{agent}/{file}")
def show_file(agent: Annotated[str, Path(description="The agent whose file is to be retrieved")],
              file: Annotated[AgentFile, Path(description="The type of file to be retrieved")]):
    """
    Returns the contents of the specified file within the data directory.
    """
    logging.info("Received GET request to files/show")

    full_path = settings.docker_agent_dir / agent / file.path

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
#   file: <file> (.xml, .cfg or .log)
# }
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MB or we can adjust accordingly

@router.put("/update")
@limiter.limit("5/minute")  # Apply rate limit: 5 requests per minute per IP
async def update_file(request: Request, directory: str = Form(...), file: UploadFile = File(...)):
    logging.info("Received PUT request to /file/update")

    # Validate directory
    if not directory:
        logging.error("Directory parameter is missing.")
        raise HTTPException(status_code=400, detail="Directory parameter is missing.")

    # Validate file
    if not file:
        logging.error("File parameter is missing.")
        raise HTTPException(status_code=400, detail="File parameter is missing.")
    
    # Check the size of the file
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File size exceeds limit")
    file.file.seek(0)  # Reset file pointer after checking size

    # Extract file extension and determine new filename
    file_extension = Path(file.filename).suffix.lower()
    new_file_name = None

    if file_extension == '.xml':
        new_file_name = AgentFile.device.path # as per AgentFile enum
    elif file_extension == '.cfg':
        new_file_name = AgentFile.config.path # as per AgentFile enum
    elif file_extension == '.log':
        new_file_name = AgentFile.log.path # as per AgentFile enum
    else:
        logging.error(f"File type {file_extension} is not allowed.")
        raise HTTPException(status_code=400, detail=f"File type {file_extension} is not allowed.")

    # Construct full file path
    file_path = Path(settings.docker_agent_dir) / directory / new_file_name

    # Check if path leads outside of the intended directory
    if not is_safe_path(Path(settings.docker_agent_dir), file_path):
        logging.error(f"Attempt to access outside the intended directory with path: {file_path}")
        raise HTTPException(status_code=400, detail="Invalid directory path.")

    # Ensure directory exists
    file_path.parent.mkdir(parents=True, exist_ok=True)

    # Save the file, overwriting any existing file with the same name
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return JSONResponse(status_code=200, content={"message": "File updated successfully."})

# DELETE: /files/delete
# Body = {
#    dir: mc1
#    file: agent.cfg
# }
@router.delete("/delete/{agent}/{file}")
@limiter.limit("3/minute")  # Apply rate limit: 3 requests per minute per IP
def delete_file(request: Request, agent: str, file: AgentFile):
    """
    Deletes the specified directory and its contents from the data directory.

    :param: agent: The agent whose file is to be retrieved
    :param: file: The type of file to be retrieved
    :return: JSON response indicating 'success' or 'failure' with an error message.
    """
    logging.info("Received DELETE request to files/delete")

    full_path = settings.docker_agent_dir / agent / file.path

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

    full_path = settings.docker_agent_dir / agent

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


# GET: /files/download/{agent}/{file}
# multipart/form-data
# dir: mc1
# file: <file>

# GET: /files/download/mc9/agent.cfg
@router.get("/download/{dir}/{file_type}")
async def download_file(dir: str, file_type: AgentFile):
    logging.info("Received GET request for file download")
    full_path = settings.docker_agent_dir / dir / file_type.path
    logging.info(f"Attempting to download file at: {full_path}")

    if not full_path.is_file():
        logging.error(f"File not found: {full_path}")
        raise HTTPException(status_code=404, detail="File not found")
    
    # file_name = full_path.name
    # logging.info(f"File found: {file_name}")

    if file_type == AgentFile.log:
        file_name = "agent.log"
    elif file_type == AgentFile.config:
        file_name = "agent.cfg"
    elif file_type == AgentFile.device:
        file_name = "device.xml"

    print(f"File found: {file_name}")

    return FileResponse(full_path, filename=file_name)