from fastapi import APIRouter, HTTPException
import os

router = APIRouter()

@router.get("/api/payload/files")
async def get_payload_files():
    """Get list of files in the satellite's onboard storage"""
    try:
        source_dir = "payload_source"
        if not os.path.exists(source_dir):
            return {"files": []}
        
        files = []
        for f in os.listdir(source_dir):
            path = os.path.join(source_dir, f)
            if os.path.isfile(path):
                stats = os.stat(path)
                files.append({
                    "name": f,
                    "size": stats.st_size,
                    "type": f.split('.')[-1],
                    "modified": stats.st_mtime
                })
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
