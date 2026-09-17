from datetime import datetime

from pydantic import BaseModel


class ActivityCreate(BaseModel):
    user_id: int
    contract_id: int
    activity: str


class ActivityResponse(BaseModel):
    id: int
    user_id: int
    contract_id: int
    activity: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True