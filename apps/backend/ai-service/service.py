"""
FastAPI Microservice for YOLOv11 Vision & AI Authenticity Analysis
Exposes REST endpoints for Module 2 Backend ingestion and worker resolution verification.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from PIL import Image
import io
import base64
import time
import uvicorn
import os

from detector import YoloV11CivicDetector
from authenticity import AiImageAuthenticityDetector

app = FastAPI(
    title="Civic AI Vision & Authenticity Service",
    version="1.1.0",
    description="YOLOv11 Civic Hazard Detection, Damage Severity Scoring & AI-Generated Image Detection"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
print("[Service] Initializing YOLOv11 detector and Authenticity analyzer...")
detector = YoloV11CivicDetector(model_name=os.getenv("YOLO_MODEL", "yolo11n.pt"))
authenticity_detector = AiImageAuthenticityDetector()
print("[Service] Engines ready.")


class AnalyzeImageRequest(BaseModel):
    imageBase64: Optional[str] = None
    imageUrl: Optional[str] = None
    categoryHint: Optional[str] = None


class VerifyResolutionRequest(BaseModel):
    beforeImageBase64: str
    afterImageBase64: str
    category: str = "pothole"


def decode_image_base64(b64_string: str) -> Image.Image:
    """Helper to decode base64 data URLs or raw base64 to PIL Image."""
    try:
        if "," in b64_string:
            b64_string = b64_string.split(",", 1)[1]
        img_bytes = base64.b64decode(b64_string)
        img = Image.open(io.BytesIO(img_bytes))
        return img
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {e}")


@app.get("/health")
def health_check():
    import torch
    cuda_available = torch.cuda.is_available() if hasattr(torch, 'cuda') else False
    return {
        "status": "healthy",
        "model": detector.model_name,
        "yoloLoaded": detector.model is not None,
        "cudaAvailable": cuda_available,
        "device": "cuda" if cuda_available else "cpu"
    }


@app.post("/analyze")
def analyze_image(payload: AnalyzeImageRequest):
    """
    Main visual inspection endpoint:
    1. Runs YOLOv11 to detect civic hazard objects and computes Severity Score S (0 - 100).
    2. Runs AI-Generated / Synthetic image detector to audit image authenticity.
    3. Produces annotated bounding box image.
    """
    t0 = time.time()
    
    if not payload.imageBase64 and not payload.imageUrl:
        raise HTTPException(status_code=400, detail="Missing imageBase64 or imageUrl")

    if payload.imageBase64:
        image = decode_image_base64(payload.imageBase64)
    else:
        # Fallback dummy placeholder if imageUrl given
        import urllib.request
        try:
            req = urllib.request.Request(
                payload.imageUrl,
                headers={"User-Agent": "CivicAI/1.0"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                image = Image.open(io.BytesIO(response.read()))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch imageUrl: {e}")

    # 1. Run YOLOv11 Hazard & Severity Detection
    yolo_result = detector.detect_and_score(image, category_hint=payload.categoryHint)

    # 2. Run AI-Generated / Synthetic Image Detection
    auth_result = authenticity_detector.analyze(image)

    duration_ms = int((time.time() - t0) * 1000)

    # Compile structured analysis matching @civic/shared-types AiVisionAnalysis
    analysis = {
        "model": yolo_result["model"],
        "category": yolo_result["category"],
        "visualSeverityScore": yolo_result["visualSeverityScore"],
        "overallConfidence": yolo_result["overallConfidence"],
        "detections": yolo_result["detections"],
        "annotatedImageUrl": yolo_result["annotatedImageUrl"],
        "authenticity": auth_result,
        "processingTimeMs": duration_ms
    }

    warning = None
    if auth_result["isAiGenerated"]:
        warning = f"ALERT: High probability of synthetic/AI-generated image ({auth_result['confidence']*100:.1f}% confidence). Flagged for dispatcher inspection."
    elif auth_result["authenticityLabel"] == "suspicious":
        warning = "WARNING: Image shows suspicious texture or metadata markers. Review recommended."

    return {
        "success": True,
        "analysis": analysis,
        "warningAlert": warning
    }


@app.post("/verify")
def verify_resolution(payload: VerifyResolutionRequest):
    """
    Field worker 'after' resolution photo verification endpoint:
    Compares 'before' and 'after' images, verifying hazard removal.
    """
    before_img = decode_image_base64(payload.beforeImageBase64)
    after_img = decode_image_base64(payload.afterImageBase64)

    verification = detector.verify_resolution(
        before_image=before_img,
        after_image=after_img,
        category=payload.category
    )

    return {
        "success": True,
        "verification": verification
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"[Service] Starting FastAPI server on port {port}...")
    uvicorn.run("service:app", host="0.0.0.0", port=port, reload=False)
