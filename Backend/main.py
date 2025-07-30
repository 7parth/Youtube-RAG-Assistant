import os
import sys
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'rag'))
from rag_system import YouTubeRAGSystem, YouTubeRAGError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

rag_system = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global rag_system
    
   
    
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if not google_api_key:
        raise ValueError("GOOGLE_API_KEY environment variable required")
    
    rag_system = YouTubeRAGSystem(google_api_key)
    logger.info("RAG system initialized")
    
    yield
    
    logger.info("Application shutdown")

app = FastAPI(
    title="YouTube RAG API",
    description="Query YouTube video transcripts using RAG",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProcessVideoRequest(BaseModel):
    video_url: str
    
    @validator('video_url')
    def validate_video_url(cls, v):
        if not v or not v.strip():
            raise ValueError('Video URL cannot be empty')
        return v.strip()

class QueryRequest(BaseModel):
    question: str
    
    @validator('question')
    def validate_question(cls, v):
        if not v or not v.strip():
            raise ValueError('Question cannot be empty')
        return v.strip()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/process-video")
async def process_video(request: ProcessVideoRequest):
    try:
        success = rag_system.process_video(request.video_url)
        video_info = rag_system.get_video_info()
        
        return {
            "success": success,
            "message": "Video processed successfully",
            "video_info": video_info.__dict__ if video_info else None
        }
        
    except YouTubeRAGError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/query")
async def query_video(request: QueryRequest):
    try:
        answer = rag_system.query(request.question)
        video_info = rag_system.get_video_info()
        
        return {
            "success": True,
            "answer": answer,
            "video_info": video_info.__dict__ if video_info else None
        }
        
    except YouTubeRAGError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query error: {str(e)}")

@app.get("/video-info")
async def get_video_info():
    video_info = rag_system.get_video_info()
    
    if video_info:
        return {"success": True, "video_info": video_info.__dict__}
    else:
        return {"success": False, "message": "No video processed"}

@app.post("/process-and-query")
async def process_and_query(video_url: str, question: str):
    try:
        rag_system.process_video(video_url)
        answer = rag_system.query(question)
        video_info = rag_system.get_video_info()
        
        return {
            "success": True,
            "answer": answer,
            "video_info": video_info.__dict__ if video_info else None
        }
        
    except YouTubeRAGError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)