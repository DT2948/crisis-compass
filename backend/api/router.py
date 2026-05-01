from fastapi import APIRouter

from api.crisis import router as crisis_router
from api.gaps import router as gaps_router
from api.health import router as health_router
from api.response import router as response_router


api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(crisis_router)
api_router.include_router(response_router)
api_router.include_router(gaps_router)
