from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from fastapi_app.api import auth, tasks, bank, rankings

app = FastAPI(title="myTaskBet API", description="Backend for myTaskBet mobile application", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(bank.router, prefix="/api/bank", tags=["bank"])
app.include_router(rankings.router, prefix="/api/rankings", tags=["rankings"])

@app.get("/")
async def root():
    return {"message": "Welcome to myTaskBet API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}