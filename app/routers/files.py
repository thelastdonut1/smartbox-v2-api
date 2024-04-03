from fastapi import APIRouter

router = APIRouter(
    prefix="/files",
    tags=["files"]
)

# GET: /files/show/mc1/agent.cfg
@router.get("/show/{file_path:path}")
def show_file(file_path: str):
    return {"file_path": file_path}

# DELETE: /files/delete
# Body = {
#    dir: mc1
#    file: agent.cfg
# }
# @router.delete("/delete")

# GET: /files/list/mc1
# @router.get("/list/{dir}")

# POST: /files/upload
# multipart/form-data
# dir: mc1
# file: <file>
# @router.post("/upload")

# GET: /files/download/mc9/agent.cfg
# @router.get("/download/{dir}/{file}")