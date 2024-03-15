from fastapi import FastAPI, Request, Form, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse, FileResponse
from pathlib import Path
import docker
import uvicorn

app = FastAPI()
root = Path(__file__).parents[1] # Project root directory

# Agents directory is sibling of fast_app directory
agent_dir = root / "agents"

# Connect to Docker
client = docker.from_env()

# GET: /file/show?path=mc1/agent.cfg
@app.get("/file/show")
async def show_file(path: str):
    """
    Returns the contents of the specified file within the data directory.
    """

    if ".." in path:
        return JSONResponse(status_code=400, content={"message": "Invalid path"})
    
    full_path = agent_dir / path

    if not full_path.exists():
        return JSONResponse(status_code=404, content={"message": "File not found"})
    
    try:
        return FileResponse(full_path)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})
    

# POST: /file/delete
# Body = {
#    path: mc1/agent.cfg
# }
@app.post("/file/delete")
async def delete_file(path: str = Form(...)):
    """
    Deletes the specified file from the data directory.
    """
    if '..' in path:
        return JSONResponse(content={"result": "Failure. Directory traversal is not allowed"}, status_code=400)
    
    full_path = agent_dir / path
    if not full_path.exists():
        return JSONResponse(content={"result": "Failure. No such file or directory"}, status_code=404)
    if not full_path.is_file():
        return JSONResponse(content={"result": "Failure. Not a file"}, status_code=400)

    try:
        full_path.unlink()
        return {"result": "Success"}
    except Exception as e:
        return JSONResponse(content={"result": f"Failure. {str(e)}"}, status_code=500)
    

# GET: /file/list?dir=mc1
@app.get("/file/list")
async def file_list(dir: str):
    """
    Lists all files in the specified directory within the data directory.
    """
    if '..' in dir:
        return JSONResponse(content={"result": "Failure. Directory traversal is not allowed"}, status_code=400)
    
    full_path = agent_dir / dir
    if not full_path.exists() or not full_path.is_dir():
        return JSONResponse(content={"result": "Failure. No such directory or not a directory"}, status_code=404)

    files = [f.name for f in full_path.iterdir() if f.is_file()]
    return files


# POST: /upload
# multipart/form-data
# dir: mc1
# file: <file>
@app.post("/upload")
async def upload(dir: str = Form(...), file: UploadFile = File(...)):
    """
    Uploads a file to a specified directory within the data directory.
    """
    if '..' in dir:
        return JSONResponse(content={"result": "Failure. Directory traversal is not allowed"}, status_code=400)

    full_path = agent_dir / dir
    full_path.mkdir(parents=True, exist_ok=True)

    file_path = full_path / file.filename
    with open(file_path, "wb") as buffer:
        data = await file.read()
        buffer.write(data)

    return {"result": "Success."}


# GET: /download?filepath=mc1/agent.cfg
@app.get("/download")
async def download(filepath: str):
    """
    Initiates a download of the specified file from the data directory.
    """
    if '..' in filepath:
        return JSONResponse(content={"result": "Failure. Directory traversal is not allowed"}, status_code=400)

    full_path = agent_dir / filepath
    if not full_path.exists():
        return JSONResponse(content={"result": "Failure. No such file"}, status_code=404)

    return FileResponse(path=full_path, filename=full_path.name, media_type='application/octet-stream')


# GET: /agent/list
@app.get("/agent/list")
async def agent_list():
    """
    Lists all agent folders within the data directory.
    """
    agents = [f.name for f in agent_dir.iterdir() if f.is_dir()]
    return agents


# GET: /agent/start?agent=mc1
@app.get("/agent/start")
def start_agent(agent: str):    
    return JSONResponse(content={"result": "Not yet implemented"}, status_code=200)


# GET: /agent/stop?agent=mc1
@app.get("/agent/stop")
def stop_agent(agent: str):
    return JSONResponse(content={"result": "Not yet implemented"}, status_code=200)


@app.get("/agents/running")
async def running_agents():
    """
    Lists all agents currently running.
    """
    return JSONResponse(content={"result": "Not yet implemented"}, status_code=200)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
