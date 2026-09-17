from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, model_validator


class ContractCreate(BaseModel):
    title: str
    contract_number: str
    category: str
    description: str
    start_date: date
    end_date: date
    department: Optional[str] = None
    assigned_to: Optional[int] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("End date must be on or after start date")
        return self


class ContractUpdate(BaseModel):
    title: Optional[str] = None
    contract_number: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    department: Optional[str] = None
    assigned_to: Optional[int] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date is not None and self.end_date is not None and self.end_date < self.start_date:
            raise ValueError("End date must be on or after start date")
        return self


class ContractStatusUpdate(BaseModel):
    status: str


class ContractAssignment(BaseModel):
    assigned_to: int


class ContractResponse(BaseModel):
    id: int
    title: str
    contract_number: str
    category: str
    description: str
    start_date: date
    end_date: date
    status: str
    created_by: int
    assigned_to: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    department: Optional[str] = None

    class Config:
        from_attributes = True