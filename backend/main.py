"""
Main entry point for the FastAPI application
This file is created to run the FastAPI app from the project root
"""

import os
import sys
from fastapi import FastAPI

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Now import the app from the fastapi_app
from fastapi_app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)