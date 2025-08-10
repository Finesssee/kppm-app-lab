"""
FastAPI backend for Replicate Hub
Handles Replicate API proxy, template CRUD, and auth
"""
import os
import json
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

import httpx
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from supabase import create_client, Client
from dotenv import load_dotenv

# Initialize FastAPI app
app = FastAPI(
    title="Replicate Hub API",
    description="Backend API for the model-centric AI app library",
    version="1.0.0"
)

# CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
load_dotenv()
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Replicate API configuration
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
REPLICATE_BASE_URL = "https://api.replicate.com/v1"

# Pydantic models
class ReplicateRunRequest(BaseModel):
    model: Optional[str] = None
    version: Optional[str] = None
    input: Dict[str, Any]
    wait_mode: str = "block"

class TemplateInputField(BaseModel):
    key: str
    label: str
    type: str
    placeholder: Optional[str] = None
    default_value: Optional[Any] = None
    required: Optional[bool] = False
    helper_text: Optional[str] = None
    options: Optional[List[Dict[str, str]]] = None
    min: Optional[float] = None
    max: Optional[float] = None
    step: Optional[float] = None
    max_length: Optional[int] = None

class TemplateInputSpec(BaseModel):
    fields: List[TemplateInputField]

class TemplateOutputSpec(BaseModel):
    type: str  # "image", "text", "audio", "json", "video"
    multiple: Optional[bool] = False

class CreateTemplateRequest(BaseModel):
    name: str
    description: str
    category: str
    tags: List[str] = []
    cover_image_url: Optional[str] = None
    connector: str = "replicate"
    model: Optional[str] = None
    version: Optional[str] = None
    input_spec: TemplateInputSpec
    output_spec: TemplateOutputSpec
    sample_input: Optional[Dict[str, Any]] = None
    is_public: bool = False

class UpdateTemplateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    cover_image_url: Optional[str] = None
    model: Optional[str] = None
    version: Optional[str] = None
    input_spec: Optional[TemplateInputSpec] = None
    output_spec: Optional[TemplateOutputSpec] = None
    sample_input: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None

# Auth helper
async def get_current_user(request: Request):
    """Extract user from Authorization header"""
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = auth_header.split(" ")[1]
    try:
        user = supabase.auth.get_user(token)
        return user.user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

# Health check
@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "Replicate Hub API"}

# Replicate proxy endpoint
@app.post("/api/replicate/predictions")
async def run_replicate_prediction(request: ReplicateRunRequest):
    """Proxy requests to Replicate API with server-side token"""
    if not REPLICATE_API_TOKEN:
        raise HTTPException(status_code=500, detail="REPLICATE_API_TOKEN not configured")
    
    headers = {
        "Authorization": f"Bearer {REPLICATE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Determine which endpoint to use
    use_run_api = bool(request.model)
    
    async with httpx.AsyncClient() as client:
        try:
            if use_run_api:
                # Use modern run API
                identifier = f"{request.model}:{request.version}" if request.version else request.model
                payload = {
                    "model": identifier,
                    "input": request.input,
                    "wait": {"mode": request.wait_mode}
                }
                response = await client.post(
                    f"{REPLICATE_BASE_URL}/run",
                    headers=headers,
                    json=payload,
                    timeout=120.0
                )
            else:
                # Use predictions API with version
                payload = {
                    "version": request.version,
                    "input": request.input,
                    "wait": 60
                }
                response = await client.post(
                    f"{REPLICATE_BASE_URL}/predictions",
                    headers=headers,
                    json=payload,
                    timeout=120.0
                )
            
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text if hasattr(e.response, 'text') else str(e)
            raise HTTPException(status_code=e.response.status_code, detail=error_detail)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# Template endpoints
@app.get("/api/templates")
async def list_templates(
    category: Optional[str] = None,
    author_id: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 50,
    offset: int = 0
):
    """List public templates with optional filtering"""
    query = supabase.table("user_templates").select("*")
    
    # Apply filters
    query = query.eq("is_public", True)
    if category:
        query = query.eq("category", category)
    if author_id:
        query = query.eq("author_id", author_id)
    if featured is not None:
        query = query.eq("is_featured", featured)
    
    # Apply pagination and ordering
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    
    result = query.execute()
    return {"templates": result.data, "count": len(result.data)}

@app.get("/api/templates/{template_id}")
async def get_template(template_id: str):
    """Get a specific template by ID"""
    result = supabase.table("user_templates").select("*").eq("id", template_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template = result.data[0]
    if not template["is_public"]:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return template

@app.post("/api/templates")
async def create_template(
    template: CreateTemplateRequest,
    current_user = Depends(get_current_user)
):
    """Create a new template"""
    template_data = {
        "name": template.name,
        "description": template.description,
        "category": template.category,
        "tags": template.tags,
        "cover_image_url": template.cover_image_url,
        "connector": template.connector,
        "model": template.model,
        "version": template.version,
        "input_spec": template.input_spec.dict(),
        "output_spec": template.output_spec.dict(),
        "sample_input": template.sample_input,
        "author_id": current_user.id,
        "is_public": template.is_public,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = supabase.table("user_templates").insert(template_data).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create template")
    
    return result.data[0]

@app.get("/api/templates/my")
async def get_my_templates(current_user = Depends(get_current_user)):
    """Get current user's templates"""
    result = supabase.table("user_templates").select("*").eq("author_id", current_user.id).order("created_at", desc=True).execute()
    return {"templates": result.data}

@app.put("/api/templates/{template_id}")
async def update_template(
    template_id: str,
    updates: UpdateTemplateRequest,
    current_user = Depends(get_current_user)
):
    """Update an existing template"""
    # Check if template exists and user owns it
    existing = supabase.table("user_templates").select("*").eq("id", template_id).eq("author_id", current_user.id).execute()
    
    if not existing.data:
        raise HTTPException(status_code=404, detail="Template not found or access denied")
    
    # Build update data
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    for field, value in updates.dict(exclude_unset=True).items():
        if field in ["input_spec", "output_spec"] and value:
            update_data[field] = value.dict() if hasattr(value, 'dict') else value
        else:
            update_data[field] = value
    
    result = supabase.table("user_templates").update(update_data).eq("id", template_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update template")
    
    return result.data[0]

@app.delete("/api/templates/{template_id}")
async def delete_template(
    template_id: str,
    current_user = Depends(get_current_user)
):
    """Delete a template"""
    result = supabase.table("user_templates").delete().eq("id", template_id).eq("author_id", current_user.id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Template not found or access denied")
    
    return {"message": "Template deleted successfully"}

@app.post("/api/templates/{template_id}/run")
async def run_template(template_id: str, input_data: Dict[str, Any]):
    """Run a template with provided input data"""
    # Get template
    template_result = supabase.table("user_templates").select("*").eq("id", template_id).execute()
    
    if not template_result.data:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template = template_result.data[0]
    if not template["is_public"]:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Increment usage count
    supabase.rpc("increment_template_usage", {"template_id": template_id}).execute()
    
    # Run the prediction
    run_request = ReplicateRunRequest(
        model=template["model"],
        version=template["version"],
        input=input_data,
        wait_mode="block"
    )
    
    return await run_replicate_prediction(run_request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
