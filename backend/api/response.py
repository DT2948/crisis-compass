import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models.response_tracking import ResponseTracking
from schemas.crisis import ResponseConfirmationRequest


router = APIRouter(prefix="/response", tags=["response"])


@router.post("/confirm")
def confirm_response(
    request: ResponseConfirmationRequest,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    response = db.scalars(
        select(ResponseTracking).where(
            ResponseTracking.crisis_id == request.crisis_id,
            ResponseTracking.org_id == request.org_id,
        )
    ).first()
    if not response:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Response tracking record not found")

    response.needs_covered = json.dumps(request.needs_covered)
    response.status = "response_confirmed"
    response.confirmed_at = datetime.now(timezone.utc)
    if response.pinged_at is None:
        response.pinged_at = response.confirmed_at

    db.add(response)
    db.commit()

    return {"status": "response_confirmed"}
